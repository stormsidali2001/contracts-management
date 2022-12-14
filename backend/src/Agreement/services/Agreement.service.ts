import {Injectable , BadRequestException, NotFoundException, Logger, OnModuleInit} from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { CronJob } from 'cron';
import { CreateAgreementDTO, ExecuteAgreementDTO, FindAllAgreementsDTO } from 'src/core/dtos/agreement.dto';
import { AgreementEntity } from 'src/core/entities/Agreement.entity';
import { AgreementExecJobsEntity } from 'src/core/entities/agreementExecJobs';
import { UserEntity } from 'src/core/entities/User.entity';
import { AgreementStatus } from 'src/core/types/agreement-status.enum';
import { AgreementType } from 'src/core/types/agreement-type.enum';
import { Entity } from 'src/core/types/entity.enum';
import { Operation } from 'src/core/types/operation.enum';
import { PaginationResponse } from 'src/core/types/paginationResponse.interface';
import { UserRole } from 'src/core/types/UserRole.enum';
import { DirectionService } from 'src/direction/services/direction.service';
import { StatsParamsDTO } from 'src/statistics/models/statsPramsDTO.interface';
import { UserService } from 'src/user/user.service';
import {  Repository } from 'typeorm';
import { NotificationBody, UserNotificationService } from '../../user/user-notification.service';
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
        private readonly userService:UserService

    ){}
    async onModuleInit() {
        const format = (d:Date)=>{
            const newD = new Date(d);
            return newD.toISOString().replace(/T[0-9:.Z]*/g,"");
        
        }
        this.logger.log('initializing the percisted agreement related cron jobs:')
        const percistedJobs = await this.agreementExecJobsEntity.find();
        for( let pJob of percistedJobs){
            const d1 =new Date(pJob.date) ;
            const d2 = new Date(format(new Date()));
           
            this.logger.log(`trying to refresh the job: ${pJob.name} date: ${JSON.stringify(pJob.date)} d1 ${JSON.stringify(d1)} d2 ${JSON.stringify(d2)}`)
            if(d1.getUTCMilliseconds() < d2.getUTCMilliseconds()){

                    await this.agreementExecJobsEntity.delete({name:pJob.name})
                    this.logger.log(`the job  ${pJob.name} expired hence deleted.`)
                    continue;
                }
                if(d1.getUTCMilliseconds() === d2.getUTCMilliseconds()){
                    

                    d1.setHours(d1.getHours(),d1.getMinutes()+5,d1.getSeconds()+5,d1.getMilliseconds())
                    await this.agreementRepository.update({id:pJob.agreementId},{status:pJob.newStatus})
                    await this.agreementExecJobsEntity.delete({name:pJob.name});
                    this.logger.log(`the job  ${pJob.name} expired hence deleted.`)
                    continue;
                }
               
                await this.#addAgreementCronJob(pJob.name,d1,async ()=>{
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
      

        const agreementDb = await this.agreementRepository.findOneBy({number:agreementData.number})
        Logger.debug(JSON.stringify(agreementDb),'kakakak')
        if(agreementDb) throw new BadRequestException("le numero est deja reserver")
        const res= await  this.agreementRepository.save({...agreementData,direction,departement,vendor});
        await this.userNotificationService.sendToUsersInDepartement(departement.id,`${agreement.type === AgreementType.CONTRACT ? "un nouveau contrat est ajoute a votre departement":"une nouvelle convension a etee ajoutee a votre departement"} avec le fournisseur: ${vendor.company_name}`)
        const extraMessage = departement && direction ?`au ${departement.abriviation} de ${direction.abriviation}`:"";

        const juridicals = await this.userService.findAllBy({role:UserRole.JURIDICAL});
        const notifications:NotificationBody[] = juridicals.map(j=>({message:`${agreement.type === AgreementType.CONTRACT ? "un nouveau contrat est ajoute ":"une nouvelle convension a etee ajoutee "} ${extraMessage} avec le fournisseur: ${vendor.company_name}`,userId:j.id}));
        await this.userNotificationService.sendNotifications(notifications);
        await this.userNotificationService.sendNewEventaToConnectedUsersWithContrainsts({
            entity:res.type.toUpperCase() as unknown as Entity,
            operation:Operation.INSERT,
            entityId:res.id,
            departementId:departement.id,
            directionId:direction.id,
            departementAbriviation:departement.abriviation,
            directionAbriviation:direction.abriviation,
            createdAt:new Date()
        },departement.id)
        await this.userNotificationService.IncrementAgreementsStats({
            operation:Operation.INSERT,
            type:res.type.toUpperCase() as unknown as Entity,
        },departement.id)
        return res;
    }

    async findAll({
            agreementType,
            amount_max,
            amount_min,
            departementId,
            directionId,
            end_date,
            limit,
            offset,
            orderBy,
            searchQuery,
            start_date,
            status,
            vendorId
        }:FindAllAgreementsDTO,userId:string):Promise<PaginationResponse<AgreementEntity>>{
            
        const user = await this.userService.findBy({id:userId});
        let query =    this.agreementRepository.createQueryBuilder('ag')
        .where("ag.type = :type",{type:agreementType})
        .skip(offset)
        .take(limit);

        if(user.role === UserRole.EMPLOYEE){
            query = query 
            .andWhere('ag.departementId = :departementId',{departementId:user.departementId})
            .andWhere('ag.directionId = :directionId',{directionId:user.directionId})
        }

        if(departementId && directionId &&(user.role === UserRole.ADMIN || user.role === UserRole.JURIDICAL)){
            query = query 
            .andWhere('ag.departementId = :departementId',{departementId})
            .andWhere('ag.directionId = :directionId',{directionId})
            
        }
        Logger.debug(`start date m end date ${JSON.stringify({a:!!start_date,b:!!end_date,c: !!start_date && !!end_date})}`,'kkkkkkkkkkkkaaaaaaaa')
        if(start_date && end_date){
            query = query
            .andWhere('ag.createdAt >= :start_date and ag.createdAt <= :end_date',{start_date,end_date});
        }
        if(amount_min && amount_max){
            query = query
            .andWhere('ag.amount >= :amount_min and ag.amount <= :amount_max',{amount_min,amount_max});
        }
        if(status){
            query = query
            .andWhere('ag.status = :status',{status});
        }
        if(vendorId){
            query = query 
            .andWhere('ag.vendorId = :vendorId',{vendorId})
        }
        if(searchQuery && searchQuery.length >= 2){
            query = query.andWhere(`
            (
                MATCH(ag.number) AGAINST ('${searchQuery}' IN BOOLEAN MODE)
                or MATCH(ag.object) AGAINST ('${searchQuery}' IN BOOLEAN MODE)
                or MATCH(ag.observation) AGAINST ('${searchQuery}' IN BOOLEAN MODE)
            )`)
          
           
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
        const agreement = await this.agreementRepository.createQueryBuilder('ag')
        .where("ag.id = :agreementId",{agreementId})
        .leftJoinAndSelect('ag.direction','dr')
        .leftJoinAndSelect('ag.departement','dp')
        .getOne();
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
            await this.agreementExecJobsEntity.save({name:cronJobName,agreementId:agreement.id,date:execution_end_date,newStatus:AgreementStatus.EXECUTED_WITH_DELAY})
            this.#addAgreementCronJob(cronJobName,execution_end_date, async()=>{
                await this.agreementRepository.update({id:agreement.id},{status:AgreementStatus.EXECUTED_WITH_DELAY})
                await this.agreementExecJobsEntity.delete({name:cronJobName});
            })
        }else{
            agreement.status = AgreementStatus.IN_EXECUTION;
            const cronJobName = `agreement:${agreement.type}:${agreement.id}`;
            await this.agreementExecJobsEntity.save({name:cronJobName,agreementId:agreement.id,date:execution_end_date,newStatus:AgreementStatus.EXECUTED})
            this.#addAgreementCronJob(cronJobName,execution_end_date, async()=>{
                await this.agreementRepository.update({id:agreement.id},{status:AgreementStatus.EXECUTED})
                await this.agreementExecJobsEntity.delete({name:cronJobName});
            })
        }
        agreement.execution_start_date = execution_start_date;
        agreement.execution_end_date = execution_end_date;
        agreement.observation = observation;
        
        await this.userNotificationService.sendNewEventaToConnectedUsersWithContrainsts(
            {entity:agreement.type.toUpperCase() as unknown as Entity,
                operation:Operation.EXECUTE,
                entityId:agreement.id,
                departementId:agreement.departementId,
                directionId:agreement.directionId,
                createdAt:new Date(),
                departementAbriviation:agreement?.departement?.abriviation ?? "",
                directionAbriviation:agreement?.direction?.abriviation ?? ""
            },
            agreement.departementId
            )
        return this.agreementRepository.save(agreement)

    }
    async getAgreementsStats({startDate,endDate}:StatsParamsDTO,user:UserEntity){
        let query =  this.agreementRepository.createQueryBuilder('ag')
        .select('count(ag.id)','total')
        .groupBy('ag.status')
        .addSelect('ag.status','status')

        Logger.debug(user,'getAgreementsStats')
        if(user.role === UserRole.EMPLOYEE){
            query = query.where('ag.departementId = :departementId and ag.directionId = :directionId',{departementId:user.departementId,directionId:user.directionId})
        }
        if(startDate){
            query = query.andWhere('ag.createdAt >= :startDate',{startDate})
        }
        if(endDate){
            query = query.andWhere('ag.createdAt <= :endDate',{endDate})
        }


        const status = await query.getRawMany();


        const statusReponse = {}
        Object.values(AgreementStatus).forEach(v=>{
            statusReponse[v] = 0;
        })
        status.forEach(st=>{
            statusReponse[st.status] =parseInt(st.total);
        })

        let typesQuery =  this.agreementRepository.createQueryBuilder('ag')
        .select('count(ag.id)','total')
        .groupBy('ag.type')
        .addSelect('ag.type','type');

        
        if(user.role === UserRole.EMPLOYEE){
            typesQuery = typesQuery.where('ag.departementId = :departementId and ag.directionId = :directionId',{departementId:user.departementId,directionId:user.directionId})
        }
        
        const types = await typesQuery.getRawMany();;
        const typesResponse = {}
        Object.values(AgreementType).forEach(v=>{
            typesResponse[v] = 0;
        })
        types.forEach(t=>{
            typesResponse[t.type] = parseInt(t.total);
        })


        const topDirections = await this.directionService.getTopDirection();
        return {
            status:statusReponse,
            types:typesResponse,
            topDirections
        }

    }
    async #addAgreementCronJob(name:string,date:Date, cb:()=>void){
     
        const job = new CronJob(new Date(date),()=>{
            cb();
        })
        this.schdulerRegistry.addCronJob(name,job);
        job.start();
        this.logger.warn(`the job : ${name} is running`);
    }
}