import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  OnModuleInit,
  Inject,
} from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { v4 as uuidv4 } from 'uuid';
import {
  Agreement,
  AgreementTypeEnum,
  AgreementExecutionService,
  ContractPeriod,
  ExecutionPeriod,
} from '@contracts/domain';
import {
  CreateAgreementDTO,
  ExecuteAgreementDTO,
  FindAllAgreementsDTO,
} from 'src/core/dtos/agreement.dto';
import { AgreementEntity } from 'src/core/entities/Agreement.entity';
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
import {
  NotificationBody,
  UserNotificationService,
} from '../../user/user-notification.service';
import { VendorService } from './vendor.service';
import { TypeOrmAgreementRepository } from '../typeorm-agreement.repository';

@Injectable()
export class AgreementService implements OnModuleInit {
  private readonly logger = new Logger(AgreementService.name);
  constructor(
    @Inject('IAgreementRepository')
    private readonly agreementRepo: TypeOrmAgreementRepository,
    private readonly vendorService: VendorService,
    private readonly directionService: DirectionService,
    private readonly userNotificationService: UserNotificationService,
    private readonly schdulerRegistry: SchedulerRegistry,
    private readonly userService: UserService,
  ) {}

  async onModuleInit() {
    const format = (d: Date) => {
      const newD = new Date(d);
      return newD.toISOString().replace(/T[0-9:.Z]*/g, '');
    };
    this.logger.log('initializing the percisted agreement related cron jobs:');
    const percistedJobs = await this.agreementRepo.findAllExecJobs();
    for (let pJob of percistedJobs) {
      const d1 = new Date(pJob.date);
      const d2 = new Date(format(new Date()));

      this.logger.log(
        `trying to refresh the job: ${pJob.name} date: ${JSON.stringify(
          pJob.date,
        )} d1 ${JSON.stringify(d1)} d2 ${JSON.stringify(d2)}`,
      );
      if (d1.getUTCMilliseconds() < d2.getUTCMilliseconds()) {
        await this.agreementRepo.deleteExecJob(pJob.name);
        this.logger.log(`the job  ${pJob.name} expired hence deleted.`);
        continue;
      }
      if (d1.getUTCMilliseconds() === d2.getUTCMilliseconds()) {
        d1.setHours(
          d1.getHours(),
          d1.getMinutes() + 5,
          d1.getSeconds() + 5,
          d1.getMilliseconds(),
        );
        await this.agreementRepo.updateStatus(pJob.agreementId, pJob.newStatus);
        await this.agreementRepo.deleteExecJob(pJob.name);
        this.logger.log(`the job  ${pJob.name} expired hence deleted.`);
        continue;
      }

      await this.#addAgreementCronJob(pJob.name, d1, async () => {
        await this.agreementRepo.updateStatus(pJob.agreementId, pJob.newStatus);
        await this.agreementRepo.deleteExecJob(pJob.name);
      });
    }
    this.logger.log(`${percistedJobs.length} percisted jobs are running`);
  }

  async createAgreement(dto: CreateAgreementDTO): Promise<AgreementEntity> {
    const { directionId, departementId, vendorId, ...agreementData } = dto;

    // Validate domain invariants early
    Agreement.create({
      id: uuidv4(),
      number: dto.number,
      type: (dto.type ??
        AgreementType.CONTRACT) as unknown as AgreementTypeEnum,
      object: dto.object,
      amount: dto.amount,
      signatureDate: new Date(dto.signature_date),
      expirationDate: new Date(dto.expiration_date),
      url: dto.url,
      observation: undefined,
      vendorId,
      directionId,
      departementId,
    });

    const [direction, vendor] = await Promise.all([
      this.directionService.findDirectionWithDepartement(
        directionId,
        departementId,
      ),
      this.vendorService.findBy({ id: vendorId }),
    ]);
    if (!direction) {
      throw new BadRequestException('direction not found');
    }
    const departement =
      direction.departements.length > 0 ? direction.departements[0] : null;
    if (!departement) {
      throw new BadRequestException('departement is not in direction');
    }
    if (!vendor) {
      throw new BadRequestException('cound not find the vendor');
    }

    const agreementDb = await this.agreementRepo.findOneByNumber(
      agreementData.number,
    );
    Logger.debug(JSON.stringify(agreementDb), 'kakakak');
    if (agreementDb)
      throw new BadRequestException('le numero est deja reserver');

    const res = await this.agreementRepo.saveEntity({
      ...agreementData,
      direction,
      departement,
      vendor,
    });

    await this.userNotificationService.sendToUsersInDepartement(
      departement.id,
      `${
        dto.type === AgreementType.CONTRACT
          ? 'un nouveau contrat est ajoute a votre departement'
          : 'une nouvelle convension a etee ajoutee a votre departement'
      } avec le fournisseur: ${vendor.company_name}`,
    );
    const extraMessage =
      departement && direction
        ? `au ${departement.abriviation} de ${direction.abriviation}`
        : '';

    const juridicals = await this.userService.findAllBy({
      role: UserRole.JURIDICAL,
    });
    const notifications: NotificationBody[] = juridicals.map((j) => ({
      message: `${
        dto.type === AgreementType.CONTRACT
          ? 'un nouveau contrat est ajoute '
          : 'une nouvelle convension a etee ajoutee '
      } ${extraMessage} avec le fournisseur: ${vendor.company_name}`,
      userId: j.id,
    }));
    await this.userNotificationService.sendNotifications(notifications);
    await this.userNotificationService.sendNewEventaToConnectedUsersWithContrainsts(
      {
        entity: res.type.toUpperCase() as unknown as Entity,
        operation: Operation.INSERT,
        entityId: res.id,
        departementId: departement.id,
        directionId: direction.id,
        departementAbriviation: departement.abriviation,
        directionAbriviation: direction.abriviation,
        createdAt: new Date(),
      },
      departement.id,
    );
    await this.userNotificationService.IncrementAgreementsStats(
      {
        operation: Operation.INSERT,
        type: res.type.toUpperCase() as unknown as Entity,
      },
      departement.id,
    );
    return res;
  }

  async findAll(
    {
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
      vendorId,
    }: FindAllAgreementsDTO,
    userId: string,
  ): Promise<PaginationResponse<AgreementEntity>> {
    const user = await this.userService.findBy({ id: userId });
    return this.agreementRepo.findPaginatedWithFilters(
      {
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
        vendorId,
      },
      user,
    );
  }

  async findById(
    id: string,
    agrreementType: AgreementType = AgreementType.CONTRACT,
  ) {
    return this.agreementRepo.findByIdWithRelations(id, agrreementType);
  }

  async executeAgreement(execData: ExecuteAgreementDTO) {
    const {
      observation = '',
      execution_start_date,
      execution_end_date,
      agreementId,
    } = execData;
    const agreement = await this.agreementRepo.findAgreementForExecution(
      agreementId,
    );
    if (!agreement) {
      throw new NotFoundException("l'accord specifiee n'es pas touvee");
    }

    // Use domain service for execution validation and decision
    const contractPeriod = new ContractPeriod({
      signatureDate: new Date(agreement.signature_date),
      expirationDate: new Date(agreement.expiration_date),
    });
    const executionPeriod = new ExecutionPeriod({
      startDate: new Date(execution_start_date),
      endDate: new Date(execution_end_date),
    });

    // validateExecutionPeriod throws if start < signatureDate
    AgreementExecutionService.validateExecutionPeriod(
      contractPeriod,
      executionPeriod,
    );
    // computeExecutionDecision determines IN_EXECUTION vs IN_EXECUTION_WITH_DELAY
    const { inExecutionStatus, targetStatus } =
      AgreementExecutionService.computeExecutionDecision(
        contractPeriod,
        executionPeriod,
      );

    const cronJobName = `agreement:${agreement.type}:${agreement.id}`;
    agreement.status = inExecutionStatus as unknown as AgreementStatus;
    await this.agreementRepo.saveExecJob({
      name: cronJobName,
      agreementId: agreement.id,
      date: execution_end_date,
      newStatus: targetStatus as unknown as AgreementStatus,
    });
    this.#addAgreementCronJob(cronJobName, execution_end_date, async () => {
      await this.agreementRepo.updateStatus(
        agreement.id,
        targetStatus as unknown as AgreementStatus,
      );
      await this.agreementRepo.deleteExecJob(cronJobName);
    });

    agreement.execution_start_date = execution_start_date;
    agreement.execution_end_date = execution_end_date;
    agreement.observation = observation;

    await this.userNotificationService.sendNewEventaToConnectedUsersWithContrainsts(
      {
        entity: agreement.type.toUpperCase() as unknown as Entity,
        operation: Operation.EXECUTE,
        entityId: agreement.id,
        departementId: agreement.departementId,
        directionId: agreement.directionId,
        createdAt: new Date(),
        departementAbriviation: agreement?.departement?.abriviation ?? '',
        directionAbriviation: agreement?.direction?.abriviation ?? '',
      },
      agreement.departementId,
    );
    return this.agreementRepo.saveEntity(agreement);
  }

  async getAgreementsStats(
    { startDate, endDate }: StatsParamsDTO,
    user: UserEntity,
  ) {
    const status = await this.agreementRepo.getAgreementsStatusStats(
      { startDate, endDate },
      user,
    );
    const statusReponse = {};
    Object.values(AgreementStatus).forEach((v) => {
      statusReponse[v] = 0;
    });
    status.forEach((st) => {
      statusReponse[st.status] = parseInt(st.total);
    });

    const types = await this.agreementRepo.getAgreementsTypeStats(user);
    const typesResponse = {};
    Object.values(AgreementType).forEach((v) => {
      typesResponse[v] = 0;
    });
    types.forEach((t) => {
      typesResponse[t.type] = parseInt(t.total);
    });

    const topDirections = await this.directionService.getTopDirection();
    return {
      status: statusReponse,
      types: typesResponse,
      topDirections,
    };
  }

  async #addAgreementCronJob(name: string, date: Date, cb: () => void) {
    const job = new CronJob(new Date(date), () => {
      cb();
    });
    this.schdulerRegistry.addCronJob(name, job);
    job.start();
    this.logger.warn(`the job : ${name} is running`);
  }
}
