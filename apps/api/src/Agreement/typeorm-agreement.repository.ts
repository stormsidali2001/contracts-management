import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agreement, AgreementRepository } from '@contracts/domain';
import { AgreementEntity } from 'src/core/entities/Agreement.entity';
import { AgreementExecJobsEntity } from 'src/core/entities/agreementExecJobs';
import { AgreementStatus } from 'src/core/types/agreement-status.enum';
import { AgreementType } from 'src/core/types/agreement-type.enum';
import { PaginationResponse } from 'src/core/types/paginationResponse.interface';
import { FindAllAgreementsDTO } from 'src/core/dtos/agreement.dto';
import { UserEntity } from 'src/core/entities/User.entity';
import { UserRole } from 'src/core/types/UserRole.enum';
import { StatsParamsDTO } from 'src/statistics/models/statsPramsDTO.interface';
import { AgreementMapper } from './agreement.mapper';

@Injectable()
export class TypeOrmAgreementRepository implements AgreementRepository {
  constructor(
    @InjectRepository(AgreementEntity)
    private readonly repo: Repository<AgreementEntity>,
    @InjectRepository(AgreementExecJobsEntity)
    private readonly execJobsRepo: Repository<AgreementExecJobsEntity>,
  ) {}

  // ── Domain-repository interface ───────────────────────────────────────

  async findById(id: string): Promise<Agreement | null> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ['vendor', 'direction', 'departement'],
    });
    return entity ? AgreementMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<Agreement[]> {
    const entities = await this.repo.find();
    return entities.map(AgreementMapper.toDomain);
  }

  async save(agreement: Agreement): Promise<void> {
    await this.repo.save(AgreementMapper.toPersistence(agreement));
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  // ── Service-level query methods ───────────────────────────────────────

  async saveEntity(data: Partial<AgreementEntity>): Promise<AgreementEntity> {
    return this.repo.save(data as AgreementEntity);
  }

  async findOneByNumber(number: string): Promise<AgreementEntity | null> {
    return this.repo.findOneBy({ number });
  }

  async findByIdWithRelations(
    id: string,
    agreementType: AgreementType = AgreementType.CONTRACT,
  ): Promise<AgreementEntity | null> {
    return this.repo
      .createQueryBuilder('ag')
      .where('ag.type = :agrreementType', { agrreementType: agreementType })
      .andWhere('ag.id = :id', { id })
      .leftJoinAndSelect('ag.direction', 'direction')
      .leftJoinAndSelect('ag.departement', 'departement')
      .leftJoinAndSelect('ag.vendor', 'vendor')
      .getOne();
  }

  async findAgreementForExecution(agreementId: string): Promise<AgreementEntity | null> {
    return this.repo
      .createQueryBuilder('ag')
      .where('ag.id = :agreementId', { agreementId })
      .leftJoinAndSelect('ag.direction', 'dr')
      .leftJoinAndSelect('ag.departement', 'dp')
      .getOne();
  }

  async updateStatus(id: string, status: AgreementStatus): Promise<void> {
    await this.repo.update({ id }, { status });
  }

  async findPaginatedWithFilters(
    params: FindAllAgreementsDTO,
    user: UserEntity,
  ): Promise<PaginationResponse<AgreementEntity>> {
    const {
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
    } = params;

    let query = this.repo
      .createQueryBuilder('ag')
      .where('ag.type = :type', { type: agreementType })
      .skip(offset)
      .take(limit);

    if (user.role === UserRole.EMPLOYEE) {
      query = query
        .andWhere('ag.departementId = :departementId', { departementId: user.departementId })
        .andWhere('ag.directionId = :directionId', { directionId: user.directionId });
    }
    if (
      departementId &&
      directionId &&
      (user.role === UserRole.ADMIN || user.role === UserRole.JURIDICAL)
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
    if (status) {
      query = query.andWhere('ag.status = :status', { status });
    }
    if (vendorId) {
      query = query.andWhere('ag.vendorId = :vendorId', { vendorId });
    }
    if (searchQuery && searchQuery.length >= 2) {
      query = query.andWhere(`
            (
                MATCH(ag.number) AGAINST ('${searchQuery}' IN BOOLEAN MODE)
                or MATCH(ag.object) AGAINST ('${searchQuery}' IN BOOLEAN MODE)
                or MATCH(ag.observation) AGAINST ('${searchQuery}' IN BOOLEAN MODE)
            )`);
    }
    if (orderBy && orderBy !== 'type') {
      query = query.orderBy(`${orderBy}`);
    }
    const res = await query.getManyAndCount();
    return { total: res[1], data: res[0] };
  }

  async getAgreementsStatusStats(
    { startDate, endDate }: StatsParamsDTO,
    user: UserEntity,
  ): Promise<{ status: string; total: string }[]> {
    let query = this.repo
      .createQueryBuilder('ag')
      .select('count(ag.id)', 'total')
      .groupBy('ag.status')
      .addSelect('ag.status', 'status');

    if (user.role === UserRole.EMPLOYEE) {
      query = query.where(
        'ag.departementId = :departementId and ag.directionId = :directionId',
        { departementId: user.departementId, directionId: user.directionId },
      );
    }
    if (startDate) {
      query = query.andWhere('ag.createdAt >= :startDate', { startDate });
    }
    if (endDate) {
      query = query.andWhere('ag.createdAt <= :endDate', { endDate });
    }
    return query.getRawMany();
  }

  async getAgreementsTypeStats(user: UserEntity): Promise<{ type: string; total: string }[]> {
    let query = this.repo
      .createQueryBuilder('ag')
      .select('count(ag.id)', 'total')
      .groupBy('ag.type')
      .addSelect('ag.type', 'type');

    if (user.role === UserRole.EMPLOYEE) {
      query = query.where(
        'ag.departementId = :departementId and ag.directionId = :directionId',
        { departementId: user.departementId, directionId: user.directionId },
      );
    }
    return query.getRawMany();
  }

  // ── Exec-jobs methods ─────────────────────────────────────────────────

  async findAllExecJobs(): Promise<AgreementExecJobsEntity[]> {
    return this.execJobsRepo.find();
  }

  async saveExecJob(data: Partial<AgreementExecJobsEntity>): Promise<AgreementExecJobsEntity> {
    return this.execJobsRepo.save(data as AgreementExecJobsEntity);
  }

  async deleteExecJob(name: string): Promise<void> {
    await this.execJobsRepo.delete({ name });
  }
}
