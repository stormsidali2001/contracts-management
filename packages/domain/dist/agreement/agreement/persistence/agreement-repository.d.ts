import { Agreement } from '../agreement';
export interface AgreementEntityRef {
    id: string;
    title?: string;
    abriviation?: string;
}
export interface AgreementVendorRef {
    id: string;
    company_name: string;
}
export interface AgreementRecord {
    id?: string;
    number: string;
    type: string;
    object: string;
    amount: number;
    expiration_date: Date | string;
    signature_date: Date | string;
    createdAt?: Date;
    execution_start_date?: Date | string | null;
    execution_end_date?: Date | string | null;
    observation?: string | null;
    status?: string;
    url: string;
    directionId?: string;
    departementId?: string;
    direction?: AgreementEntityRef;
    departement?: AgreementEntityRef;
    vendor?: AgreementVendorRef;
}
export interface ExecJobRecord {
    name: string;
    agreementId: string;
    date: Date | string;
    newStatus: string;
}
export interface AgreementFilterParams {
    agreementType?: string;
    amount_max?: number;
    amount_min?: number;
    departementId?: string;
    directionId?: string;
    end_date?: Date | string;
    limit?: number;
    offset?: number;
    orderBy?: string;
    searchQuery?: string;
    start_date?: Date | string;
    status?: string;
    vendorId?: string;
}
/** Minimal user context needed for agreement access-control queries. */
export interface AgreementUserContext {
    role: string;
    departementId?: string | null;
    directionId?: string | null;
}
export interface AgreementRepository {
    findById(id: string): Promise<Agreement | null>;
    findAll(filters?: {
        vendorId?: string;
        directionId?: string;
        departementId?: string;
        status?: string;
        type?: string;
    }): Promise<Agreement[]>;
    findOneByNumber(number: string): Promise<AgreementRecord | null>;
    findAgreementForExecution(id: string): Promise<AgreementRecord | null>;
    findByIdWithRelations(id: string, type?: string): Promise<AgreementRecord | null>;
    findPaginatedWithFilters(params: AgreementFilterParams, user: AgreementUserContext): Promise<{
        data: AgreementRecord[];
        total: number;
    }>;
    getAgreementsStatusStats(params: {
        startDate?: Date;
        endDate?: Date;
    }, user: AgreementUserContext): Promise<{
        status: string;
        total: string;
    }[]>;
    getAgreementsTypeStats(user: AgreementUserContext): Promise<{
        type: string;
        total: string;
    }[]>;
    /** Creates a new agreement record with direction/departement/vendor IDs. */
    createRecord(data: Omit<AgreementRecord, 'id' | 'direction' | 'departement' | 'vendor'> & {
        directionId: string;
        departementId: string;
        vendorId: string;
    }): Promise<AgreementRecord>;
    /** Saves an existing agreement record (e.g. after status/date mutations). */
    saveRecord(data: AgreementRecord): Promise<AgreementRecord>;
    /** Atomic status update — used by cron-job execution callbacks. */
    updateStatus(id: string, status: string): Promise<void>;
    save(agreement: Agreement): Promise<void>;
    delete(id: string): Promise<void>;
    findAllExecJobs(): Promise<ExecJobRecord[]>;
    saveExecJob(data: ExecJobRecord): Promise<ExecJobRecord>;
    deleteExecJob(name: string): Promise<void>;
}
//# sourceMappingURL=agreement-repository.d.ts.map