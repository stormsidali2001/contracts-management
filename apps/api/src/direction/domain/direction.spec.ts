import { Direction } from './direction';
import { DirectionCreatedEvent } from './events/direction-created.event';
import { DirectionUpdatedEvent } from './events/direction-updated.event';
import { DepartementAddedEvent } from './events/departement-added.event';
import { DepartementUpdatedEvent } from './events/departement-updated.event';
import { DepartementRemovedEvent } from './events/departement-removed.event';
import { ConflictError, ForbiddenError, NotFoundError } from 'src/shared/domain/errors';
import { Departement } from './departement';

// ── Fixtures ─────────────────────────────────────────────────────────────────

function makeDept(id = 'dept-1', title = 'Dev', abriviation = 'DD'): Departement {
  return Departement.create({ id, title, abriviation, directionId: 'dir-1' });
}

function makeDirection(withDept = false): Direction {
  return Direction.reconstitute({
    id: 'dir-1',
    title: 'Tech',
    abriviation: 'TD',
    departements: withDept ? [makeDept()] : [],
  });
}

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('Direction aggregate', () => {
  // ── create ──────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('emits DirectionCreatedEvent', () => {
      const direction = Direction.create({ id: 'dir-1', title: 'Tech', abriviation: 'TD' });

      const events = direction.pullEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(DirectionCreatedEvent);
      expect((events[0] as DirectionCreatedEvent).directionId).toBe('dir-1');
    });

    it('emits one extra DepartementAddedEvent per initial departement added via addDepartement', () => {
      const direction = Direction.create({ id: 'dir-1', title: 'Tech', abriviation: 'TD' });
      direction.pullEvents(); // drain the created event

      direction.addDepartement('dept-1', 'Dev', 'DD');

      const events = direction.pullEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(DepartementAddedEvent);
    });
  });

  // ── reconstitute ────────────────────────────────────────────────────────────

  describe('reconstitute', () => {
    it('does NOT emit any events (load from DB is not a domain action)', () => {
      const direction = makeDirection(true);
      expect(direction.pullEvents()).toHaveLength(0);
    });
  });

  // ── rename ──────────────────────────────────────────────────────────────────

  describe('rename', () => {
    it('updates title and abriviation, emits DirectionUpdatedEvent', () => {
      const direction = makeDirection();
      direction.rename('New Title', 'NT');

      expect(direction.title).toBe('New Title');
      expect(direction.abriviation).toBe('NT');
      const events = direction.pullEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(DirectionUpdatedEvent);
      expect((events[0] as DirectionUpdatedEvent).directionId).toBe('dir-1');
    });
  });

  // ── addDepartement ───────────────────────────────────────────────────────────

  describe('addDepartement', () => {
    it('adds a departement and emits DepartementAddedEvent', () => {
      const direction = makeDirection();
      direction.addDepartement('dept-1', 'Dev', 'DD');

      expect(direction.departements).toHaveLength(1);
      const events = direction.pullEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(DepartementAddedEvent);
      expect((events[0] as DepartementAddedEvent).departementId).toBe('dept-1');
      expect((events[0] as DepartementAddedEvent).directionId).toBe('dir-1');
    });

    it('throws ConflictError when title or abriviation already exists', () => {
      const direction = makeDirection(true); // has dept-1 with title Dev, abbr DD

      expect(() => direction.addDepartement('dept-2', 'Dev', 'XY')).toThrow(ConflictError);
      expect(() => direction.addDepartement('dept-3', 'Other', 'DD')).toThrow(ConflictError);
      expect(direction.pullEvents()).toHaveLength(0);
    });
  });

  // ── updateDepartement ────────────────────────────────────────────────────────

  describe('updateDepartement', () => {
    it('renames the departement and emits DepartementUpdatedEvent', () => {
      const direction = makeDirection(true);
      direction.updateDepartement('dept-1', 'DevOps', 'DO');

      expect(direction.getDepartement('dept-1')!.title).toBe('DevOps');
      const events = direction.pullEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(DepartementUpdatedEvent);
      expect((events[0] as DepartementUpdatedEvent).departementId).toBe('dept-1');
    });

    it('throws NotFoundError when departement does not exist', () => {
      const direction = makeDirection();
      expect(() => direction.updateDepartement('no-such', 'T', 'T')).toThrow(NotFoundError);
    });

    it('throws ConflictError when new title/abbr conflicts with another departement', () => {
      const direction = makeDirection();
      direction.addDepartement('dept-1', 'Dev', 'DD');
      direction.addDepartement('dept-2', 'QA', 'QA');
      direction.pullEvents();

      expect(() => direction.updateDepartement('dept-2', 'Dev', 'QX')).toThrow(ConflictError);
    });
  });

  // ── removeDepartement ────────────────────────────────────────────────────────

  describe('removeDepartement', () => {
    it('removes the departement and emits DepartementRemovedEvent', () => {
      const direction = makeDirection(true);
      direction.removeDepartement('dept-1');

      expect(direction.departements).toHaveLength(0);
      const events = direction.pullEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(DepartementRemovedEvent);
      expect((events[0] as DepartementRemovedEvent).departementId).toBe('dept-1');
    });

    it('throws NotFoundError when departement does not exist', () => {
      const direction = makeDirection();
      expect(() => direction.removeDepartement('no-such')).toThrow(NotFoundError);
    });

    it('throws ForbiddenError when departement has employees', () => {
      const dept = makeDept();
      jest.spyOn(dept, 'hasEmployees').mockReturnValue(true);
      const direction = Direction.reconstitute({
        id: 'dir-1', title: 'Tech', abriviation: 'TD', departements: [dept],
      });

      expect(() => direction.removeDepartement('dept-1')).toThrow(ForbiddenError);
      expect(direction.pullEvents()).toHaveLength(0);
    });
  });

  // ── pullEvents drains ────────────────────────────────────────────────────────

  describe('pullEvents', () => {
    it('clears the event list after being called', () => {
      const direction = Direction.create({ id: 'dir-1', title: 'T', abriviation: 'T' });
      expect(direction.pullEvents()).toHaveLength(1);
      expect(direction.pullEvents()).toHaveLength(0);
    });
  });
});
