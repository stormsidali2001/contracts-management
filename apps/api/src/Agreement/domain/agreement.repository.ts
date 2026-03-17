import { AgreementStatus } from 'src/core/types/agreement-status.enum';
import { AgreementType } from 'src/core/types/agreement-type.enum';
import { FindAllAgreementsDTO } from 'src/core/dtos/agreement.dto';
import { PaginationResponse } from 'src/core/types/paginationResponse.interface';
import { UserRole } from 'src/core/types/UserRole.enum';
import { Agreement } from './agreement';

export interface ExecJob {
  id?: string;
  name: string;
  agreementId: string;
  date: Date;
  newStatus: AgreementStatus;
}

/**
 * Read model — assembles agreement data with relation info for detail views.
 * Not a domain aggregate; returned only by findById.
 */
export interface AgreementDetail extends Omit<Agreement, 'execute'> {
  vendor?: { id: string; company_name: string };
  direction?: { id: string; abriviation: string };
  departement?: { id: string; abriviation: string };
}

export interface IAgreementRepository {
  // ── Persistence ────────────────────────────────────────────────────────────
  save(agreement: Agreement): Promise<Agreement>;

  /** Lightweight status-only update used by cron job callbacks. */
  updateStatus(id: string, status: AgreementStatus): Promise<void>;

  // ── Aggregate loaders ──────────────────────────────────────────────────────

  /**
   * Loads agreement with vendor + direction + departement joined.
   * Returns an AgreementDetail read model — used for single-item views.
   */
  findById(id: string, type?: AgreementType): Promise<AgreementDetail | null>;

  /**
   * Loads the pure Agreement aggregate — used before executeAgreement mutation.
   * Does NOT join relation objects.
   */
  findByIdForExecution(id: string): Promise<Agreement | null>;

  findOneByNumber(number: string): Promise<Agreement | null>;

  // ── Read-model queries ─────────────────────────────────────────────────────

  findPaginated(
    params: FindAllAgreementsDTO,
    userRole: UserRole,
    userDepartementId?: string,
    userDirectionId?: string,
  ): Promise<PaginationResponse<Agreement>>;

  getStatusStats(
    userRole: UserRole,
    userDepartementId?: string,
    userDirectionId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{ status: string; total: string }[]>;

  getTypeStats(
    userRole: UserRole,
    userDepartementId?: string,
    userDirectionId?: string,
  ): Promise<{ type: string; total: string }[]>;

  // ── Exec jobs ──────────────────────────────────────────────────────────────

  findAllExecJobs(): Promise<ExecJob[]>;
  saveExecJob(job: Omit<ExecJob, 'id'>): Promise<ExecJob>;
  deleteExecJob(name: string): Promise<void>;
}

export const AGREEMENT_REPOSITORY = Symbol('IAgreementRepository');
