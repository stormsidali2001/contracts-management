import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AgreementEntity } from 'src/core/entities/Agreement.entity';
import { AgreementType } from 'src/core/types/agreement-type.enum';
import { FindAllAgreementsDTO } from 'src/core/dtos/agreement.dto';
import { PaginationResponse } from 'src/core/types/paginationResponse.interface';
import { UserRole } from 'src/core/types/UserRole.enum';
import { Repository } from 'typeorm';
import {
  IAgreementRepository,
  AgreementDetail,
} from '../../domain/persistence/agreement.repository';
import { Agreement } from '../../domain/agreement.aggregate';

@Injectable()
export class AgreementRepository implements IAgreementRepository {
  constructor(
    @InjectRepository(AgreementEntity)
    private readonly repo: Repository<AgreementEntity>,
  ) {}

  // ── Persistence ─────────────────────────────────────────────────────────

  async save(agreement: Agreement): Promise<Agreement> {
    const data: Record<string, unknown> = {
      id: agreement.id,
      number: agreement.number,
      type: agreement.type,
      object: agreement.object,
      amount: agreement.amount,
      expiration_date: agreement.expiration_date,
      signature_date: agreement.signature_date,
      execution_start_date: agreement.execution_start_date,
      execution_end_date: agreement.execution_end_date,
      observation: agreement.observation,
      status: agreement.status,
      url: agreement.url,
      direction: { id: agreement.directionId } as any,
      departement: { id: agreement.departementId } as any,
      vendor: { id: agreement.vendorId } as any,
    };

    const saved = await this.repo.save(data as unknown as AgreementEntity);
    return this.toDomain(saved);
  }

  // ── Aggregate loaders ────────────────────────────────────────────────────

  async findById(
    id: string,
    type: AgreementType = AgreementType.CONTRACT,
  ): Promise<AgreementDetail | null> {
    const entity = await this.repo
      .createQueryBuilder('ag')
      .where('ag.type = :type', { type })
      .andWhere('ag.id = :id', { id })
      .leftJoinAndSelect('ag.direction', 'direction')
      .leftJoinAndSelect('ag.departement', 'departement')
      .leftJoinAndSelect('ag.vendor', 'vendor')
      .getOne();

    return entity ? this.toDetail(entity) : null;
  }

  async findByIdForExecution(id: string): Promise<Agreement | null> {
    const entity = await this.repo
      .createQueryBuilder('ag')
      .where('ag.id = :id', { id })
      .getOne();

    return entity ? this.toDomain(entity) : null;
  }

  async findOneByNumber(number: string): Promise<Agreement | null> {
    const entity = await this.repo.findOneBy({ number });
    return entity ? this.toDomain(entity) : null;
  }

  // ── Read-model queries ───────────────────────────────────────────────────

