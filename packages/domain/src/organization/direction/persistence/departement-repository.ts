import { Departement } from '../entities/departement';

export interface DepartementSummary {
  id: string;
  title: string;
  abriviation: string;
  directionId: string;
  users?: number;
}

export interface DepartementRepository {
  findById(id: string): Promise<Departement | null>;
  findDirectionById(directionId: string): Promise<{ id: string } | null>;
  findByTitleOrAbbreviationInDirection(
    title: string,
    abriviation: string,
    directionId: string,
  ): Promise<Departement | null>;
  findByIdWithUserCount(id: string): Promise<(DepartementSummary & { users: number }) | null>;
  findPaginated(offset: number, limit: number): Promise<DepartementSummary[]>;
  /** Persists a departement and returns the summary. */
  save(departement: Departement): Promise<DepartementSummary>;
  delete(id: string): Promise<void>;
}
