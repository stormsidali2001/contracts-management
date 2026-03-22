import { UserService } from './user.service';
import { IUserRepository, UserProfile } from '../domain/user.repository';
import { User } from '../domain/user.aggregate';
import { Direction } from '../../direction/domain/direction';
import { Departement } from '../../direction/domain/departement';
import { UserRole } from '../../core/types/UserRole.enum';
import { ConflictError, ForbiddenError, NotFoundError } from '../../shared/domain/errors';

// ── Typed mock factory ───────────────────────────────────────────────────────

function mockOf<T>(methods: (keyof T)[]): jest.Mocked<T> {
  return Object.fromEntries(methods.map((m) => [m, jest.fn()])) as jest.Mocked<T>;
}

// ── Fixtures ─────────────────────────────────────────────────────────────────

function makeUser(overrides: Partial<Parameters<typeof User.create>[0]> = {}): User {
  return User.reconstitute({
    id: 'user-1', email: 'alice@x.com', username: 'alice',
    firstName: 'Alice', lastName: 'Smith',
    departementId: 'dept-1', directionId: 'dir-1',
    role: UserRole.EMPLOYEE,
    ...overrides,
  });
}

function makeProfile(user: User): UserProfile {
  return {
    ...user,
    departement: { id: 'dept-1', title: 'Dev', abriviation: 'DD' },
    direction: { id: 'dir-1', title: 'Tech', abriviation: 'TD' },
  } as unknown as UserProfile;
}

function makeDirection(): Direction {
  const dept = Departement.create({ id: 'dept-1', title: 'Dev', abriviation: 'DD', directionId: 'dir-1' });
  return Direction.create({ id: 'dir-1', title: 'Tech', abriviation: 'TD', departements: [dept] });
}

