import { Inject, Injectable } from '@nestjs/common';
import {
  ForgotPasswordDTO,
  ResetPasswordDTO,
  ConnectedUserResetPassword,
} from 'src/core/dtos/user.dto';
import {
  IUserCredentialsRepository,
  USER_CREDENTIALS_REPOSITORY,
} from '../domain/persistence/user-credentials.repository';
import { HashService } from '../infrastructure/services/hash.service';
import { EmailService } from 'src/shared/infrastructure/email/email.service';
import { UserService } from 'src/user/application/user.service';
import {
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from 'src/shared/domain/errors';
import { randomBytes } from 'crypto';

@Injectable()
export class PasswordManagementService {
  constructor(
    @Inject(USER_CREDENTIALS_REPOSITORY)
    private readonly credentialsRepository: IUserCredentialsRepository,
    private readonly hashService: HashService,
    private readonly emailService: EmailService,
    private readonly userService: UserService,
  ) {}

  async forgotPassword({ email }: ForgotPasswordDTO) {
    const credentials = await this.credentialsRepository.findByEmailWithToken(
      email,
    );
    if (!credentials) {
      throw new NotFoundError(
        "l'utilisateur associe a ce email n'est pas touvee ",
      );
    }

    const token = await this.generateResetToken();
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
    const credentials = await this.credentialsRepository.findByUserIdWithToken(
      userId,
    );
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
      throw new UnauthorizedError('access denied (compare)');
    }

    if (new Date(Date.now()) > passwordToken.expiresIn) {
      throw new UnauthorizedError(
        'votre demande de re-initialization a expiré',
      );
    }

    const hashed_password = await this.hashService.hash(password);
    credentials.resetPassword(hashed_password);
    await this.credentialsRepository.save(credentials);

    this.userService.notifyPasswordChanged(userId);
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

  private async generateResetToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      randomBytes(32, (err, buf) => {
        if (err) reject(err);
        resolve(buf.toString('hex'));
      });
    });
  }
}
