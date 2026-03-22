import { Injectable, Inject } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import {
  ConnectedUserResetPassword,
  CreateUserDTO,
  ForgotPasswordDTO,
  LoginUserDTO,
  ResetPasswordDTO,
} from 'src/core/dtos/user.dto';
import { UserService } from 'src/user/application/user.service';
import { User } from 'src/user/domain/user.aggregate';
import { JwtPayload } from '../types/JwtPayload.interface';
import { UserRole } from 'src/core/types/UserRole.enum';
import { randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import {
  IUserCredentialsRepository,
  USER_CREDENTIALS_REPOSITORY,
} from '../domain/user-credentials.repository';
import { UserCredentials } from '../domain/user-credentials.aggregate';
import { UserPasswordChangedEvent } from 'src/user/domain/events/user-password-changed.event';
import { HashService } from '../services/hash.service';
import { TokenService } from '../services/token.service';
import { EmailService } from 'src/shared/email/email.service';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from 'src/shared/domain/errors';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly hashService: HashService,
    private readonly tokenService: TokenService,
    private readonly emailService: EmailService,
    @Inject(USER_CREDENTIALS_REPOSITORY)
    private readonly credentialsRepository: IUserCredentialsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async register(newUser: CreateUserDTO): Promise<User> {
    const userDb = await this.userService.findByEmailOrUsername({
      email: newUser.email ?? undefined,
      username: newUser.username ?? undefined,
    });
    if (userDb) {
      let msg = '';
      const emailsMatch = userDb.email === newUser.email;
      if (emailsMatch) {
        msg += 'le email est deja pris';
      }
      if (newUser.username && userDb.username === newUser.username) {
        if (emailsMatch) msg += ',\n';
        msg += "le nom d'utilisateur est deja pris";
      }
      throw new ConflictError(msg);
    }
    if (!newUser.username) {
      newUser.username = newUser.firstName + uuidv4();
    }

    const passwordHash = newUser.password
      ? await this.hashService.hash(newUser.password)
      : await new Promise<string>((resolve, reject) => {
          randomBytes(32, (err, buf) => {
            if (err) reject(err);
            resolve(buf.toString('hex'));
          });
        });

    // Create user profile (no credentials on the User aggregate)
    const { password: _ignored, ...userDataWithoutPassword } = newUser as any;
    const userView = await this.userService.create(userDataWithoutPassword);

    // Persist credentials separately
    await this.credentialsRepository.save(
      UserCredentials.create({
        userId: userView.id,
        passwordHash,
        refreshTokenHash: null,
        passwordToken: undefined,
      }),
    );

    return userView;
  }

  async login(user: LoginUserDTO) {
    const userDb = await this.userService.findByEmailOrUsername({
      email: user.email,
      username: user.username,
    });

    if (!userDb) {
      throw new NotFoundError("l'email n'existe pas");
    }

    const credentials = await this.credentialsRepository.findByEmail(
      userDb.email,
    );
    if (!credentials) {
      throw new NotFoundError("l'email n'existe pas");
    }

    const matches = await this.hashService.compare(
      user.password,
      credentials.passwordHash,
    );
    if (!matches) {
      throw new ValidationError('mauvais mot de passe');
    }
    if (!userDb.active)
      throw new ForbiddenError('ce compte a eté désactivé.');

    const jwtPayload: JwtPayload = {
      email: userDb.email,
      username: userDb.username,
      sub: userDb.id,
      firstName: userDb.firstName,
      lastName: userDb.lastName,
      imageUrl: userDb.imageUrl,
      role: userDb.role,
      recieve_notifications: userDb.recieve_notifications,
    };
    const tokens = await this.tokenService.generateTokens(jwtPayload);

    const refreshHash = await this.hashService.hash(tokens.refresh_token);
    credentials.setRefreshToken(refreshHash);
    await this.credentialsRepository.save(credentials);

    return tokens;
  }

  async verifyAccessToken(userId: string): Promise<{ role: UserRole }> {
    const user = await this.userService.findBy({ id: userId });
    return { role: user.role };
  }

  async refresh_token(id: string, refresh_token: string) {
    const [userDb, credentials] = await Promise.all([
      this.userService.findBy({ id }),
      this.credentialsRepository.findByUserId(id),
    ]);

    if (!userDb || !credentials?.refreshTokenHash) {
      throw new ForbiddenError('user deleted or logged out');
    }

    const equal = await this.hashService.compare(
      refresh_token,
      credentials.refreshTokenHash,
    );
    if (!equal) {
      throw new ForbiddenError('old token');
    }

    const jwtPayload: JwtPayload = {
      email: userDb.email,
      username: userDb.username,
      sub: userDb.id,
      firstName: userDb.firstName,
      lastName: userDb.lastName,
      imageUrl: userDb.imageUrl,
      role: userDb.role,
      recieve_notifications: userDb.recieve_notifications,
    };
    const tokens = await this.tokenService.generateTokens(jwtPayload);

    const refreshHash = await this.hashService.hash(tokens.refresh_token);
    credentials.setRefreshToken(refreshHash);
    await this.credentialsRepository.save(credentials);

    return tokens;
  }

  async logout(userId: string) {
    const credentials = await this.credentialsRepository.findByUserId(userId);
    if (!credentials) return;
    credentials.clearRefreshToken();
    await this.credentialsRepository.save(credentials);
  }

  async forgotPassword({ email }: ForgotPasswordDTO) {
    const credentials =
      await this.credentialsRepository.findByEmailWithToken(email);
    if (!credentials) {
      throw new NotFoundError(
        "l'utilisateur associe a ce email n'est pas touvee ",
      );
    }

    const token: string = await new Promise((resolve, reject) => {
      randomBytes(32, (err, buf) => {
        if (err) reject(err);
        resolve(buf.toString('hex'));
      });
    });

    const hashed_token = await this.hashService.hash(token);
    credentials.requestPasswordReset(
      hashed_token,
      new Date(Date.now() + 1000 * 60 * 15),
    );
    await this.credentialsRepository.save(credentials);
    await this.emailService.sendPasswordResetEmail(
      email,
      credentials.userId,
      token,
    );

    return 'sent';
  }

  async resetPassword({ password, token, userId }: ResetPasswordDTO) {
    const credentials =
      await this.credentialsRepository.findByUserIdWithToken(userId);
    if (!credentials) {
      throw new NotFoundError(
        "l'utilisateur associe a ce email n'est pas touvee ",
      );
    }

    const passwordToken = credentials.passwordToken;
    if (!passwordToken) {
      throw new UnauthorizedError('access denied (token absence)');
    }
    const matches = await this.hashService.compare(token, passwordToken.token);
    if (!matches) {
      throw new UnauthorizedError('access denied (compare))');
    }
    if (new Date(Date.now()) > passwordToken.expiresIn) {
      throw new UnauthorizedError(
        'votre demande de re-initialization a expiré',
      );
    }

    const hashed_password = await this.hashService.hash(password);
    credentials.resetPassword(hashed_password); // also clears passwordToken
    await this.credentialsRepository.save(credentials);
    this.eventBus.publish(new UserPasswordChangedEvent(userId));

    return 'done';
  }

  async connectedUserResetPassword(
    { actualPassword, password }: ConnectedUserResetPassword,
    userId: string,
  ) {
    const credentials = await this.credentialsRepository.findByUserId(userId);
    if (!credentials) throw new NotFoundError("couldn't find user");

    const matches = await this.hashService.compare(
      actualPassword,
      credentials.passwordHash,
    );
    if (!matches) throw new ValidationError('mot de passe icorrect');

    const hashed_password = await this.hashService.hash(password);
    credentials.resetPassword(hashed_password);
    await this.credentialsRepository.save(credentials);

    return 'done';
  }
}
