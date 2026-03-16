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
export declare class Departement extends Entity<DepartementId> {
    readonly title: OrganizationTitle;
    readonly abriviation: Abbreviation;
    readonly directionId: DirectionId;
    private constructor();
    static create(props: CreateDepartementProps): Departement;
    static reconstitute(props: DepartementProps): Departement;
}
//# sourceMappingURL=departement.d.ts.map