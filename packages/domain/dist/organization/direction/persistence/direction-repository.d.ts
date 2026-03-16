import { Direction } from '../direction';
export interface DepartementInDirectionSummary {
    id: string;
    title: string;
    abriviation: string;
    users?: number;
}
export interface DirectionSummary {
    id: string;
    title: string;
    abriviation: string;
    departements: DepartementInDirectionSummary[];
    agreementCount?: number;
}
export interface DirectionRepository {
    findById(id: string): Promise<Direction | null>;
    findAll(): Promise<Direction[]>;
    /** Returns a Direction aggregate whose `departements` list contains only the one matching `departementId`. */
    findWithDepartement(directionId: string, departementId: string): Promise<Direction | null>;
    findPaginated(offset: number, limit: number): Promise<DirectionSummary[]>;
    getTopDirections(): Promise<DirectionSummary[]>;
    /** Transactional create — checks uniqueness, saves direction + departements, returns summary. */
    saveNew(direction: Direction): Promise<DirectionSummary>;
    save(direction: Direction): Promise<void>;
    delete(id: string): Promise<void>;
    deleteWithDepartements(id: string): Promise<void>;
}
//# sourceMappingURL=direction-repository.d.ts.map