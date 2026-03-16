import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { VendorEntity } from 'src/core/entities/Vendor.entity';
import { VendorStatsEntity } from 'src/core/entities/VendorStats.entity';
import { AgreementType } from 'src/core/types/agreement-type.enum';
import { PaginationResponse } from 'src/core/types/paginationResponse.interface';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';

@Injectable()
export class VendorRepository {
  constructor(
    @InjectRepository(VendorEntity)
    private readonly repo: Repository<VendorEntity>,
    @InjectRepository(VendorStatsEntity)
    private readonly vendorStatsRepo: Repository<VendorStatsEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findOneByUniqueCondition(
    condition: string,
    uniques: object,
  ): Promise<VendorEntity | null> {
    if (!condition) return null;
    return this.repo.createQueryBuilder('v').where(condition, uniques).getOne();
  }

  async createWithStats(
    data: Partial<VendorEntity>,
    createdAt: Date,
  ): Promise<VendorEntity> {
    return this.dataSource.transaction(async (manager) => {
      const vendorRepo = manager.getRepository(VendorEntity);
      const statsRepo = manager.getRepository(VendorStatsEntity);

      const created = await vendorRepo.save(data as VendorEntity);

      const statsDb = await statsRepo.findOneBy({ date: createdAt });
      if (statsDb) {
        await statsRepo.update(
          { id: statsDb.id },
          { nb_vendors: () => 'nb_vendors + 1' },
        );
      } else {
        await statsRepo.save({ date: createdAt, nb_vendors: 1 });
      }

      return created;
    });
  }

  async findOneBy(
    options: FindOptionsWhere<VendorEntity>,
  ): Promise<VendorEntity | null> {
    return this.repo.findOneBy(options);
  }

  async findPaginated(
    offset: number = 0,
    limit: number = 10,
    orderBy?: string,
    searchQuery?: string,
  ): Promise<PaginationResponse<VendorEntity>> {
    let query = this.repo
      .createQueryBuilder('vendor')
      .skip(offset)
      .take(limit);

    if (searchQuery && searchQuery.length >= 2) {
      query = query
        .where(
          `MATCH(vendor.company_name) AGAINST ('${searchQuery}' IN BOOLEAN MODE)`,
        )
        .orWhere(
          `MATCH(vendor.nif) AGAINST ('${searchQuery}' IN BOOLEAN MODE)`,
        )
        .orWhere(
          `MATCH(vendor.nrc) AGAINST ('${searchQuery}' IN BOOLEAN MODE)`,
        )
        .orWhere(
          `MATCH(vendor.address) AGAINST ('${searchQuery}' IN BOOLEAN MODE)`,
        )
        .orWhere(
          `MATCH(vendor.home_phone_number) AGAINST ('${searchQuery}' IN BOOLEAN MODE)`,
        )
        .orWhere(
          `MATCH(vendor.mobile_phone_number) AGAINST ('${searchQuery}' IN BOOLEAN MODE)`,
        )
        .orWhere(
          `MATCH(vendor.num) AGAINST ('${searchQuery}' IN BOOLEAN MODE)`,
        );
    }

    if (orderBy) {
      query = query.orderBy(`${orderBy}`);
    }

    const [data, total] = await query.getManyAndCount();
    return { total, data };
  }

  async findByIdWithRelations(id: string): Promise<VendorEntity | null> {
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

  async save(data: Partial<VendorEntity>): Promise<VendorEntity> {
    return this.repo.save(data as VendorEntity);
  }

  async getVendorStats(
    startDate?: Date,
    endDate?: Date,
  ): Promise<VendorStatsEntity[]> {
    let query = this.vendorStatsRepo.createQueryBuilder('v').orderBy('v.date');

    if (startDate) {
      query = query.where('v.date >= :startDate', { startDate });
    }
    if (endDate) {
      query = query.andWhere('v.date <= :endDate', { endDate });
    }

    return query.getMany();
  }

  async findByIdWithAgreementCount(
    vendorId: string,
  ): Promise<VendorEntity | null> {
    return this.repo
      .createQueryBuilder('v')
      .where('v.id = :vendorId', { vendorId })
      .loadRelationCountAndMap('v.agreementCount', 'v.agreements')
      .getOne();
  }

  async delete(vendorId: string): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .delete()
      .where('vendors.id = :vendorId', { vendorId })
      .execute();
  }
}
