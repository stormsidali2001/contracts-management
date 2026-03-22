import { PaginationResponse } from 'src/core/types/paginationResponse.interface';
import { VendorStatsEntity } from 'src/core/entities/VendorStats.entity';
import { Vendor } from './vendor.aggregate';

/**
 * Read model — adds relation counts for the vendor detail view.
 * Not a domain aggregate; returned only by findByIdWithRelationCounts.
 */
export interface VendorWithCounts
  extends Omit<Vendor, 'update' | 'canBeDeleted'> {
  contractCount: number;
  convensionCount: number;
}

export interface IVendorRepository {
  save(vendor: Vendor): Promise<Vendor>;
  delete(vendorId: string): Promise<void>;

  findById(id: string): Promise<Vendor | null>;

  /** Checks uniqueness before create/update. Returns null when condition is empty. */
  findByUniqueCondition(
    condition: string,
    params: object,
  ): Promise<Vendor | null>;

  /**
   * Loads vendor with contractCount + convensionCount mapped — used for detail view.
   * Returns VendorWithCounts read model.
   */
  findByIdWithRelationCounts(id: string): Promise<VendorWithCounts | null>;

  /** Loads vendor with total agreementCount — used for delete guard. */
  findByIdWithAgreementCount(
    id: string,
  ): Promise<{ vendor: Vendor; agreementCount: number } | null>;

  findPaginated(
    offset: number,
    limit: number,
    orderBy?: string,
    searchQuery?: string,
  ): Promise<PaginationResponse<Vendor>>;

  getVendorStats(
    startDate?: Date,
    endDate?: Date,
  ): Promise<VendorStatsEntity[]>;
}

export const VENDOR_REPOSITORY = Symbol('IVendorRepository');
