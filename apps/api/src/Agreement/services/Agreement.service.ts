import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import {
  CreateAgreementDTO,
  ExecuteAgreementDTO,
  FindAllAgreementsDTO,
} from 'src/core/dtos/agreement.dto';
import { AgreementType } from 'src/core/types/agreement-type.enum';
import { PaginationResponse } from 'src/core/types/paginationResponse.interface';
import { DirectionService } from 'src/direction/services/direction.service';
import { UserService } from 'src/user/user.service';
import { AgreementView } from 'src/core/views/agreement.view';
import { Agreement } from '../domain/agreement';
import {
  IAgreementRepository,
  AGREEMENT_REPOSITORY,
} from '../domain/agreement.repository';
import { VendorService } from './vendor.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AgreementService {
  constructor(
    @Inject(AGREEMENT_REPOSITORY)
    private readonly agreementRepository: IAgreementRepository,
    private readonly vendorService: VendorService,
    private readonly directionService: DirectionService,
    private readonly userService: UserService,
    private readonly eventBus: EventBus,
  ) {}

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
    this.eventBus.publishAll(agreement.pullEvents());

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
    const agreement = await this.agreementRepository.findById(
      id,
      agrreementType,
    );
    return agreement ? AgreementView.from(agreement) : null;
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

    agreement.execute(execution_start_date, execution_end_date, observation);

    const saved = await this.agreementRepository.save(agreement);
    this.eventBus.publishAll(agreement.pullEvents());

    return AgreementView.from(saved);
  }

}
