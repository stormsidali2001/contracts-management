import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VendorEntity } from 'src/core/entities/Vendor.entity';
import { VendorStatsEntity } from 'src/core/entities/VendorStats.entity';
import { AgreementType } from 'src/core/types/agreement-type.enum';
import { PaginationResponse } from 'src/core/types/paginationResponse.interface';
import { Repository } from 'typeorm';
import {
  IVendorRepository,
  VendorWithCounts,
} from '../../domain/persistence/vendor.repository';
import { Vendor } from '../../domain/vendor.aggregate';
import { VendorStat } from '../../domain/vendor-stat';

@Injectable()
export class VendorRepository implements IVendorRepository {
  constructor(
    @InjectRepository(VendorEntity)
    private readonly repo: Repository<VendorEntity>,
    @InjectRepository(VendorStatsEntity)
    private readonly vendorStatsRepo: Repository<VendorStatsEntity>,
  ) {}

  async save(vendor: Vendor): Promise<Vendor> {
    const isNew = !(await this.repo.existsBy({ id: vendor.id }));
    const data: Record<string, unknown> = {
      id: vendor.id,
      num: vendor.num,
      company_name: vendor.company_name,
      nif: vendor.nif,
      nrc: vendor.nrc,
      address: vendor.address,
      mobile_phone_number: vendor.mobile_phone_number,
      home_phone_number: vendor.home_phone_number,
      logoUrl: vendor.logoUrl ?? '',
      createdAt: vendor.createdAt,
    };
    const saved = await this.repo.save(data as unknown as VendorEntity);
    if (isNew) await this.#incrementStatsForDate(vendor.createdAt);
    return this.toDomain(saved);
  }

  async #incrementStatsForDate(date: Date): Promise<void> {
    const dateOnly = date.toISOString().slice(0, 10);
    const existing = await this.vendorStatsRepo.findOneBy({
      date: dateOnly as any,
    });
    if (existing) {
      await this.vendorStatsRepo.update(
        { id: existing.id },
        { nb_vendors: () => 'nb_vendors + 1' },
      );
    } else {
      await this.vendorStatsRepo.save({ date: dateOnly as any, nb_vendors: 1 });
    }
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

  async findByIdWithRelationCounts(
    id: string,
  ): Promise<VendorWithCounts | null> {
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
  ): Promise<PaginationResponse<VendorWithCounts>> {
    let query = this.repo
      .createQueryBuilder('vendor')
      .skip(offset)
      .take(limit)
      .loadRelationCountAndMap(
        'vendor.contractCount',
        'vendor.agreements',
        'agC',
        (qb) =>
          qb.where('agC.type = :agCType', { agCType: AgreementType.CONTRACT }),
      )
      .loadRelationCountAndMap(
        'vendor.convensionCount',
        'vendor.agreements',
        'agV',
        (qb) =>
          qb.where('agV.type = :agVType', {
            agVType: AgreementType.CONVENSION,
          }),
      );

    if (searchQuery && searchQuery.length >= 2) {
      query = query.where(
        '(vendor.num ILIKE :search OR vendor.nif ILIKE :search OR vendor.nrc ILIKE :search OR vendor.company_name ILIKE :search OR vendor.address ILIKE :search OR vendor.mobile_phone_number ILIKE :search OR vendor.home_phone_number ILIKE :search)',
        { search: `%${searchQuery}%` },
      );
    }

    if (orderBy) query = query.orderBy(orderBy);

    const [data, total] = await query.getManyAndCount();
    return {
      total,
      data: data.map((e) =>
        Object.assign(this.toDomain(e) as unknown as VendorWithCounts, {
          contractCount: (e as any).contractCount ?? 0,
          convensionCount: (e as any).convensionCount ?? 0,
        }),
      ),
    };
  }

  async getVendorStats(
    startDate?: Date,
    endDate?: Date,
  ): Promise<VendorStat[]> {
    let query = this.vendorStatsRepo.createQueryBuilder('v').orderBy('v.date');
    if (startDate) query = query.where('v.date >= :startDate', { startDate });
    if (endDate) query = query.andWhere('v.date <= :endDate', { endDate });
    const entities = await query.getMany();
    return entities.map((e) => ({
      id: e.id,
      date: e.date,
      nb_vendors: e.nb_vendors,
    }));
  }

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
      logoUrl: entity.logoUrl ?? '',
      createdAt: entity.createdAt,
    });
  }
}