  async findPaginated(
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
      status,
      vendorId,
      start_date,
    }: FindAllAgreementsDTO,
    userRole: UserRole,
    userDepartementId?: string,
    userDirectionId?: string,
  ): Promise<PaginationResponse<AgreementDetail>> {
    let query = this.repo
      .createQueryBuilder('ag')
      .where('ag.type = :type', { type: agreementType })
      .leftJoin('ag.vendor', 'vendor')
      .addSelect(['vendor.id', 'vendor.company_name'])
      .skip(offset)
      .take(limit);

    if (userRole === UserRole.EMPLOYEE) {
      query = query
        .andWhere('ag.departementId = :departementId', {
          departementId: userDepartementId,
        })
        .andWhere('ag.directionId = :directionId', {
          directionId: userDirectionId,
        });
    }

    if (
      departementId &&
      directionId &&
      (userRole === UserRole.ADMIN || userRole === UserRole.JURIDICAL)
    ) {
      query = query
        .andWhere('ag.departementId = :departementId', { departementId })
        .andWhere('ag.directionId = :directionId', { directionId });
    }

    if (start_date && end_date) {
      query = query.andWhere(
        'ag.createdAt >= :start_date and ag.createdAt <= :end_date',
        { start_date, end_date },
      );
    }

    if (amount_min && amount_max) {
      query = query.andWhere(
        'ag.amount >= :amount_min and ag.amount <= :amount_max',
        { amount_min, amount_max },
      );
    }

    if (status) query = query.andWhere('ag.status = :status', { status });
    if (vendorId)
      query = query.andWhere('ag.vendorId = :vendorId', { vendorId });

    if (searchQuery && searchQuery.length >= 2) {
      query = query.andWhere(
        '(ag.number ILIKE :search OR ag.object ILIKE :search OR ag.observation ILIKE :search)',
        { search: `%${searchQuery}%` },
      );
    }

    if (orderBy && orderBy !== 'type') query = query.orderBy(orderBy);

    const [entities, total] = await query.getManyAndCount();
    return { total, data: entities.map((e) => this.toDetail(e)) };
  }

  getStatusStats(
    userRole: UserRole,
    userDepartementId?: string,
    userDirectionId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{ status: string; total: string }[]> {
    const derivedStatus = `
      CASE
        WHEN ag.execution_start_date IS NULL THEN 'not_executed'
        WHEN ag.execution_end_date > NOW() AND ag.execution_start_date < ag.expiration_date THEN 'in_execution'
        WHEN ag.execution_end_date > NOW() AND ag.execution_start_date >= ag.expiration_date THEN 'in_execution_with_delay'
        WHEN ag.execution_end_date <= NOW() AND ag.execution_start_date < ag.expiration_date THEN 'executed'
        WHEN ag.execution_end_date <= NOW() AND ag.execution_start_date >= ag.expiration_date THEN 'executed_with_delay'
      END
    `;

    let query = this.repo
      .createQueryBuilder('ag')
      .select(`(${derivedStatus})`, 'status')
      .addSelect('COUNT(ag.id)', 'total')
      .groupBy(derivedStatus);

    if (userRole === UserRole.EMPLOYEE) {
      query = query.where(
        'ag.departementId = :departementId and ag.directionId = :directionId',
        { departementId: userDepartementId, directionId: userDirectionId },
      );
    }

    if (startDate)
      query = query.andWhere('ag.createdAt >= :startDate', { startDate });
    if (endDate)
      query = query.andWhere('ag.createdAt <= :endDate', { endDate });

    return query.getRawMany();
  }

  getTypeStats(
    userRole: UserRole,
    userDepartementId?: string,
    userDirectionId?: string,
  ): Promise<{ type: string; total: string }[]> {
    let query = this.repo
      .createQueryBuilder('ag')
      .select('count(ag.id)', 'total')
      .groupBy('ag.type')
      .addSelect('ag.type', 'type');

    if (userRole === UserRole.EMPLOYEE) {
      query = query.where(
        'ag.departementId = :departementId and ag.directionId = :directionId',
        { departementId: userDepartementId, directionId: userDirectionId },
      );
    }

    return query.getRawMany();
  }

  async findExpiringContracts(daysUntilExpiry: number): Promise<Agreement[]> {
    const entities = await this.repo
      .createQueryBuilder('ag')
      .where('ag.execution_end_date IS NOT NULL')
      .andWhere(
        "ag.execution_end_date::date = (CURRENT_DATE + INTERVAL '1 day' * :days)",
        { days: daysUntilExpiry },
      )
      .getMany();

    return entities.map((e) => this.toDomain(e));
  }

  // ── Mappers ──────────────────────────────────────────────────────────────

  private toDomain(entity: AgreementEntity): Agreement {
    return Agreement.reconstitute({
      id: entity.id,
      number: entity.number,
      type: entity.type,
      object: entity.object,
      amount: entity.amount,
      expiration_date: entity.expiration_date,
      signature_date: entity.signature_date,
      createdAt: entity.createdAt,
      execution_start_date: entity.execution_start_date,
      execution_end_date: entity.execution_end_date,
      observation: entity.observation,
      url: entity.url,
      departementId: entity.departementId,
      directionId: entity.directionId,
      vendorId: (entity as any).vendorId ?? entity.vendor?.id,
    });
  }

  private toDetail(entity: AgreementEntity): AgreementDetail {
    const base = this.toDomain(entity);
    const detail: AgreementDetail = base as unknown as AgreementDetail;
    detail.vendor = entity.vendor
      ? { id: entity.vendor.id, company_name: entity.vendor.company_name }
      : undefined;
    detail.direction = entity.direction
      ? { id: entity.direction.id, abriviation: entity.direction.abriviation }
      : undefined;
    detail.departement = entity.departement
      ? {
          id: entity.departement.id,
          abriviation: entity.departement.abriviation,
        }
      : undefined;
    return detail;
  }
}
