"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const direction_1 = require("../direction");
// ─── Helpers ────────────────────────────────────────────────────────────────
function makeDirection(overrides = {}) {
    return direction_1.Direction.create({
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        title: 'Direction des Ressources Humaines',
        abriviation: 'DRH',
        ...overrides,
    });
}
function makeDeptProps(overrides = {}) {
    return {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        title: 'Département Formation',
        abriviation: 'DF',
        directionId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        ...overrides,
    };
}
// ─── Tests ──────────────────────────────────────────────────────────────────
(0, vitest_1.describe)('Direction (Aggregate Root)', () => {
    (0, vitest_1.describe)('create', () => {
        (0, vitest_1.it)('happy path – should create direction with no departements by default', () => {
            // Act
            const direction = makeDirection();
            // Assert
            (0, vitest_1.expect)(direction.title.value).toBe('Direction des Ressources Humaines');
            (0, vitest_1.expect)(direction.abriviation.value).toBe('DRH');
            (0, vitest_1.expect)(direction.departements).toHaveLength(0);
            (0, vitest_1.expect)(direction.departementChiefId).toBeNull();
        });
        (0, vitest_1.it)('happy path – should create direction with initial departements', () => {
            // Arrange + Act
            const direction = makeDirection({
                departements: [makeDeptProps()],
            });
            // Assert
            (0, vitest_1.expect)(direction.departements).toHaveLength(1);
            (0, vitest_1.expect)(direction.departements[0].title.value).toBe('Département Formation');
        });
        (0, vitest_1.it)('happy path – abbreviation is uppercased automatically', () => {
            const direction = makeDirection({ abriviation: 'drh' });
            (0, vitest_1.expect)(direction.abriviation.value).toBe('DRH');
        });
        (0, vitest_1.it)('failure path – should throw when title is empty', () => {
            (0, vitest_1.expect)(() => makeDirection({ title: '' }))
                .toThrowError('Organization title must not be empty');
        });
        (0, vitest_1.it)('failure path – should throw when abbreviation is shorter than 2 chars', () => {
            (0, vitest_1.expect)(() => makeDirection({ abriviation: 'D' }))
                .toThrowError('Abbreviation must be between 2 and 10 characters');
        });
        (0, vitest_1.it)('failure path – should throw when abbreviation is longer than 10 chars', () => {
            (0, vitest_1.expect)(() => makeDirection({ abriviation: 'TOOLONGABBR' }))
                .toThrowError('Abbreviation must be between 2 and 10 characters');
        });
    });
    (0, vitest_1.describe)('addDepartement', () => {
        (0, vitest_1.it)('happy path – should add a departement and make it retrievable', () => {
            // Arrange
            const direction = makeDirection();
            // Act
            const dept = direction.addDepartement(makeDeptProps());
            // Assert
            (0, vitest_1.expect)(direction.departements).toHaveLength(1);
            (0, vitest_1.expect)(dept.title.value).toBe('Département Formation');
            (0, vitest_1.expect)(dept.abriviation.value).toBe('DF');
            (0, vitest_1.expect)(direction.hasDepartement(dept.getId().value)).toBe(true);
        });
        (0, vitest_1.it)('happy path – should add multiple departements independently', () => {
            const direction = makeDirection();
            direction.addDepartement(makeDeptProps({ id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', title: 'Dept A', abriviation: 'DA' }));
            direction.addDepartement(makeDeptProps({ id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', title: 'Dept B', abriviation: 'DB' }));
            (0, vitest_1.expect)(direction.departements).toHaveLength(2);
        });
    });
    (0, vitest_1.describe)('removeDepartement', () => {
        (0, vitest_1.it)('happy path – should remove a departement by id', () => {
            // Arrange
            const direction = makeDirection();
            const dept = direction.addDepartement(makeDeptProps());
            const deptId = dept.getId().value;
            // Act
            direction.removeDepartement(deptId);
            // Assert
            (0, vitest_1.expect)(direction.departements).toHaveLength(0);
            (0, vitest_1.expect)(direction.hasDepartement(deptId)).toBe(false);
        });
        (0, vitest_1.it)('failure path – should throw when departement id does not exist', () => {
            const direction = makeDirection();
            (0, vitest_1.expect)(() => direction.removeDepartement('ffffffff-ffff-ffff-ffff-ffffffffffff'))
                .toThrowError('not found in direction');
        });
    });
    (0, vitest_1.describe)('getDepartement', () => {
        (0, vitest_1.it)('happy path – should return existing departement', () => {
            const direction = makeDirection();
            const dept = direction.addDepartement(makeDeptProps());
            (0, vitest_1.expect)(direction.getDepartement(dept.getId().value)).toBe(dept);
        });
        (0, vitest_1.it)('failure path – should return undefined for unknown id', () => {
            const direction = makeDirection();
            (0, vitest_1.expect)(direction.getDepartement('ffffffff-ffff-ffff-ffff-ffffffffffff')).toBeUndefined();
        });
    });
});
//# sourceMappingURL=direction.test.js.map