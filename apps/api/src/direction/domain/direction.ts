import { Departement } from './departement';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from 'src/shared/domain/errors';

export class Direction {
  readonly id: string;
  title: string;
  abriviation: string;
  private _departements: Departement[];
  readonly agreementCount?: number;

  private constructor(props: {
    id: string;
    title: string;
    abriviation: string;
    departements: Departement[];
    agreementCount?: number;
  }) {
    this.id = props.id;
    this.title = props.title;
    this.abriviation = props.abriviation;
    this._departements = props.departements;
    this.agreementCount = props.agreementCount;
  }

  // ── Factory ───────────────────────────────────────────────────────────────

  static create(props: {
    id: string;
    title: string;
    abriviation: string;
    departements?: Departement[];
    agreementCount?: number;
  }): Direction {
    return new Direction({ ...props, departements: props.departements ?? [] });
  }

  // ── Queries ───────────────────────────────────────────────────────────────

  get departements(): readonly Departement[] {
    return this._departements;
  }

  getDepartement(id: string): Departement | undefined {
    return this._departements.find((d) => d.id === id);
  }

  // ── Invariant-enforcing mutations ─────────────────────────────────────────

  rename(title: string, abriviation: string): void {
    this.title = title;
    this.abriviation = abriviation;
  }

  addDepartement(id: string, title: string, abriviation: string): void {
    if (this.hasConflict(title, abriviation)) {
      throw new ConflictError(
        'un departement avec les memes identifiant exist deja dans cette direction',
      );
    }
    this._departements.push(
      Departement.create({ id, title, abriviation, directionId: this.id }),
    );
  }

  updateDepartement(
    departementId: string,
    title: string,
    abriviation: string,
  ): void {
    const dp = this._departements.find((d) => d.id === departementId);
    if (!dp) throw new NotFoundError("le departement n'existe pas");

    if (
      this._departements.some(
        (d) =>
          d.id !== departementId &&
          (d.title === title || d.abriviation === abriviation),
      )
    ) {
      throw new ConflictError(
        'un departement avec les memes identifiant exist deja dans cette direction',
      );
    }

    dp.rename(title, abriviation);
  }

  removeDepartement(departementId: string): void {
    const dp = this._departements.find((d) => d.id === departementId);
    if (!dp) throw new NotFoundError("le departement n'existe pas.");
    if (dp.hasEmployees())
      throw new ForbiddenError(
        'vous ne pouvez pas supprimer le departement car il contient des utilisateurs',
      );
    this._departements = this._departements.filter(
      (d) => d.id !== departementId,
    );
  }

  canBeDeleted(): boolean {
    return !this._departements.some((d) => d.hasEmployees());
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private hasConflict(title: string, abriviation: string): boolean {
    return this._departements.some(
      (d) => d.title === title || d.abriviation === abriviation,
    );
  }
}
