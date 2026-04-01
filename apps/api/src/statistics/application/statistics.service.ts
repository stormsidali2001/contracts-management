import { Injectable } from '@nestjs/common';
import { AgreementStatus } from 'src/core/types/agreement-status.enum';
import { AgreementType } from 'src/core/types/agreement-type.enum';
import { UserRole } from 'src/core/types/UserRole.enum';
import { AgreementService } from 'src/Agreement/application/Agreement.service';
import { DirectionService } from 'src/direction/application/direction.service';
import { VendorService } from 'src/Agreement/application/vendor.service';
import { UserService } from 'src/user/application/user.service';
import { StatsParamsDTO } from 'src/core/dtos/stats.dto';

@Injectable()
export class StatisticsService {
  constructor(
    private readonly userService: UserService,
    private readonly vendorService: VendorService,
    private readonly directionService: DirectionService,
    private readonly agreementService: AgreementService,
  ) {}

  async getStats(params: StatsParamsDTO, userId: string) {
    const user = await this.userService.findBy({ id: userId });
    const [userTypesRaw, vendorsStats, agreementsStats] = await Promise.all([
      this.userService.getUserTypesStats(params),
      this.vendorService.getVendorsStats(params),
      this.getAgreementsStats(params, user.role, user.departementId, user.directionId),
    ]);

    const userTypes = { juridical: 0, employee: 0, admin: 0, total: 0 };
    userTypesRaw.forEach((s) => { userTypes[s.role.toLowerCase()] = s.total; });
    userTypes.total = userTypes.juridical + userTypes.admin + userTypes.employee;

    return { userTypes, vendorsStats, agreementsStats };
  }

  async getAgreementsStats(
    { startDate, endDate }: StatsParamsDTO,
    role: UserRole,
    departementId?: string | null,
    directionId?: string | null,
  ) {
    const [statusRaw, typesRaw, topDirections] = await Promise.all([
      this.agreementService.getStatusStats(role, departementId, directionId, startDate, endDate),
      this.agreementService.getTypeStats(role, departementId, directionId),
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
