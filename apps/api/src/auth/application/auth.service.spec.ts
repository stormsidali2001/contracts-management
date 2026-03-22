import { AuthService } from './auth.service';
import { IUserCredentialsRepository } from '../domain/user-credentials.repository';
import { UserCredentials } from '../domain/user-credentials.aggregate';
import { User } from '../../user/domain/user.aggregate';
import { UserRole } from '../../core/types/UserRole.enum';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../../shared/domain/errors';
import { UserPasswordChangedEvent } from '../../user/domain/events/user-password-changed.event';

// ── Typed mock factory ───────────────────────────────────────────────────────

function mockOf<T>(methods: (keyof T)[]): jest.Mocked<T> {
  return Object.fromEntries(
    methods.map((m) => [m, jest.fn()]),
  ) as jest.Mocked<T>;
}

// ── Fixtures ─────────────────────────────────────────────────────────────────

function makeUser(
  overrides: Partial<Parameters<typeof User.create>[0]> = {},
): User {
  return User.reconstitute({
    id: 'user-1',
    email: 'alice@x.com',
    username: 'alice',
    firstName: 'Alice',
    lastName: 'Smith',
    active: true,
    role: UserRole.EMPLOYEE,
    ...overrides,
  });
}

function makeCredentials(
  overrides: Partial<Parameters<typeof UserCredentials.create>[0]> = {},
) {
  return UserCredentials.create({
    userId: 'user-1',
    passwordHash: 'hashed-pw',
    refreshTokenHash: null,
    ...overrides,
  });
}

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('AuthService', () => {
  let credsRepo: jest.Mocked<IUserCredentialsRepository>;
  let userService: {
    create: jest.Mock;
    findByEmailOrUsername: jest.Mock;
    findBy: jest.Mock;
  };
  let hashService: { hash: jest.Mock; compare: jest.Mock };
  let tokenService: { generateTokens: jest.Mock };
  let emailService: { sendPasswordResetEmail: jest.Mock };
  let eventBus: { publish: jest.Mock; publishAll: jest.Mock };
  let service: AuthService;

  beforeEach(() => {
    credsRepo = mockOf<IUserCredentialsRepository>([
      'save',
      'findByUserId',
      'findByEmail',
      'findByEmailWithToken',
      'findByUserIdWithToken',
    ]);
    userService = {
      create: jest.fn(),
      findByEmailOrUsername: jest.fn(),
      findBy: jest.fn(),
    };
    hashService = { hash: jest.fn(), compare: jest.fn() };
    tokenService = { generateTokens: jest.fn() };
    emailService = { sendPasswordResetEmail: jest.fn() };
    eventBus = { publish: jest.fn(), publishAll: jest.fn() };

    service = new AuthService(
      userService as any,
      hashService as any,
      tokenService as any,
      emailService as any,
      credsRepo,
      eventBus as any,
    );
  });

  // ── register ────────────────────────────────────────────────────────────────

  describe('register', () => {
    const dto = {
      email: 'alice@x.com',
      username: 'alice',
      firstName: 'Alice',
      lastName: 'Smith',
      password: 'pass',
    };

    describe('happy path', () => {
      it('creates user profile and persists credentials separately', async () => {
        userService.findByEmailOrUsername.mockResolvedValue(null);
        hashService.hash.mockResolvedValue('hashed-pw');
        userService.create.mockResolvedValue(makeUser());
        credsRepo.save.mockResolvedValue(undefined);

        const result = await service.register(dto as any);

        expect(userService.create).toHaveBeenCalledTimes(1);
        // password must NOT be forwarded to userService.create
        const userCreateArg = userService.create.mock.calls[0][0];
        expect(userCreateArg).not.toHaveProperty('password');

        expect(credsRepo.save).toHaveBeenCalledTimes(1);
        const savedCreds: UserCredentials = credsRepo.save.mock.calls[0][0];
        expect(savedCreds).toBeInstanceOf(UserCredentials);
        expect(savedCreds.passwordHash).toBe('hashed-pw');

        expect(result).toBeInstanceOf(User);
      });

      it('generates a random password hash via randomBytes when none provided', async () => {
        const { password: _, ...dtoNoPass } = dto;
        userService.findByEmailOrUsername.mockResolvedValue(null);
        userService.create.mockResolvedValue(makeUser());
        credsRepo.save.mockResolvedValue(undefined);

        await service.register(dtoNoPass as any);

        // randomBytes path: hashService.hash is NOT called — the random hex IS the hash
        expect(hashService.hash).not.toHaveBeenCalled();
        expect(credsRepo.save).toHaveBeenCalledTimes(1);
        const savedCreds: UserCredentials = credsRepo.save.mock.calls[0][0];
        // password hash should be a 64-char hex string (32 random bytes)
        expect(savedCreds.passwordHash).toMatch(/^[0-9a-f]{64}$/);
      });
    });

    describe('failure paths', () => {
      it('throws ConflictError when email is already taken', async () => {
        userService.findByEmailOrUsername.mockResolvedValue(
          makeUser({ email: 'alice@x.com' }),
        );

        await expect(service.register(dto as any)).rejects.toThrow(
          ConflictError,
        );
        expect(userService.create).not.toHaveBeenCalled();
        expect(credsRepo.save).not.toHaveBeenCalled();
      });

      it('throws ConflictError when username is already taken', async () => {
        userService.findByEmailOrUsername.mockResolvedValue(
          makeUser({ email: 'other@x.com', username: 'alice' }),
        );

        await expect(service.register(dto as any)).rejects.toThrow(
          ConflictError,
        );
      });
    });
  });

  // ── login ───────────────────────────────────────────────────────────────────

  describe('login', () => {
    const dto = { email: 'alice@x.com', password: 'correct-pass' };
    const tokens = { access_token: 'acc', refresh_token: 'ref' };

    describe('happy path', () => {
      it('returns tokens and stores hashed refresh token in credentials', async () => {
        const user = makeUser();
        const creds = makeCredentials();
        const setTokenSpy = jest.spyOn(creds, 'setRefreshToken');

        userService.findByEmailOrUsername.mockResolvedValue(user);
        credsRepo.findByEmail.mockResolvedValue(creds);
        hashService.compare.mockResolvedValue(true);
        tokenService.generateTokens.mockResolvedValue(tokens);
        hashService.hash.mockResolvedValue('hashed-refresh');
        credsRepo.save.mockResolvedValue(undefined);

        const result = await service.login(dto as any);

        expect(setTokenSpy).toHaveBeenCalledWith('hashed-refresh');
        expect(credsRepo.save).toHaveBeenCalledTimes(1);
        expect(result).toEqual(tokens);
      });
    });

    describe('failure paths', () => {
      it('throws NotFoundError when user does not exist', async () => {
        userService.findByEmailOrUsername.mockResolvedValue(null);

        await expect(service.login(dto as any)).rejects.toThrow(NotFoundError);
      });

      it('throws ValidationError when password does not match', async () => {
        userService.findByEmailOrUsername.mockResolvedValue(makeUser());
        credsRepo.findByEmail.mockResolvedValue(makeCredentials());
        hashService.compare.mockResolvedValue(false);

        await expect(service.login(dto as any)).rejects.toThrow(
          ValidationError,
        );
        expect(credsRepo.save).not.toHaveBeenCalled();
      });

      it('throws ForbiddenError when account is deactivated', async () => {
        userService.findByEmailOrUsername.mockResolvedValue(
          makeUser({ active: false }),
        );
        credsRepo.findByEmail.mockResolvedValue(makeCredentials());
        hashService.compare.mockResolvedValue(true);

        await expect(service.login(dto as any)).rejects.toThrow(ForbiddenError);
      });
    });
  });

  // ── logout ──────────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('happy path – clears refresh token and saves credentials', async () => {
      const creds = makeCredentials({ refreshTokenHash: 'old-hash' });
      const clearSpy = jest.spyOn(creds, 'clearRefreshToken');
      credsRepo.findByUserId.mockResolvedValue(creds);
      credsRepo.save.mockResolvedValue(undefined);

      await service.logout('user-1');

      expect(clearSpy).toHaveBeenCalledTimes(1);
      expect(credsRepo.save).toHaveBeenCalledTimes(1);
    });

    it('happy path – no-op when credentials not found (already logged out)', async () => {
      credsRepo.findByUserId.mockResolvedValue(null);

      await expect(service.logout('user-1')).resolves.not.toThrow();
      expect(credsRepo.save).not.toHaveBeenCalled();
    });
  });

  // ── forgotPassword ──────────────────────────────────────────────────────────

  describe('forgotPassword', () => {
    describe('happy path', () => {
      it('stores hashed reset token on credentials and sends email', async () => {
        const creds = makeCredentials();
        const requestSpy = jest.spyOn(creds, 'requestPasswordReset');
        credsRepo.findByEmailWithToken.mockResolvedValue(creds);
        hashService.hash.mockResolvedValue('hashed-token');
        credsRepo.save.mockResolvedValue(undefined);
        emailService.sendPasswordResetEmail.mockResolvedValue(undefined);

        const result = await service.forgotPassword({ email: 'alice@x.com' });

        expect(requestSpy).toHaveBeenCalledWith(
          'hashed-token',
          expect.any(Date),
        );
        expect(credsRepo.save).toHaveBeenCalledTimes(1);
        expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith(
          'alice@x.com',
          'user-1',
          expect.any(String),
        );
        expect(result).toBe('sent');
      });
    });

    describe('failure paths', () => {
      it('throws NotFoundError when no credentials exist for email', async () => {
        credsRepo.findByEmailWithToken.mockResolvedValue(null);

        await expect(
          service.forgotPassword({ email: 'unknown@x.com' }),
        ).rejects.toThrow(NotFoundError);
        expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
      });
    });
  });

  // ── resetPassword ───────────────────────────────────────────────────────────

  describe('resetPassword', () => {
    const dto = { password: 'new-pass', token: 'raw-token', userId: 'user-1' };

    describe('happy path', () => {
      it('resets password, saves credentials, and publishes password changed event', async () => {
        const creds = makeCredentials({
          passwordToken: {
            token: 'hashed-reset',
            expiresIn: new Date(Date.now() + 60_000),
          },
        });
        const resetSpy = jest.spyOn(creds, 'resetPassword');
        credsRepo.findByUserIdWithToken.mockResolvedValue(creds);
        hashService.compare.mockResolvedValue(true);
        hashService.hash.mockResolvedValue('new-hashed-pw');
        credsRepo.save.mockResolvedValue(undefined);

        const result = await service.resetPassword(dto);

        expect(resetSpy).toHaveBeenCalledWith('new-hashed-pw');
        expect(credsRepo.save).toHaveBeenCalledTimes(1);
        expect(eventBus.publish).toHaveBeenCalledWith(
          expect.any(UserPasswordChangedEvent),
        );
        expect(result).toBe('done');
      });
    });

    describe('failure paths', () => {
      it('throws NotFoundError when credentials not found', async () => {
        credsRepo.findByUserIdWithToken.mockResolvedValue(null);

        await expect(service.resetPassword(dto)).rejects.toThrow(NotFoundError);
      });

      it('throws UnauthorizedError when no pending reset token', async () => {
        credsRepo.findByUserIdWithToken.mockResolvedValue(
          makeCredentials({ passwordToken: null }),
        );

        await expect(service.resetPassword(dto)).rejects.toThrow(
          UnauthorizedError,
        );
      });

      it('throws UnauthorizedError when token does not match', async () => {
        const creds = makeCredentials({
          passwordToken: {
            token: 'hashed-reset',
            expiresIn: new Date(Date.now() + 60_000),
          },
        });
        credsRepo.findByUserIdWithToken.mockResolvedValue(creds);
        hashService.compare.mockResolvedValue(false);

        await expect(service.resetPassword(dto)).rejects.toThrow(
          UnauthorizedError,
        );
        expect(credsRepo.save).not.toHaveBeenCalled();
      });

      it('throws UnauthorizedError when reset token has expired', async () => {
        const creds = makeCredentials({
          passwordToken: {
            token: 'hashed-reset',
            expiresIn: new Date(Date.now() - 60_000),
          },
        });
        credsRepo.findByUserIdWithToken.mockResolvedValue(creds);
        hashService.compare.mockResolvedValue(true);

        await expect(service.resetPassword(dto)).rejects.toThrow(
          UnauthorizedError,
        );
        expect(credsRepo.save).not.toHaveBeenCalled();
      });
    });
  });

  // ── connectedUserResetPassword ───────────────────────────────────────────────

  describe('connectedUserResetPassword', () => {
    const dto = { actualPassword: 'old-pass', password: 'new-pass' };

    describe('happy path', () => {
      it('verifies current password, resets to new one, and saves', async () => {
        const creds = makeCredentials();
        const resetSpy = jest.spyOn(creds, 'resetPassword');
        credsRepo.findByUserId.mockResolvedValue(creds);
        hashService.compare.mockResolvedValue(true);
        hashService.hash.mockResolvedValue('new-hashed');
        credsRepo.save.mockResolvedValue(undefined);

        const result = await service.connectedUserResetPassword(dto, 'user-1');

        expect(hashService.compare).toHaveBeenCalledWith(
          'old-pass',
          'hashed-pw',
        );
        expect(resetSpy).toHaveBeenCalledWith('new-hashed');
        expect(credsRepo.save).toHaveBeenCalledTimes(1);
        expect(result).toBe('done');
      });
    });

    describe('failure paths', () => {
      it('throws NotFoundError when credentials not found', async () => {
        credsRepo.findByUserId.mockResolvedValue(null);

        await expect(
          service.connectedUserResetPassword(dto, 'user-1'),
        ).rejects.toThrow(NotFoundError);
      });

      it('throws ValidationError when actual password is incorrect', async () => {
        credsRepo.findByUserId.mockResolvedValue(makeCredentials());
        hashService.compare.mockResolvedValue(false);

        await expect(
          service.connectedUserResetPassword(dto, 'user-1'),
        ).rejects.toThrow(ValidationError);
        expect(credsRepo.save).not.toHaveBeenCalled();
      });
    });
  });
});
