import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  IAgreementRepository,
  AGREEMENT_REPOSITORY,
} from '../domain/persistence/agreement.repository';
import { ContractExpiringEvent } from '../domain/events/contract-expiring.event';

const EXPIRY_THRESHOLDS_DAYS = [30, 7, 1];

@Injectable()
export class ContractExpiryService {
  private readonly logger = new Logger(ContractExpiryService.name);

  constructor(
    @Inject(AGREEMENT_REPOSITORY)
    private readonly agreementRepository: IAgreementRepository,
    private readonly eventBus: EventBus,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async checkExpiringContracts(): Promise<void> {
    this.logger.log('Running contract expiry check...');

    for (const days of EXPIRY_THRESHOLDS_DAYS) {
      const expiring = await this.agreementRepository.findExpiringContracts(days);

      for (const agreement of expiring) {
        this.eventBus.publish(
          new ContractExpiringEvent(
            agreement.id,
            agreement.number,
            days,
            agreement.execution_end_date!, // guaranteed non-null by the repository query
            agreement.departementId,
            agreement.directionId,
          ),
        );
      }

      if (expiring.length > 0) {
        this.logger.log(
          `Published ${expiring.length} ContractExpiringEvent(s) for contracts expiring in ${days} day(s)`,
        );
      }
    }
  }
}
