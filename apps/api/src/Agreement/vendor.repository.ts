import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { VendorEntity } from 'src/core/entities/Vendor.entity';
import { VendorStatsEntity } from 'src/core/entities/VendorStats.entity';
import { AgreementType } from 'src/core/types/agreement-type.enum';
import { PaginationResponse } from 'src/core/types/paginationResponse.interface';
import { DataSource, Repository } from 'typeorm';
import { IVendorRepository, VendorWithCounts } from './domain/vendor.repository';
import { Vendor } from './domain/vendor';

@Injectable()
export class VendorRepository implements IVendorRepository {
  constructor(
    @InjectRepository(VendorEntity)
    private readonly repo: Repository<VendorEntity>,
    @InjectRepository(VendorStatsEntity)
    private readonly vendorStatsRepo: Repository<VendorStatsEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async save(vendor: Vendor): Promise<Vendor> {
    const data: Record<string, unknown> = {
      id: vendor.id,
      num: vendor.num,
      company_name: vendor.company_name,
      nif: vendor.nif,
      nrc: vendor.nrc,
      address: vendor.address,
      mobile_phone_number: vendor.mobile_phone_number,
      home_phone_number: vendor.home_phone_number,
      createdAt: vendor.createdAt,
    };
    const saved = await this.repo.save(data as unknown as VendorEntity);
    return this.toDomain(saved);
  }

  async createWithStats(vendor: Vendor, statsDate: Date): Promise<Vendor> {
    return this.dataSource.transaction(async (manager) => {
      const vendorRepo = manager.getRepository(VendorEntity);
      const statsRepo = manager.getRepository(VendorStatsEntity);

      const data: Record<string, unknown> = {
        num: vendor.num,
        company_name: vendor.company_name,
        nif: vendor.nif,
        nrc: vendor.nrc,
        address: vendor.address,
        mobile_phone_number: vendor.mobile_phone_number,
        home_phone_number: vendor.home_phone_number,
        createdAt: vendor.createdAt,
      };
      const created = await vendorRepo.save(data as unknown as VendorEntity);

      const statsDb = await statsRepo.findOneBy({ date: statsDate });
      if (statsDb) {
        await statsRepo.update(
          { id: statsDb.id },
          { nb_vendors: () => 'nb_vendors + 1' },
        );
      } else {
        await statsRepo.save({ date: statsDate, nb_vendors: 1 });
      }

      return this.toDomain(created);
    });
  }

  async delete(vendorId: string): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .delete()
      .where('vendors.id = :vendorId', { vendorId })
      .execute();
  }

  async findById(id: string): Promise<Vendor | null> {
    const entity = await this.repo.findOneBy({ id });
    return entity ? this.toDomain(entity) : null;
  }

  async findByUniqueCondition(
    condition: string,
    params: object,
  ): Promise<Vendor | null> {
    if (!condition) return null;
    const entity = await this.repo
      .createQueryBuilder('v')
      .where(condition, params)
      .getOne();
    return entity ? this.toDomain(entity) : null;
  }

  async findByIdWithRelationCounts(id: string): Promise<VendorWithCounts | null> {
    const entity = await this.repo
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

    if (!entity) return null;
    const vendor = this.toDomain(entity);
    return Object.assign(vendor as unknown as VendorWithCounts, {
      contractCount: (entity as any).contractCount ?? 0,
      convensionCount: (entity as any).convensionCount ?? 0,
    });
  }

  async findByIdWithAgreementCount(
    id: string,
  ): Promise<{ vendor: Vendor; agreementCount: number } | null> {
    const entity = await this.repo
      .createQueryBuilder('v')
      .where('v.id = :id', { id })
      .loadRelationCountAndMap('v.agreementCount', 'v.agreements')
      .getOne();

    if (!entity) return null;
    return {
      vendor: this.toDomain(entity),
      agreementCount: (entity as any).agreementCount as number,
    };
  }

  async findPaginated(
    offset = 0,
    limit = 10,
    orderBy?: string,
    searchQuery?: string,
  ): Promise<PaginationResponse<Vendor>> {
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

    if (orderBy) query = query.orderBy(orderBy);

    const [data, total] = await query.getManyAndCount();
    return { total, data: data.map((e) => this.toDomain(e)) };
  }

  async getVendorStats(
    startDate?: Date,
    endDate?: Date,
  ): Promise<VendorStatsEntity[]> {
    let query = this.vendorStatsRepo.createQueryBuilder('v').orderBy('v.date');
    if (startDate) query = query.where('v.date >= :startDate', { startDate });
    if (endDate) query = query.andWhere('v.date <= :endDate', { endDate });
    return query.getMany();
  }

  // ── Mapper ───────────────────────────────────────────────────────────────

  private toDomain(entity: VendorEntity): Vendor {
    return Vendor.reconstitute({
      id: entity.id,
      num: entity.num,
      company_name: entity.company_name,
      nif: entity.nif,
      nrc: entity.nrc,
      address: entity.address,
      mobile_phone_number: entity.mobile_phone_number,
      home_phone_number: entity.home_phone_number,
      createdAt: entity.createdAt,
    });
  }
}
