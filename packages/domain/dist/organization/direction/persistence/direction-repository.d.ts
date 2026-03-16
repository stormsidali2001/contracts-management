import { Direction } from '../direction';
export interface DirectionRepository {
    findById(id: string): Promise<Direction | null>;
    findAll(): Promise<Direction[]>;
    save(direction: Direction): Promise<void>;
    delete(id: string): Promise<void>;
}
//# sourceMappingURL=direction-repository.d.ts.map