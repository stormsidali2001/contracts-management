import { Agreement } from '../agreement';
export interface AgreementRepository {
    findById(id: string): Promise<Agreement | null>;
    findAll(filters?: {
        vendorId?: string;
        directionId?: string;
        departementId?: string;
        status?: string;
        type?: string;
    }): Promise<Agreement[]>;
    save(agreement: Agreement): Promise<void>;
    delete(id: string): Promise<void>;
}
//# sourceMappingURL=agreement-repository.d.ts.map