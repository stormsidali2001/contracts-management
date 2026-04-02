import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDTO } from 'src/core/dtos/user.dto';
import { UserService } from 'src/user/application/user.service';
import { v4 as uuidv4 } from 'uuid';
import {
  IUserCredentialsRepository,
  USER_CREDENTIALS_REPOSITORY,
} from '../domain/user-credentials.repository';
import { UserCredentials } from '../domain/user-credentials.aggregate';
import { HashService } from '../services/hash.service';
import { ConflictError } from 'src/shared/domain/errors';
import { randomBytes } from 'crypto';

@Injectable()
export class RegistrationService {
  constructor(
    private readonly userService: UserService,
    @Inject(USER_CREDENTIALS_REPOSITORY)
    private readonly credentialsRepository: IUserCredentialsRepository,
    private readonly hashService: HashService,
  ) {}

  async register(newUser: CreateUserDTO) {
    // Check for existing user
    const userDb = await this.userService.findByEmailOrUsername({
      email: newUser.email ?? undefined,
      username: newUser.username ?? undefined,
    });

    if (userDb) {
      let msg = '';
      if (userDb.email === newUser.email) {
        msg += 'le email est deja pris';
      }
      if (newUser.username && userDb.username === newUser.username) {
        if (msg) msg += ',\n';
        msg += "le nom d'utilisateur est deja pris";
      }
      throw new ConflictError(msg);
    }

    // Generate username if not provided
    if (!newUser.username) {
      newUser.username = newUser.firstName + uuidv4();
    }

    // Handle password (real or random)
    const passwordHash = newUser.password
      ? await this.hashService.hash(newUser.password)
      : await this.generateRandomPasswordHash();

    // Create user profile (without password)
    const { password: _ignored, ...userDataWithoutPassword } = newUser as any;
    const userView = await this.userService.create(userDataWithoutPassword);

    // Save credentials separately
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

  private async generateRandomPasswordHash(): Promise<string> {
    return new Promise((resolve, reject) => {
      randomBytes(32, (err, buf) => {
        if (err) reject(err);
        resolve(buf.toString('hex'));
      });
    });
  }
}
