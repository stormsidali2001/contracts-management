"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Departement = void 0;
const entity_1 = require("../../../shared/entity");
const abbreviation_1 = require("../value-objects/abbreviation");
const departement_id_1 = require("../value-objects/departement-id");
const direction_id_1 = require("../value-objects/direction-id");
const organization_title_1 = require("../value-objects/organization-title");
class Departement extends entity_1.Entity {
    constructor(props) {
        super(props.id);
        this.title = props.title;
        this.abriviation = props.abriviation;
        this.directionId = props.directionId;
    }
    static create(props) {
        return new Departement({
            id: new departement_id_1.DepartementId(props.id),
            title: new organization_title_1.OrganizationTitle(props.title),
            abriviation: new abbreviation_1.Abbreviation(props.abriviation),
            directionId: new direction_id_1.DirectionId(props.directionId),
        });
    }
    static reconstitute(props) {
        return new Departement(props);
    }
}
exports.Departement = Departement;
//# sourceMappingURL=departement.js.map