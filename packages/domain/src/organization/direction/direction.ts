import { AggregateRoot } from '../../shared/aggregate-root';
import { Departement, CreateDepartementProps } from './entities/departement';
import { Abbreviation } from './value-objects/abbreviation';
import { DirectionId } from './value-objects/direction-id';
import { OrganizationTitle } from './value-objects/organization-title';

export interface DirectionProps {
  id: DirectionId;
  title: OrganizationTitle;
  /** Maps to `abriviation` column in DB (typo preserved to match DB) */
  abriviation: Abbreviation;
  /** Cross-aggregate reference to the User who is the department chief */
  departementChiefId: string | null;
  departements: Departement[];
}

export interface CreateDirectionProps {
  id: string;
  title: string;
  abriviation: string;
  departementChiefId?: string | null;
  departements?: CreateDepartementProps[];
}

export class Direction extends AggregateRoot<DirectionId> {
  readonly title: OrganizationTitle;
  readonly abriviation: Abbreviation;
  readonly departementChiefId: string | null;
  private _departements: Departement[];

  private constructor(props: DirectionProps) {
    super(props.id);
    this.title = props.title;
    this.abriviation = props.abriviation;
    this.departementChiefId = props.departementChiefId ?? null;
    this._departements = [...props.departements];
  }

  static create(props: CreateDirectionProps): Direction {
    const departements = (props.departements ?? []).map((d) =>
      Departement.create({ ...d, directionId: props.id }),
    );
    return new Direction({
      id: new DirectionId(props.id),
      title: new OrganizationTitle(props.title),
      abriviation: new Abbreviation(props.abriviation),
      departementChiefId: props.departementChiefId ?? null,
      departements,
    });
  }

  static reconstitute(props: DirectionProps): Direction {
    return new Direction(props);
  }

  get departements(): ReadonlyArray<Departement> {
    return this._departements;
  }

  addDepartement(props: CreateDepartementProps): Departement {
    const dept = Departement.create({ ...props, directionId: this.getId().value });
    this._departements.push(dept);
    return dept;
  }

  removeDepartement(id: string): void {
    const index = this._departements.findIndex((d) => d.getId().value === id);
    if (index === -1) {
      throw new Error(
        `Departement "${id}" not found in direction "${this.getId().value}"`,
      );
    }
    this._departements.splice(index, 1);
  }

  getDepartement(id: string): Departement | undefined {
    return this._departements.find((d) => d.getId().value === id);
  }

  hasDepartement(id: string): boolean {
    return this._departements.some((d) => d.getId().value === id);
  }
}
