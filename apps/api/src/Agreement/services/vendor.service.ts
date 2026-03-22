import {
  Injectable,
  ForbiddenException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { v4 as uuid } from 'uuid';
import { CreateVendorDTO, UpdateVendorDTO } from 'src/core/dtos/vendor.dto';
import { VendorStatsView } from 'src/core/views/vendor-stats.view';
import { VendorView } from 'src/core/views/vendor.view';
import { PaginationResponse } from 'src/core/types/paginationResponse.interface';
import { StatsParamsDTO } from 'src/statistics/models/statsPramsDTO.interface';
import { Vendor } from '../domain/vendor';
import {
  IVendorRepository,
  VENDOR_REPOSITORY,
} from '../domain/vendor.repository';

@Injectable()
export class VendorService {
  constructor(
    @Inject(VENDOR_REPOSITORY)
    private readonly vendorRepository: IVendorRepository,
    private readonly eventBus: EventBus,
  ) {}

  #buildUniquenessCondition(uniques: Record<string, unknown>): string {
    const keys = Object.keys(uniques).filter((k) => !!uniques[k]);
    return keys
      .map((k, i) => `v.${k} = :${k}${i !== keys.length - 1 ? ' or ' : ''}`)
      .join('');
  }

  async createVendor(vendor: CreateVendorDTO): Promise<VendorView> {
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
      throw new ForbiddenException(
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

    const created = await this.vendorRepository.createWithStats(
      newVendor,
      newVendor.createdAt,
    );
    this.eventBus.publishAll(newVendor.pullEvents());

    return VendorView.from(created);
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
  ): Promise<PaginationResponse<VendorView>> {
    const result = await this.vendorRepository.findPaginated(
      offset,
      limit,
      orderBy,
      searchQuery,
    );
    return { total: result.total, data: VendorView.fromMany(result.data) };
  }

  async findByIdWithRelations(id: string): Promise<VendorView | null> {
    const vendor = await this.vendorRepository.findByIdWithRelationCounts(id);
    return vendor ? VendorView.from(vendor) : null;
  }

  async updateVendor(
    id: string,
    newVendor: UpdateVendorDTO,
  ): Promise<VendorView> {
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
      throw new ForbiddenException(
        'nif , nrc , company_name  ,num doit etre unique',
      );

    const vendor = await this.vendorRepository.findById(id);
    if (!vendor) throw new NotFoundException('fournisseur non trouvé');
    vendor.update({
      address,
      home_phone_number,
      mobile_phone_number,
      ...uniques,
    });
    const saved = await this.vendorRepository.save(vendor);
    this.eventBus.publishAll(vendor.pullEvents());

    return VendorView.from(saved);
  }

  async getVendorsStats({
    startDate,
    endDate,
  }: StatsParamsDTO): Promise<VendorStatsView[]> {
    const entities = await this.vendorRepository.getVendorStats(
      startDate,
      endDate,
    );
    return VendorStatsView.fromMany(entities);
  }

  async deleteVendor(vendorId: string) {
    const result = await this.vendorRepository.findByIdWithAgreementCount(
      vendorId,
    );

    if (!result) throw new NotFoundException('fournisseur non trouvé');
    const { vendor, agreementCount } = result;

    if (!vendor.canBeDeleted(agreementCount))
      throw new NotFoundException(
        `le fournisseur ne peut pas etre supprimer car il a ${agreementCount} accords`,
      );

    vendor.markDeleted();
    await this.vendorRepository.delete(vendorId);
    this.eventBus.publishAll(vendor.pullEvents());
  }
}
