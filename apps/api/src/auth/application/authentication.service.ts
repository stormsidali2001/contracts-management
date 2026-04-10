import { Inject, Injectable } from '@nestjs/common';
import { LoginUserDTO } from 'src/core/dtos/user.dto';
import { UserService } from 'src/user/application/user.service';
import {
  IUserCredentialsRepository,
  USER_CREDENTIALS_REPOSITORY,
} from '../domain/persistence/user-credentials.repository';
import { HashService } from '../infrastructure/services/hash.service';
import { TokenService } from '../infrastructure/services/token.service';
import { JwtPayload } from '../infrastructure/types/JwtPayload.interface';
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from 'src/shared/domain/errors';
import { UserRole } from '@contracts/types';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userService: UserService,
    @Inject(USER_CREDENTIALS_REPOSITORY)
    private readonly credentialsRepository: IUserCredentialsRepository,
    private readonly hashService: HashService,
    private readonly tokenService: TokenService,
  ) {}

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

    if (!userDb.active) {
      throw new ForbiddenError('ce compte a eté désactivé.');
    }

    const jwtPayload: JwtPayload = this.buildJwtPayload(userDb);
    const tokens = await this.tokenService.generateTokens(jwtPayload);

    const refreshHash = await this.hashService.hash(tokens.refresh_token);
    credentials.setRefreshToken(refreshHash);
    await this.credentialsRepository.save(credentials);

    return tokens;
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

    const jwtPayload: JwtPayload = this.buildJwtPayload(userDb);
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

  async verifyAccessToken(userId: string): Promise<{ role: UserRole }> {
    const user = await this.userService.findBy({ id: userId });
    return { role: user.role };
  }

  private buildJwtPayload(userDb: any): JwtPayload {
    return {
      email: userDb.email,
      username: userDb.username,
      sub: userDb.id,
      firstName: userDb.firstName,
      lastName: userDb.lastName,
      imageUrl: userDb.imageUrl,
      role: userDb.role,
      recieve_notifications: userDb.recieve_notifications,
      departementId: userDb.departementId ?? null,
      directionId: userDb.directionId ?? null,
    };
  }
}
