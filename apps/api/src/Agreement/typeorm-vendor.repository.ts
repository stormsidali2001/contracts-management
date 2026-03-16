import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { Vendor, VendorRepository } from '@contracts/domain';
import { VendorEntity } from 'src/core/entities/Vendor.entity';
import { VendorStatsEntity } from 'src/core/entities/VendorStats.entity';
import { AgreementType } from 'src/core/types/agreement-type.enum';
import { PaginationResponse } from 'src/core/types/paginationResponse.interface';
import { StatsParamsDTO } from 'src/statistics/models/statsPramsDTO.interface';
import { VendorMapper } from './vendor.mapper';

@Injectable()
export class TypeOrmVendorRepository implements VendorRepository {
  constructor(
    @InjectRepository(VendorEntity)
    private readonly repo: Repository<VendorEntity>,
    @InjectRepository(VendorStatsEntity)
    private readonly vendorStatsRepo: Repository<VendorStatsEntity>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  // ── Domain-repository interface ───────────────────────────────────────

  async findById(id: string): Promise<Vendor | null> {
    const entity = await this.repo.findOneBy({ id });
    return entity ? VendorMapper.toDomain(entity) : null;
  }

  async findByNum(num: string): Promise<Vendor | null> {
    const entity = await this.repo.findOneBy({ num });
    return entity ? VendorMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<Vendor[]> {
    const entities = await this.repo.find();
    return entities.map(VendorMapper.toDomain);
  }

  async save(vendor: Vendor): Promise<void> {
    await this.repo.save(VendorMapper.toPersistence(vendor));
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  // ── Service-level query methods ───────────────────────────────────────

  async findOneBy(options: FindOptionsWhere<VendorEntity>): Promise<VendorEntity | null> {
    return this.repo.findOneBy(options);
  }

  async findByUniqueCondition(condition: string, params: object): Promise<VendorEntity | null> {
    return this.repo.createQueryBuilder('v').where(condition, params).getOne();
  }

  async createVendorWithStats(
    vendorData: Partial<VendorEntity>,
    createdAt: Date,
  ): Promise<VendorEntity> {
    return this.dataSource.transaction(async (manager) => {
      const vendorRepository = manager.getRepository(VendorEntity);
      const vendorStatsRepository = manager.getRepository(VendorStatsEntity);

      const saved = await vendorRepository.save(vendorData as VendorEntity);

      const vendorStatsDb = await vendorStatsRepository.findOneBy({ date: createdAt });
      if (vendorStatsDb) {
        await vendorStatsRepository.update(
          { id: vendorStatsDb.id },
          { nb_vendors: () => 'nb_vendors + 1' },
        );
      } else {
        await vendorStatsRepository.save({ date: createdAt, nb_vendors: 1 });
      }
      return saved;
    });
  }

  async findPaginated(
    offset: number,
    limit: number,
    orderBy?: string,
    searchQuery?: string,
  ): Promise<PaginationResponse<VendorEntity>> {
    let query = this.repo.createQueryBuilder('vendor').skip(offset).take(limit);

    if (searchQuery && searchQuery.length >= 2) {
      query = query
        .where(`MATCH(vendor.company_name) AGAINST ('${searchQuery}' IN BOOLEAN MODE)`)
        .orWhere(`MATCH(vendor.nif) AGAINST ('${searchQuery}' IN BOOLEAN MODE)`)
        .orWhere(`MATCH(vendor.nrc) AGAINST ('${searchQuery}' IN BOOLEAN MODE)`)
        .orWhere(`MATCH(vendor.address) AGAINST ('${searchQuery}' IN BOOLEAN MODE)`)
        .orWhere(
          `MATCH(vendor.home_phone_number) AGAINST ('${searchQuery}' IN BOOLEAN MODE)`,
        )
        .orWhere(
          `MATCH(vendor.mobile_phone_number) AGAINST ('${searchQuery}' IN BOOLEAN MODE)`,
        )
        .orWhere(`MATCH(vendor.num) AGAINST ('${searchQuery}' IN BOOLEAN MODE)`);
    }
    if (orderBy) {
      query = query.orderBy(`${orderBy}`);
    }
    const res = await query.getManyAndCount();
    return { total: res[1], data: res[0] };
  }

  async findByIdWithRelationCounts(id: string): Promise<VendorEntity | null> {
    return this.repo
      .createQueryBuilder('vendor')
      .where('vendor.id = :id', { id })
      .loadRelationCountAndMap(
        'vendor.contractCount',
        'vendor.agreements',
        'agreements',
        (qb) =>
          qb.where('agreements.type = :agreementType', {
            agreementType: AgreementType.CONTRACT,
          }),
      )
      .loadRelationCountAndMap(
        'vendor.convensionCount',
        'vendor.agreements',
        'agreements',
        (qb) =>
          qb.where('agreements.type = :agreementType', {
            agreementType: AgreementType.CONVENSION,
          }),
      )
      .getOne();
  }

  async findByIdWithAgreementCount(vendorId: string): Promise<VendorEntity | null> {
    return this.repo
      .createQueryBuilder('v')
      .where('v.id = :vendorId', { vendorId })
      .loadRelationCountAndMap('v.agreementCount', 'v.agreements')
      .getOne();
  }

  async deleteById(vendorId: string): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .delete()
      .where('vendors.id = :vendorId', { vendorId })
      .execute();
  }

  async getVendorsStats({ startDate, endDate }: StatsParamsDTO): Promise<VendorStatsEntity[]> {
    let query = this.vendorStatsRepo.createQueryBuilder('v').orderBy('v.date');
    if (startDate) {
      query = query.where('v.date >= :startDate', { startDate });
    }
    if (endDate) {
      query = query.andWhere('v.date <= :endDate', { endDate });
    }
    return query.getMany();
  }
}
