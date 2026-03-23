import { Injectable, Inject } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import {
  CreateAgreementDTO,
  ExecuteAgreementDTO,
  FindAllAgreementsDTO,
} from 'src/core/dtos/agreement.dto';
import { AgreementType } from 'src/core/types/agreement-type.enum';
import { PaginationResponse } from 'src/core/types/paginationResponse.interface';
import { UserRole } from 'src/core/types/UserRole.enum';
import { Agreement } from '../domain/agreement.aggregate';
import {
  AgreementDetail,
  IAgreementRepository,
  AGREEMENT_REPOSITORY,
} from '../domain/agreement.repository';
import { VendorService } from './vendor.service';
import { v4 as uuid } from 'uuid';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from 'src/shared/domain/errors';

@Injectable()
export class AgreementService {
  constructor(
    @Inject(AGREEMENT_REPOSITORY)
    private readonly agreementRepository: IAgreementRepository,
    private readonly vendorService: VendorService,
    private readonly eventBus: EventBus,
  ) {}

  async createAgreement(dto: CreateAgreementDTO): Promise<Agreement> {
    const { directionId, departementId, vendorId, ...agreementData } = dto;

    if (agreementData.signature_date > agreementData.expiration_date) {
      throw new ValidationError(
        "la date d'expiration de contrat doit etre apres la date de la signature",
      );
    }

    const vendor = await this.vendorService.findBy({ id: vendorId });
    if (!vendor) throw new NotFoundError('cound not find the vendor');

    const existing = await this.agreementRepository.findOneByNumber(
      agreementData.number,
    );
    if (existing) throw new ConflictError('le numero est deja reserver');

    const agreement = Agreement.create({
      id: uuid(),
      ...agreementData,
      directionId,
      departementId,
      vendorId: vendor.id,
    });

    const saved = await this.agreementRepository.save(agreement);
    this.eventBus.publishAll(agreement.pullEvents());

    return saved;
  }

  async findAll(
    params: FindAllAgreementsDTO,
    role: string,
    departementId: string | null,
    directionId: string | null,
  ): Promise<PaginationResponse<Agreement>> {
    return this.agreementRepository.findPaginated(
      params,
      role as UserRole,
      departementId,
      directionId,
    );
  }

  async findById(
    id: string,
    agrreementType: AgreementType = AgreementType.CONTRACT,
  ): Promise<AgreementDetail | null> {
    return this.agreementRepository.findById(id, agrreementType);
  }

  async executeAgreement(execData: ExecuteAgreementDTO): Promise<Agreement> {
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
      throw new NotFoundError("l'accord specifiee n'es pas touvee");
    }

    agreement.execute(execution_start_date, execution_end_date, observation);

    const saved = await this.agreementRepository.save(agreement);
    this.eventBus.publishAll(agreement.pullEvents());

    return saved;
  }
}
