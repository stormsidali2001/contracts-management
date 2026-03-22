import { Departement } from './departement';
import { Direction } from './direction';

export interface IDirectionRepository {
  /**
   * Persist the full aggregate state (create or update).
   * The implementation diffs and syncs the departements collection.
   */
  save(direction: Direction): Promise<Direction>;

  delete(id: string): Promise<void>;

  findById(id: string): Promise<Direction | null>;

  /**
   * Load the direction that owns the given departement.
   * Needed when a use-case only knows the departement id.
   */
  findByDepartementId(departementId: string): Promise<Direction | null>;

  /** Uniqueness check before creating or renaming a direction. */
  findByTitleOrAbriviation(
    title: string,
    abriviation: string,
  ): Promise<Direction | null>;

  findAll(offset: number, limit: number): Promise<Direction[]>;

  /** Loads directions with their agreement count for the stats use-case. */
  getTopDirections(): Promise<Direction[]>;

  // ── Read-model queries (bypass aggregate for lightweight reads) ──────────

  findDepartementById(id: string): Promise<Departement | null>;

  findAllDepartements(offset: number, limit: number): Promise<Departement[]>;
}

export const DIRECTION_REPOSITORY = Symbol('IDirectionRepository');
