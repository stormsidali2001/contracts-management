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
export declare class Direction extends AggregateRoot<DirectionId> {
    readonly title: OrganizationTitle;
    readonly abriviation: Abbreviation;
    readonly departementChiefId: string | null;
    private _departements;
    private constructor();
    static create(props: CreateDirectionProps): Direction;
    static reconstitute(props: DirectionProps): Direction;
    get departements(): ReadonlyArray<Departement>;
    addDepartement(props: CreateDepartementProps): Departement;
    removeDepartement(id: string): void;
    getDepartement(id: string): Departement | undefined;
    hasDepartement(id: string): boolean;
}
//# sourceMappingURL=direction.d.ts.map