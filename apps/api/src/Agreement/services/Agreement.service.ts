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
import {
  CreateAgreementDTO,
  ExecuteAgreementDTO,
  FindAllAgreementsDTO,
} from 'src/core/dtos/agreement.dto';
import { User } from 'src/user/domain/user';
import { UserEntity } from 'src/core/entities/User.entity';
import { AgreementStatus } from 'src/core/types/agreement-status.enum';
import { AgreementType } from 'src/core/types/agreement-type.enum';
import { Entity } from 'src/core/types/entity.enum';
import { Operation } from 'src/core/types/operation.enum';
import { PaginationResponse } from 'src/core/types/paginationResponse.interface';
import { DirectionService } from 'src/direction/services/direction.service';
import { StatsParamsDTO } from 'src/statistics/models/statsPramsDTO.interface';
import { UserService } from 'src/user/user.service';
import { UserRole } from 'src/core/types/UserRole.enum';
import {
  NotificationBody,
  UserNotificationService,
} from '../../user/user-notification.service';
import { AgreementView } from 'src/core/views/agreement.view';
import { Agreement } from '../domain/agreement';
import {
  IAgreementRepository,
  AGREEMENT_REPOSITORY,
} from '../domain/agreement.repository';
import { VendorService } from './vendor.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AgreementService implements OnModuleInit {
  private readonly logger = new Logger(AgreementService.name);
  constructor(
    @Inject(AGREEMENT_REPOSITORY)
    private readonly agreementRepository: IAgreementRepository,
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
    const percistedJobs = await this.agreementRepository.findAllExecJobs();
    for (const pJob of percistedJobs) {
      const d1 = new Date(pJob.date);
      const d2 = new Date(format(new Date()));

      this.logger.log(
        `trying to refresh the job: ${pJob.name} date: ${JSON.stringify(
          pJob.date,
        )} d1 ${JSON.stringify(d1)} d2 ${JSON.stringify(d2)}`,
      );
      if (d1.getUTCMilliseconds() < d2.getUTCMilliseconds()) {
        await this.agreementRepository.deleteExecJob(pJob.name);
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
        await this.agreementRepository.updateStatus(pJob.agreementId, pJob.newStatus);
        await this.agreementRepository.deleteExecJob(pJob.name);
        this.logger.log(`the job  ${pJob.name} expired hence deleted.`);
        continue;
      }

      await this.#addAgreementCronJob(pJob.name, d1, async () => {
        await this.agreementRepository.updateStatus(pJob.agreementId, pJob.newStatus);
        await this.agreementRepository.deleteExecJob(pJob.name);
      });
    }
    this.logger.log(`${percistedJobs.length} percisted jobs are running`);
  }

  async createAgreement(dto: CreateAgreementDTO): Promise<AgreementView> {
    const { directionId, departementId, vendorId, ...agreementData } = dto;

    if (agreementData.signature_date > agreementData.expiration_date) {
      throw new BadRequestException(
        "la date d'expiration de contrat doit etre apres la date de la signature",
      );
    }

    const [direction, vendor] = await Promise.all([
      this.directionService.findWithDepartement(directionId, departementId),
      this.vendorService.findBy({ id: vendorId }),
    ]);

    if (!direction) throw new BadRequestException('direction not found');
    const departement =
      direction.departements.length > 0 ? direction.departements[0] : null;
    if (!departement)
      throw new BadRequestException('departement is not in direction');
    if (!vendor) throw new BadRequestException('cound not find the vendor');

    const existing = await this.agreementRepository.findOneByNumber(
      agreementData.number,
    );
    if (existing) throw new BadRequestException('le numero est deja reserver');

    const agreement = Agreement.create({
      id: uuid(),
      ...agreementData,
      directionId: direction.id,
      departementId: departement.id,
      vendorId: vendor.id,
    });

    const saved = await this.agreementRepository.save(agreement);

    await this.userNotificationService.sendToUsersInDepartement(
      departement.id,
      `${
        dto.type === AgreementType.CONTRACT
          ? 'un nouveau contrat est ajoute a votre departement'
          : 'une nouvelle convension a etee ajoutee a votre departement'
      } avec le fournisseur: ${vendor.company_name}`,
    );

    const extraMessage = `au ${departement.abriviation} de ${direction.abriviation}`;
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
        entity: saved.type.toUpperCase() as unknown as Entity,
        operation: Operation.INSERT,
        entityId: saved.id,
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
        type: saved.type.toUpperCase() as unknown as Entity,
      },
      departement.id,
    );

    return AgreementView.from(saved);
  }

  async findAll(
    params: FindAllAgreementsDTO,
    userId: string,
  ): Promise<PaginationResponse<AgreementView>> {
    const user = await this.userService.findBy({ id: userId });
    const result = await this.agreementRepository.findPaginated(
      params,
      user.role,
      user.departementId,
      user.directionId,
    );
    return { total: result.total, data: AgreementView.fromMany(result.data) };
  }

  async findById(
    id: string,
    agrreementType: AgreementType = AgreementType.CONTRACT,
  ): Promise<AgreementView | null> {
    const agreement = await this.agreementRepository.findById(id, agrreementType);
    return agreement ? AgreementView.from(agreement) : null;
  }

  async executeAgreement(execData: ExecuteAgreementDTO): Promise<AgreementView> {
    const {
      observation = '',
      execution_start_date,
      execution_end_date,
      agreementId,
    } = execData;

    const agreement = await this.agreementRepository.findByIdForExecution(agreementId);
    if (!agreement) {
      throw new NotFoundException("l'accord specifiee n'es pas touvee");
    }

    const { cronStatus } = agreement.execute(
      execution_start_date,
      execution_end_date,
      observation,
    );

    const cronJobName = `agreement:${agreement.type}:${agreement.id}`;
    await this.agreementRepository.saveExecJob({
      name: cronJobName,
      agreementId: agreement.id,
      date: execution_end_date,
      newStatus: cronStatus,
    });
    this.#addAgreementCronJob(cronJobName, execution_end_date, async () => {
      await this.agreementRepository.updateStatus(agreement.id, cronStatus);
      await this.agreementRepository.deleteExecJob(cronJobName);
    });

    const orgInfo = await this.directionService.findWithDepartement(
      agreement.directionId,
      agreement.departementId,
    );
    const deptAbriviation = orgInfo?.departements[0]?.abriviation ?? '';
    const dirAbriviation = orgInfo?.abriviation ?? '';

    await this.userNotificationService.sendNewEventaToConnectedUsersWithContrainsts(
      {
        entity: agreement.type.toUpperCase() as unknown as Entity,
        operation: Operation.EXECUTE,
        entityId: agreement.id,
        departementId: agreement.departementId,
        directionId: agreement.directionId,
        createdAt: new Date(),
        departementAbriviation: deptAbriviation,
        directionAbriviation: dirAbriviation,
      },
      agreement.departementId,
    );

    const saved = await this.agreementRepository.save(agreement);
    return AgreementView.from(saved);
  }

  async getAgreementsStats(
    { startDate, endDate }: StatsParamsDTO,
    user: UserEntity | User,
  ) {
    const status = await this.agreementRepository.getStatusStats(
      user.role,
      user.departementId,
      user.directionId,
      startDate,
      endDate,
    );

    const statusReponse = {};
    Object.values(AgreementStatus).forEach((v) => {
      statusReponse[v] = 0;
    });
    status.forEach((st) => {
      statusReponse[st.status] = parseInt(st.total);
    });

    const types = await this.agreementRepository.getTypeStats(
      user.role,
      user.departementId,
      user.directionId,
    );

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
