import { describe, it, expect } from 'vitest';
import { Direction } from '../direction';

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeDirection(overrides: Partial<Parameters<typeof Direction.create>[0]> = {}): Direction {
  return Direction.create({
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    title: 'Direction des Ressources Humaines',
    abriviation: 'DRH',
    ...overrides,
  });
}

function makeDeptProps(overrides: Record<string, string> = {}) {
  return {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    title: 'Département Formation',
    abriviation: 'DF',
    directionId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    ...overrides,
  };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('Direction (Aggregate Root)', () => {

  describe('create', () => {
    it('happy path – should create direction with no departements by default', () => {
      // Act
      const direction = makeDirection();

      // Assert
      expect(direction.title.value).toBe('Direction des Ressources Humaines');
      expect(direction.abriviation.value).toBe('DRH');
      expect(direction.departements).toHaveLength(0);
      expect(direction.departementChiefId).toBeNull();
    });

    it('happy path – should create direction with initial departements', () => {
      // Arrange + Act
      const direction = makeDirection({
        departements: [makeDeptProps()],
      });

      // Assert
      expect(direction.departements).toHaveLength(1);
      expect(direction.departements[0].title.value).toBe('Département Formation');
    });

    it('happy path – abbreviation is uppercased automatically', () => {
      const direction = makeDirection({ abriviation: 'drh' });
      expect(direction.abriviation.value).toBe('DRH');
    });

    it('failure path – should throw when title is empty', () => {
      expect(() => makeDirection({ title: '' }))
        .toThrowError('Organization title must not be empty');
    });

    it('failure path – should throw when abbreviation is shorter than 2 chars', () => {
      expect(() => makeDirection({ abriviation: 'D' }))
        .toThrowError('Abbreviation must be between 2 and 10 characters');
    });

    it('failure path – should throw when abbreviation is longer than 10 chars', () => {
      expect(() => makeDirection({ abriviation: 'TOOLONGABBR' }))
        .toThrowError('Abbreviation must be between 2 and 10 characters');
    });
  });

  describe('addDepartement', () => {
    it('happy path – should add a departement and make it retrievable', () => {
      // Arrange
      const direction = makeDirection();

      // Act
      const dept = direction.addDepartement(makeDeptProps());

      // Assert
      expect(direction.departements).toHaveLength(1);
      expect(dept.title.value).toBe('Département Formation');
      expect(dept.abriviation.value).toBe('DF');
      expect(direction.hasDepartement(dept.getId().value)).toBe(true);
    });

    it('happy path – should add multiple departements independently', () => {
      const direction = makeDirection();

      direction.addDepartement(makeDeptProps({ id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', title: 'Dept A', abriviation: 'DA' }));
      direction.addDepartement(makeDeptProps({ id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', title: 'Dept B', abriviation: 'DB' }));

      expect(direction.departements).toHaveLength(2);
    });
  });

  describe('removeDepartement', () => {
    it('happy path – should remove a departement by id', () => {
      // Arrange
      const direction = makeDirection();
      const dept = direction.addDepartement(makeDeptProps());
      const deptId = dept.getId().value;

      // Act
      direction.removeDepartement(deptId);

      // Assert
      expect(direction.departements).toHaveLength(0);
      expect(direction.hasDepartement(deptId)).toBe(false);
    });

    it('failure path – should throw when departement id does not exist', () => {
      const direction = makeDirection();

      expect(() => direction.removeDepartement('ffffffff-ffff-ffff-ffff-ffffffffffff'))
        .toThrowError('not found in direction');
    });
  });

  describe('getDepartement', () => {
    it('happy path – should return existing departement', () => {
      const direction = makeDirection();
      const dept = direction.addDepartement(makeDeptProps());

      expect(direction.getDepartement(dept.getId().value)).toBe(dept);
    });

    it('failure path – should return undefined for unknown id', () => {
      const direction = makeDirection();

      expect(direction.getDepartement('ffffffff-ffff-ffff-ffff-ffffffffffff')).toBeUndefined();
    });
  });
});
