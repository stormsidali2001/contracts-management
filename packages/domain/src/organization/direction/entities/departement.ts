import { Entity } from '../../../shared/entity';
import { Abbreviation } from '../value-objects/abbreviation';
import { DepartementId } from '../value-objects/departement-id';
import { DirectionId } from '../value-objects/direction-id';
import { OrganizationTitle } from '../value-objects/organization-title';

export interface DepartementProps {
  id: DepartementId;
  title: OrganizationTitle;
  /** Maps to `abriviation` column in DB (typo preserved to match DB) */
  abriviation: Abbreviation;
  directionId: DirectionId;
}

export interface CreateDepartementProps {
  id: string;
  title: string;
  abriviation: string;
  directionId: string;
}

export class Departement extends Entity<DepartementId> {
  readonly title: OrganizationTitle;
  readonly abriviation: Abbreviation;
  readonly directionId: DirectionId;

  private constructor(props: DepartementProps) {
    super(props.id);
    this.title = props.title;
    this.abriviation = props.abriviation;
    this.directionId = props.directionId;
  }

  static create(props: CreateDepartementProps): Departement {
    return new Departement({
      id: new DepartementId(props.id),
      title: new OrganizationTitle(props.title),
      abriviation: new Abbreviation(props.abriviation),
      directionId: new DirectionId(props.directionId),
    });
  }

  static reconstitute(props: DepartementProps): Departement {
    return new Departement(props);
  }
}
