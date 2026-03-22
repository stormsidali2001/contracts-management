import { Injectable, Inject } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { v4 as uuid } from 'uuid';
import { CreateVendorDTO, UpdateVendorDTO } from 'src/core/dtos/vendor.dto';
import { PaginationResponse } from 'src/core/types/paginationResponse.interface';
import { StatsParamsDTO } from 'src/statistics/models/statsPramsDTO.interface';
import { Vendor } from '../domain/vendor.aggregate';
import {
  IVendorRepository,
  VendorWithCounts,
  VENDOR_REPOSITORY,
} from '../domain/vendor.repository';
import { VendorStatsRepository } from '../infrastructure/vendor-stats.repository';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from 'src/shared/domain/errors';

@Injectable()
export class VendorService {
  constructor(
    @Inject(VENDOR_REPOSITORY)
    private readonly vendorRepository: IVendorRepository,
    private readonly vendorStatsRepository: VendorStatsRepository,
    private readonly eventBus: EventBus,
  ) {}

  #buildUniquenessCondition(uniques: Record<string, unknown>): string {
    const keys = Object.keys(uniques).filter((k) => !!uniques[k]);
    return keys
      .map((k, i) => `v.${k} = :${k}${i !== keys.length - 1 ? ' or ' : ''}`)
      .join('');
  }

  async createVendor(vendor: CreateVendorDTO): Promise<Vendor> {
    const {
      address,
      home_phone_number,
      mobile_phone_number,
      createdAt,
      ...uniques
    } = vendor;

    Object.keys(uniques).forEach((k) => {
      if (!uniques[k]) delete uniques[k];
    });
    const condition = this.#buildUniquenessCondition(uniques);

    const existing = await this.vendorRepository.findByUniqueCondition(
      condition,
      uniques,
    );
    if (existing)
      throw new ConflictError(
        'nif , nrc , company_name  ,num doit etre unique',
      );

    const newVendor = Vendor.create({
      id: uuid(),
      address,
      home_phone_number,
      mobile_phone_number,
      createdAt: createdAt ?? new Date(),
      ...uniques,
    });

    const created = await this.vendorRepository.save(newVendor);
    await this.vendorStatsRepository.incrementForDate(newVendor.createdAt);
    this.eventBus.publishAll(newVendor.pullEvents());

    return created;
  }

  async findBy(options: { id?: string }): Promise<Vendor | null> {
    if (options.id) return this.vendorRepository.findById(options.id);
    return null;
  }

  async findAll(
    offset = 0,
    limit = 10,
    orderBy: string = undefined,
    searchQuery: string = undefined,
  ): Promise<PaginationResponse<Vendor>> {
    return this.vendorRepository.findPaginated(
      offset,
      limit,
      orderBy,
      searchQuery,
    );
  }

  async findByIdWithRelations(id: string): Promise<VendorWithCounts | null> {
    return this.vendorRepository.findByIdWithRelationCounts(id);
  }

  async updateVendor(id: string, newVendor: UpdateVendorDTO): Promise<Vendor> {
    const { address, home_phone_number, mobile_phone_number, ...uniques } =
      newVendor;

    Object.keys(uniques).forEach((k) => {
      if (!uniques[k]) delete uniques[k];
    });
    const condition = this.#buildUniquenessCondition(uniques);

    const duplicate = await this.vendorRepository.findByUniqueCondition(
      condition,
      uniques,
    );
    if (duplicate && duplicate.id !== id)
      throw new ConflictError(
        'nif , nrc , company_name  ,num doit etre unique',
      );

    const vendor = await this.vendorRepository.findById(id);
    if (!vendor) throw new NotFoundError('fournisseur non trouvé');
    vendor.update({
      address,
      home_phone_number,
      mobile_phone_number,
      ...uniques,
    });
    const saved = await this.vendorRepository.save(vendor);
    this.eventBus.publishAll(vendor.pullEvents());

    return saved;
  }

  async getVendorsStats({ startDate, endDate }: StatsParamsDTO) {
    return this.vendorRepository.getVendorStats(startDate, endDate);
  }

  async deleteVendor(vendorId: string) {
    const result = await this.vendorRepository.findByIdWithAgreementCount(
      vendorId,
    );

    if (!result) throw new NotFoundError('fournisseur non trouvé');
    const { vendor, agreementCount } = result;

    if (!vendor.canBeDeleted(agreementCount))
      throw new ForbiddenError(
        `le fournisseur ne peut pas etre supprimer car il a ${agreementCount} accords`,
      );

    vendor.markDeleted();
    await this.vendorRepository.delete(vendorId);
    this.eventBus.publishAll(vendor.pullEvents());
  }
}
