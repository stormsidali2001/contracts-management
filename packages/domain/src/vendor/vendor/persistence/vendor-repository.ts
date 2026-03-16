import { Vendor } from '../vendor';

export interface VendorSummary {
  id: string;
  num: string;
  company_name: string;
  nif: string;
  nrc: string;
  address: string;
  mobile_phone_number: string;
  home_phone_number: string;
  createdAt: Date;
  contractCount?: number;
  convensionCount?: number;
  agreementCount?: number;
}

export interface VendorStatsSummary {
  date: Date;
  nb_vendors: number;
}

export interface VendorRepository {
  // ── Aggregate fetches ─────────────────────────────────────────────────────
  findById(id: string): Promise<Vendor | null>;
  findByNum(num: string): Promise<Vendor | null>;
  findAll(): Promise<Vendor[]>;

  // ── Summary / read-model queries ──────────────────────────────────────────
  findByAnyUniqueField(fields: Partial<{
    num: string; nif: string; nrc: string; company_name: string;
  }>): Promise<VendorSummary | null>;
  findPaginated(
    offset: number,
    limit: number,
    orderBy?: string,
    searchQuery?: string,
  ): Promise<{ data: VendorSummary[]; total: number }>;
  findByIdWithRelationCounts(id: string): Promise<VendorSummary | null>;
  findByIdWithAgreementCount(id: string): Promise<(VendorSummary & { agreementCount: number }) | null>;
  getStats(params: { startDate?: Date; endDate?: Date }): Promise<VendorStatsSummary[]>;

  // ── Write ─────────────────────────────────────────────────────────────────
  /** Transactional create — saves vendor + increments stats row for the given date. */
  createWithStats(vendor: Vendor, createdAt: Date): Promise<VendorSummary>;
  save(vendor: Vendor): Promise<void>;
  delete(id: string): Promise<void>;
}