function makeCreateDto(overrides: Record<string, unknown> = {}) {
  return {
    email: 'alice@x.com', username: 'alice', firstName: 'Alice', lastName: 'Smith',
    directionId: 'dir-1', departementId: 'dept-1',
    ...overrides,
  };
}

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('UserService', () => {
  let userRepo: jest.Mocked<IUserRepository>;
  let directionService: { find: jest.Mock };
  let eventBus: { publishAll: jest.Mock };
  let service: UserService;

  beforeEach(() => {
    userRepo = mockOf<IUserRepository>([
      'save', 'delete', 'findById', 'findByEmailOrUsername', 'findProfileById',
      'findAdmins', 'findPaginated', 'getUserTypesStats',
      'findByDepartementId', 'findJuridicalsByOrg',
    ]);
    directionService = { find: jest.fn() };
    eventBus = { publishAll: jest.fn() };

    service = new UserService(userRepo, directionService as any, eventBus as any);
  });

  // ── create ──────────────────────────────────────────────────────────────────

  describe('create', () => {
    describe('happy path', () => {
      beforeEach(() => {
        directionService.find.mockResolvedValue(makeDirection());
        userRepo.save.mockImplementation(async (u) => u);
      });

      it('saves user, fires recordCreated event with org abbreviations', async () => {
        await service.create(makeCreateDto() as any);

        expect(userRepo.save).toHaveBeenCalledTimes(1);
        const saved: User = userRepo.save.mock.calls[0][0];
        expect(saved).toBeInstanceOf(User);
        expect(eventBus.publishAll).toHaveBeenCalledTimes(1);
      });

      it('resolves org data before saving when directionId and departementId provided', async () => {
        await service.create(makeCreateDto() as any);

        expect(directionService.find).toHaveBeenCalledWith('dir-1');
      });

      it('skips org lookup when no directionId/departementId provided', async () => {
        userRepo.save.mockImplementation(async (u) => u);

        await service.create(makeCreateDto({ directionId: null, departementId: null }) as any);

        expect(directionService.find).not.toHaveBeenCalled();
        expect(userRepo.save).toHaveBeenCalledTimes(1);
      });
    });

    describe('failure paths', () => {
      it('throws NotFoundError when direction is not found', async () => {
        directionService.find.mockResolvedValue(null);

        await expect(service.create(makeCreateDto() as any)).rejects.toThrow(NotFoundError);
        expect(userRepo.save).not.toHaveBeenCalled();
      });

      it('propagates repository error during save', async () => {
        directionService.find.mockResolvedValue(makeDirection());
        userRepo.save.mockRejectedValue(new Error('db error'));

        await expect(service.create(makeCreateDto() as any)).rejects.toThrow('db error');
      });
    });
  });

  // ── updateUserUniqueCheck ───────────────────────────────────────────────────

  describe('updateUserUniqueCheck', () => {
    const updateDto = { email: 'alice@x.com', username: 'alice', firstName: 'Alicia' };

    describe('happy path', () => {
      it('updates user, saves, and publishes updated event', async () => {
        const user = makeUser();
        const adminUser = makeUser({ id: 'admin-1', role: UserRole.ADMIN });
        const profile = makeProfile(user);
        const updateSpy = jest.spyOn(user, 'update');

        userRepo.findById
          .mockResolvedValueOnce(adminUser)  // currentUser lookup
          .mockResolvedValueOnce(user);       // target user lookup
        userRepo.findByEmailOrUsername.mockResolvedValue(user);
        userRepo.findProfileById
          .mockResolvedValueOnce(profile)    // duplicate check
          .mockResolvedValueOnce(profile);   // post-save profile
        userRepo.save.mockResolvedValue(user);

        await service.updateUserUniqueCheck('user-1', updateDto as any, 'admin-1');

        expect(updateSpy).toHaveBeenCalledTimes(1);
        expect(userRepo.save).toHaveBeenCalledTimes(1);
        expect(eventBus.publishAll).toHaveBeenCalledTimes(1);
      });
    });

    describe('failure paths', () => {
      it('throws NotFoundError when connected user is not found', async () => {
        userRepo.findById.mockResolvedValue(null);

        await expect(
          service.updateUserUniqueCheck('user-1', updateDto as any, 'missing-user'),
        ).rejects.toThrow(NotFoundError);
      });

      it('throws ForbiddenError when non-admin tries to update another user', async () => {
        const currentUser = makeUser({ id: 'current-1', role: UserRole.EMPLOYEE });
        const otherUserProfile = makeProfile(makeUser({ id: 'other-1' }));

        userRepo.findById.mockResolvedValue(currentUser);
        userRepo.findByEmailOrUsername.mockResolvedValue(makeUser({ id: 'other-1' }));
        userRepo.findProfileById.mockResolvedValue(otherUserProfile);

        await expect(
          service.updateUserUniqueCheck('user-1', updateDto as any, 'current-1'),
        ).rejects.toThrow(ForbiddenError);
        expect(userRepo.save).not.toHaveBeenCalled();
      });

      it('throws ConflictError when email/username belongs to a different user id', async () => {
        const adminUser = makeUser({ id: 'admin-1', role: UserRole.ADMIN });
        const conflictProfile = makeProfile(makeUser({ id: 'other-id' }));

        userRepo.findById.mockResolvedValue(adminUser);
        userRepo.findByEmailOrUsername.mockResolvedValue(makeUser({ id: 'other-id' }));
        userRepo.findProfileById.mockResolvedValue(conflictProfile);

        await expect(
          service.updateUserUniqueCheck('user-1', updateDto as any, 'admin-1'),
        ).rejects.toThrow(ConflictError);
        expect(userRepo.save).not.toHaveBeenCalled();
      });
    });
  });

  // ── deleteUser ──────────────────────────────────────────────────────────────

  describe('deleteUser', () => {
    describe('happy path', () => {
      it('deletes user and publishes deleted event', async () => {
        const user = makeUser();
        const profile = makeProfile(user);
        userRepo.findProfileById.mockResolvedValue(profile);
        userRepo.findById.mockResolvedValue(user);
        userRepo.delete.mockResolvedValue(undefined);

        await service.deleteUser('user-1');

        expect(userRepo.delete).toHaveBeenCalledWith('user-1');
        expect(eventBus.publishAll).toHaveBeenCalledTimes(1);
      });
    });

    describe('failure paths', () => {
      it('throws NotFoundError when user profile is not found', async () => {
        userRepo.findProfileById.mockResolvedValue(null);

        await expect(service.deleteUser('missing')).rejects.toThrow(NotFoundError);
        expect(userRepo.delete).not.toHaveBeenCalled();
      });
    });
  });

  // ── recieveNotifications ────────────────────────────────────────────────────

  describe('recieveNotifications', () => {
    it('happy path – toggles notification flag and saves', async () => {
      const user = makeUser({ recieve_notifications: false });
      const toggleSpy = jest.spyOn(user, 'toggleNotifications');
      userRepo.findById.mockResolvedValue(user);
      userRepo.save.mockImplementation(async (u) => u);

      const result = await service.recieveNotifications('user-1', false);

      expect(toggleSpy).toHaveBeenCalledTimes(1);
      expect(userRepo.save).toHaveBeenCalledTimes(1);
      expect(result).toBe(true); // inverted from input
    });
  });

  // ── updateImage ─────────────────────────────────────────────────────────────

  describe('updateImage', () => {
    it('happy path – updates image url and saves', async () => {
      const user = makeUser();
      const imageSpy = jest.spyOn(user, 'updateImage');
      userRepo.findById.mockResolvedValue(user);
      userRepo.save.mockImplementation(async (u) => u);

      await service.updateImage('user-1', 'https://cdn/img.png');

      expect(imageSpy).toHaveBeenCalledWith('https://cdn/img.png');
      expect(userRepo.save).toHaveBeenCalledTimes(1);
    });

    it('happy path – no-op when user is not found', async () => {
      userRepo.findById.mockResolvedValue(null);

      await expect(service.updateImage('missing', 'url')).resolves.not.toThrow();
      expect(userRepo.save).not.toHaveBeenCalled();
    });
  });
});
