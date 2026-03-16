"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Direction = void 0;
const aggregate_root_1 = require("../../shared/aggregate-root");
const departement_1 = require("./entities/departement");
const abbreviation_1 = require("./value-objects/abbreviation");
const direction_id_1 = require("./value-objects/direction-id");
const organization_title_1 = require("./value-objects/organization-title");
class Direction extends aggregate_root_1.AggregateRoot {
    constructor(props) {
        super(props.id);
        this.title = props.title;
        this.abriviation = props.abriviation;
        this.departementChiefId = props.departementChiefId ?? null;
        this._departements = [...props.departements];
    }
    static create(props) {
        const departements = (props.departements ?? []).map((d) => departement_1.Departement.create({ ...d, directionId: props.id }));
        return new Direction({
            id: new direction_id_1.DirectionId(props.id),
            title: new organization_title_1.OrganizationTitle(props.title),
            abriviation: new abbreviation_1.Abbreviation(props.abriviation),
            departementChiefId: props.departementChiefId ?? null,
            departements,
        });
    }
    static reconstitute(props) {
        return new Direction(props);
    }
    get departements() {
        return this._departements;
    }
    addDepartement(props) {
        const dept = departement_1.Departement.create({ ...props, directionId: this.getId().value });
        this._departements.push(dept);
        return dept;
    }
    removeDepartement(id) {
        const index = this._departements.findIndex((d) => d.getId().value === id);
        if (index === -1) {
            throw new Error(`Departement "${id}" not found in direction "${this.getId().value}"`);
        }
        this._departements.splice(index, 1);
    }
    getDepartement(id) {
        return this._departements.find((d) => d.getId().value === id);
    }
    hasDepartement(id) {
        return this._departements.some((d) => d.getId().value === id);
    }
}
exports.Direction = Direction;
//# sourceMappingURL=direction.js.map