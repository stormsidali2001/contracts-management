import {Injectable , BadRequestException, NotFoundException, Logger, OnModuleInit} from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { CronJob } from 'cron';
import { CreateAgreementDTO, ExecuteAgreementDTO } from 'src/core/dtos/agreement.dto';
import { AgreementEntity } from 'src/core/entities/Agreement.entity';
import { AgreementExecJobsEntity } from 'src/core/entities/agreementExecJobs';
import { DepartementEntity } from 'src/core/entities/Departement.entity';
import { DirectionEntity } from 'src/core/entities/Direction.entity';
import { VendorEntity } from 'src/core/entities/Vendor.entity';
import { AgreementStatus } from 'src/core/types/agreement-status.enum';
import { AgreementType } from 'src/core/types/agreement-type.enum';
import { PaginationResponse } from 'src/core/types/paginationResponse.interface';
import { DirectionService } from 'src/direction/services/direction.service';
import {  Repository } from 'typeorm';
import { UserNotificationService } from '../../user/user-notification.service';
import { VendorService } from './vendor.service';


@Injectable()
export class AgreementService implements OnModuleInit{
    private readonly logger = new Logger(AgreementService.name)
    constructor(
        @InjectRepository(AgreementEntity) private readonly agreementRepository:Repository<AgreementEntity>,
        @InjectRepository(AgreementExecJobsEntity) private readonly agreementExecJobsEntity:Repository<AgreementExecJobsEntity>,
        private readonly vendorService:VendorService,
        private readonly directionService:DirectionService,
        private readonly userNotificationService:UserNotificationService,
        private readonly schdulerRegistry:SchedulerRegistry,

    ){}
    async onModuleInit() {
        this.logger.log('initializing the percisted agreement related cron jobs:')
        const percistedJobs = await this.agreementExecJobsEntity.find();
        for( let pJob of percistedJobs){
          
                if(pJob.date > new Date(Date.now())){
                    await this.agreementExecJobsEntity.delete({name:pJob.name})
                    continue;
                }
                this.#addAgreementCronJob(pJob.name,pJob.date,async ()=>{
                    await this.agreementRepository.update({id:pJob.agreementId},{status:pJob.newStatus})
                    await this.agreementExecJobsEntity.delete({name:pJob.name});
                })
            
        }
        this.logger.log(`${percistedJobs.length} percisted jobs are running`)
    }
    async createAgreement(agreement:CreateAgreementDTO):Promise<AgreementEntity>{
        const {directionId , departementId , vendorId, ...agreementData} = agreement;
        if(agreementData.signature_date > agreementData.expiration_date){
            throw new BadRequestException("la date d'expiration de contrat doit etre apres la date de la signature");
        }
        const [direction,vendor] = await Promise.all([
                        this.directionService.findDirectionWithDepartement(directionId,departementId),
                        this.vendorService.findBy({id:vendorId})
                 ]);
        if(!direction){
            throw new  BadRequestException("direction not found");
        }
        const departement = direction.departements.length > 0 ? direction.departements[0]:null;
        if(!departement){
            throw new  BadRequestException("departement is not in direction");
        }
       
        if(!vendor){
            throw new  BadRequestException("cound not find the vendor");
        }
      

        const res= await  this.agreementRepository.save({...agreementData,direction,departement,vendor});
        await this.userNotificationService.sendToUsersInDepartement(departement.id,`${agreement.type === AgreementType.CONTRACT ? "un nouveau contrat est ajoute a votre departement":"une nouvelle convension a etee ajoutee a votre departement"} avec le fournisseur: ${vendor.company_name}`)
        return res;
    }

    async findAll(offset:number = 0 ,limit:number = 10 ,orderBy:string = undefined,agreementType:AgreementType,searchQuery:string = undefined):Promise<PaginationResponse<AgreementEntity>>{
        let query =    this.agreementRepository.createQueryBuilder('ag')
        .where("ag.type = :type",{type:agreementType})
        .skip(offset)
        .take(limit);

        if(searchQuery && searchQuery.length >= 2){
            query = query.where(`MATCH(ag.number) AGAINST ('${searchQuery}' IN BOOLEAN MODE)`)
            .orWhere(`MATCH(ag.object) AGAINST ('${searchQuery}' IN BOOLEAN MODE)`)
            .orWhere(`MATCH(ag.observation) AGAINST ('${searchQuery}' IN BOOLEAN MODE)`)
           
        }
        if(orderBy && orderBy!== 'type'){
            query = query.orderBy(`${orderBy}`);
        }
        const res = await query.getManyAndCount();

        return {
            total:res[1],
            data:res[0]
        }
    } 
    
    async findById(id:string,agrreementType:AgreementType = AgreementType.CONTRACT){
        return await this.agreementRepository.createQueryBuilder("ag")
        .where("ag.type = :agrreementType",{agrreementType})
        .andWhere("ag.id = :id",{id})
        .leftJoinAndSelect("ag.direction","direction")
        .leftJoinAndSelect("ag.departement","departement")
        .leftJoinAndSelect("ag.vendor","vendor")
        .getOne();
    }
    async executeAgreement(execData:ExecuteAgreementDTO){
        const {observation = '',execution_start_date,execution_end_date,agreementId} = execData;
        const agreement = await this.agreementRepository.findOneBy({id:agreementId});
        if(!agreement){
            throw new NotFoundException("l'accord specifiee n'es pas touvee")
        }
        if(new Date(execution_start_date) >= new Date(execution_end_date) ){
            throw new  BadRequestException("l'intervalle d'execution est non valide")
        }
        if(new Date(execution_start_date) < new Date(agreement.signature_date) ){
            throw new  BadRequestException("la date de debut d'execution dout etre supperieur ou rgale a la date de signature");
        }
        if(new Date(execution_start_date) >= new Date(agreement.expiration_date)){
            agreement.status = AgreementStatus.IN_EXECUTION_WITH_DELAY;
            const cronJobName = `agreement:${agreement.type}:${agreement.id}`;
            await this.agreementExecJobsEntity.save({name:cronJobName,agreementId:agreement.id,date:agreement.execution_end_date,newStatus:AgreementStatus.EXECUTED_WITH_DELAY})
            this.#addAgreementCronJob(cronJobName,agreement.execution_end_date, async()=>{
                await this.agreementRepository.update({id:agreement.id},{status:AgreementStatus.EXECUTED_WITH_DELAY})
                await this.agreementExecJobsEntity.delete({name:cronJobName});
            })
        }else{
            agreement.status = AgreementStatus.IN_EXECUTION;
            const cronJobName = `agreement:${agreement.type}:${agreement.id}`;
            await this.agreementExecJobsEntity.save({name:cronJobName,agreementId:agreement.id,date:agreement.execution_end_date,newStatus:AgreementStatus.EXECUTED})
            this.#addAgreementCronJob(cronJobName,agreement.execution_end_date, async()=>{
                await this.agreementRepository.update({id:agreement.id},{status:AgreementStatus.EXECUTED})
                await this.agreementExecJobsEntity.delete({name:cronJobName});
            })
        }
        agreement.execution_start_date = execution_start_date;
        agreement.execution_end_date = execution_end_date;
        agreement.observation = observation;
        return this.agreementRepository.save(agreement)
    }
    async getAgreementsStats(){
        const status = await this.agreementRepository.createQueryBuilder('ag')
        .select('count(ag.id)','total')
        .groupBy('ag.status')
        .addSelect('ag.status','status')
        .getRawMany();

        const types = await this.agreementRepository.createQueryBuilder('ag')
        .select('count(ag.id)','total')
        .groupBy('ag.type')
        .addSelect('ag.type','type')
        .getRawMany();

        const topDirections = await this.directionService.getTopDirection();
       
        return {
            status:status.map(st=>({...st,total:parseInt(st.total)})),
            types:types.map(t=>({...t,total:parseInt(t.total)})),
            topDirections
        }

    }
    async #addAgreementCronJob(name:string,date:Date, cb:()=>void){
        const job = new CronJob(date,()=>{
            cb();
        })
        this.schdulerRegistry.addCronJob(name,job);
        job.start();
        this.logger.warn(`the job : ${name} is running`);
    }
}