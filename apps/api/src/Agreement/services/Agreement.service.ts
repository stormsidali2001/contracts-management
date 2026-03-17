import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import {
  CreateAgreementDTO,
  ExecuteAgreementDTO,
  FindAllAgreementsDTO,
} from 'src/core/dtos/agreement.dto';
import { UserEntity } from 'src/core/entities/User.entity';
import { User } from 'src/user/domain/user';
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
import { AgreementView } from 'src/core/views/agreement.view';
import { AgreementRepository } from '../agreement.repository';
import { VendorService } from './vendor.service';

@Injectable()
export class AgreementService implements OnModuleInit {
  private readonly logger = new Logger(AgreementService.name);
  constructor(
    private readonly agreementRepository: AgreementRepository,
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
        await this.agreementRepository.updateStatus(
          pJob.agreementId,
          pJob.newStatus,
        );
        await this.agreementRepository.deleteExecJob(pJob.name);
        this.logger.log(`the job  ${pJob.name} expired hence deleted.`);
        continue;
      }

      await this.#addAgreementCronJob(pJob.name, d1, async () => {
        await this.agreementRepository.updateStatus(
          pJob.agreementId,
          pJob.newStatus,
        );
        await this.agreementRepository.deleteExecJob(pJob.name);
      });
    }
    this.logger.log(`${percistedJobs.length} percisted jobs are running`);
  }
  async createAgreement(agreement: CreateAgreementDTO): Promise<AgreementView> {
    const { directionId, departementId, vendorId, ...agreementData } =
      agreement;
    if (agreementData.signature_date > agreementData.expiration_date) {
      throw new BadRequestException(
        "la date d'expiration de contrat doit etre apres la date de la signature",
      );
    }
    const [direction, vendor] = await Promise.all([
      this.directionService.findWithDepartement(
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

    const agreementDb = await this.agreementRepository.findOneByNumber(
      agreementData.number,
    );
    Logger.debug(JSON.stringify(agreementDb), 'kakakak');
    if (agreementDb)
      throw new BadRequestException('le numero est deja reserver');
    const res = await this.agreementRepository.save({
      ...agreementData,
      direction: { id: direction.id } as any,
      departement: { id: departement.id } as any,
      vendor,
    });
    await this.userNotificationService.sendToUsersInDepartement(
      departement.id,
      `${
        agreement.type === AgreementType.CONTRACT
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
        agreement.type === AgreementType.CONTRACT
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
    return AgreementView.from(res);
  }

  async findAll(
    params: FindAllAgreementsDTO,
    userId: string,
  ): Promise<PaginationResponse<AgreementView>> {
    const user = await this.userService.findBy({ id: userId });
    Logger.debug(
      `start date m end date ${JSON.stringify({
        a: !!params.start_date,
        b: !!params.end_date,
        c: !!params.start_date && !!params.end_date,
      })}`,
      'kkkkkkkkkkaaaaaaaa',
    );
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
    const entity = await this.agreementRepository.findById(id, agrreementType);
    return entity ? AgreementView.from(entity) : null;
  }

  async executeAgreement(
    execData: ExecuteAgreementDTO,
  ): Promise<AgreementView> {
    const {
      observation = '',
      execution_start_date,
      execution_end_date,
      agreementId,
    } = execData;
    const agreement = await this.agreementRepository.findByIdForExecution(
      agreementId,
    );
    if (!agreement) {
      throw new NotFoundException("l'accord specifiee n'es pas touvee");
    }
    if (new Date(execution_start_date) >= new Date(execution_end_date)) {
      throw new BadRequestException("l'intervalle d'execution est non valide");
    }
    if (new Date(execution_start_date) < new Date(agreement.signature_date)) {
      throw new BadRequestException(
        "la date de debut d'execution dout etre supperieur ou rgale a la date de signature",
      );
    }
    if (new Date(execution_start_date) >= new Date(agreement.expiration_date)) {
      agreement.status = AgreementStatus.IN_EXECUTION_WITH_DELAY;
      const cronJobName = `agreement:${agreement.type}:${agreement.id}`;
      await this.agreementRepository.saveExecJob({
        name: cronJobName,
        agreementId: agreement.id,
        date: execution_end_date,
        newStatus: AgreementStatus.EXECUTED_WITH_DELAY,
      });
      this.#addAgreementCronJob(cronJobName, execution_end_date, async () => {
        await this.agreementRepository.updateStatus(
          agreement.id,
          AgreementStatus.EXECUTED_WITH_DELAY,
        );
        await this.agreementRepository.deleteExecJob(cronJobName);
      });
    } else {
      agreement.status = AgreementStatus.IN_EXECUTION;
      const cronJobName = `agreement:${agreement.type}:${agreement.id}`;
      await this.agreementRepository.saveExecJob({
        name: cronJobName,
        agreementId: agreement.id,
        date: execution_end_date,
        newStatus: AgreementStatus.EXECUTED,
      });
      this.#addAgreementCronJob(cronJobName, execution_end_date, async () => {
        await this.agreementRepository.updateStatus(
          agreement.id,
          AgreementStatus.EXECUTED,
        );
        await this.agreementRepository.deleteExecJob(cronJobName);
      });
    }
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
    const saved = await this.agreementRepository.save(agreement);
    return AgreementView.from(saved);
  }

  async getAgreementsStats(
    { startDate, endDate }: StatsParamsDTO,
    user: UserEntity | User,
  ) {
    Logger.debug(user, 'getAgreementsStats');

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
