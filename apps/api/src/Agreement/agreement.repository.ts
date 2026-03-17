import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AgreementEntity } from 'src/core/entities/Agreement.entity';
import { AgreementExecJobsEntity } from 'src/core/entities/AgreementExecJobs';
import { AgreementStatus } from 'src/core/types/agreement-status.enum';
import { AgreementType } from 'src/core/types/agreement-type.enum';
import { PaginationResponse } from 'src/core/types/paginationResponse.interface';
import { UserRole } from 'src/core/types/UserRole.enum';
import { FindAllAgreementsDTO } from 'src/core/dtos/agreement.dto';
import { Repository, UpdateResult } from 'typeorm';

@Injectable()
export class AgreementRepository {
  constructor(
    @InjectRepository(AgreementEntity)
    private readonly repo: Repository<AgreementEntity>,
    @InjectRepository(AgreementExecJobsEntity)
    private readonly execJobsRepo: Repository<AgreementExecJobsEntity>,
  ) {}

  async findAllExecJobs(): Promise<AgreementExecJobsEntity[]> {
    return this.execJobsRepo.find();
  }

  async deleteExecJob(name: string): Promise<void> {
    await this.execJobsRepo.delete({ name });
  }

  async saveExecJob(
    data: Partial<AgreementExecJobsEntity>,
  ): Promise<AgreementExecJobsEntity> {
    return this.execJobsRepo.save(data as AgreementExecJobsEntity);
  }

  async updateStatus(id: string, status: AgreementStatus): Promise<void> {
    await this.repo.update({ id }, { status });
  }

  async findOneByNumber(number: string): Promise<AgreementEntity | null> {
    return this.repo.findOneBy({ number });
  }

  async save(data: Partial<AgreementEntity>): Promise<AgreementEntity> {
    return this.repo.save(data as AgreementEntity);
  }

  async update(
    id: string,
    partial: Partial<AgreementEntity>,
  ): Promise<UpdateResult> {
    return this.repo.update({ id }, partial);
  }

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
      start_date,
      status,
      vendorId,
    }: FindAllAgreementsDTO,
    userRole: UserRole,
    userDepartementId?: string,
    userDirectionId?: string,
  ): Promise<PaginationResponse<AgreementEntity>> {
    let query = this.repo
      .createQueryBuilder('ag')
      .where('ag.type = :type', { type: agreementType })
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

    const [data, total] = await query.getManyAndCount();
    return { total, data };
  }

  async findById(
    id: string,
    type: AgreementType = AgreementType.CONTRACT,
  ): Promise<AgreementEntity | null> {
    return this.repo
      .createQueryBuilder('ag')
      .where('ag.type = :type', { type })
      .andWhere('ag.id = :id', { id })
      .leftJoinAndSelect('ag.direction', 'direction')
      .leftJoinAndSelect('ag.departement', 'departement')
      .leftJoinAndSelect('ag.vendor', 'vendor')
      .getOne();
  }

  async findByIdForExecution(
    agreementId: string,
  ): Promise<AgreementEntity | null> {
    return this.repo
      .createQueryBuilder('ag')
      .where('ag.id = :agreementId', { agreementId })
      .leftJoinAndSelect('ag.direction', 'dr')
      .leftJoinAndSelect('ag.departement', 'dp')
      .getOne();
  }

  async getStatusStats(
    userRole: UserRole,
    userDepartementId?: string,
    userDirectionId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{ status: string; total: string }[]> {
    let query = this.repo
      .createQueryBuilder('ag')
      .select('count(ag.id)', 'total')
      .groupBy('ag.status')
      .addSelect('ag.status', 'status');

    if (userRole === UserRole.EMPLOYEE) {
      query = query.where(
        'ag.departementId = :departementId and ag.directionId = :directionId',
        { departementId: userDepartementId, directionId: userDirectionId },
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

  async getTypeStats(
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
}
