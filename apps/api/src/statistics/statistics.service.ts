import { Injectable, Inject } from '@nestjs/common';
import { User } from 'src/user/domain/user';
import { UserEntity } from 'src/core/entities/User.entity';
import { AgreementStatus } from 'src/core/types/agreement-status.enum';
import { AgreementType } from 'src/core/types/agreement-type.enum';
import {
  IAgreementRepository,
  AGREEMENT_REPOSITORY,
} from 'src/Agreement/domain/agreement.repository';
import { DirectionService } from 'src/direction/services/direction.service';
import { VendorService } from 'src/Agreement/services/vendor.service';
import { UserService } from 'src/user/user.service';
import { StatsParamsDTO } from './models/statsPramsDTO.interface';

@Injectable()
export class StatisticsService {
  constructor(
    private readonly userService: UserService,
    private readonly vendorService: VendorService,
    private readonly directionService: DirectionService,
    @Inject(AGREEMENT_REPOSITORY)
    private readonly agreementRepository: IAgreementRepository,
  ) {}

  async getStats(params: StatsParamsDTO, userId: string) {
    const user = await this.userService.findBy({ id: userId });
    const [userTypes, vendorsStats, agreementsStats] = await Promise.all([
      this.userService.getUserTypesStats(params, user),
      this.vendorService.getVendorsStats(params),
      this.getAgreementsStats(params, user),
    ]);

    return {
      userTypes,
      vendorsStats,
      agreementsStats,
    };
  }

  async getAgreementsStats(
    { startDate, endDate }: StatsParamsDTO,
    user: UserEntity | User,
  ) {
    const [statusRaw, typesRaw, topDirections] = await Promise.all([
      this.agreementRepository.getStatusStats(
        user.role,
        user.departementId,
        user.directionId,
        startDate,
        endDate,
      ),
      this.agreementRepository.getTypeStats(
        user.role,
        user.departementId,
        user.directionId,
      ),
      this.directionService.getTopDirection(),
    ]);

    const status = {};
    Object.values(AgreementStatus).forEach((v) => {
      status[v] = 0;
    });
    statusRaw.forEach((st) => {
      status[st.status] = parseInt(st.total);
    });

    const types = {};
    Object.values(AgreementType).forEach((v) => {
      types[v] = 0;
    });
    typesRaw.forEach((t) => {
      types[t.type] = parseInt(t.total);
    });

    return { status, types, topDirections };
  }
}
