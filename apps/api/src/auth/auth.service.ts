import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  ConnectedUserResetPassword,
  CreateUserDTO,
  ForgotPasswordDTO,
  LoginUserDTO,
  ResetPasswordDTO,
} from 'src/core/dtos/user.dto';
import { UserService } from 'src/user/user.service';
import { UserView } from 'src/core/views/user.view';
import { JwtPayload } from './types/JwtPayload.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Tokens } from './types/tokens.interface';
import { UserRole } from 'src/core/types/UserRole.enum';
import { randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import * as nodemailer from 'nodemailer';
import {
  IUserCredentialsRepository,
  USER_CREDENTIALS_REPOSITORY,
} from './domain/user-credentials.repository';
import { UserCredentials } from './domain/user-credentials';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(USER_CREDENTIALS_REPOSITORY)
    private readonly credentialsRepository: IUserCredentialsRepository,
  ) {}

  async #hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async #comparePassword(
    password: string,
    passwordDb: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, passwordDb);
  }

  async #generateTokens(jwtPayload: JwtPayload): Promise<Tokens> {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(
        { user: jwtPayload },
        {
          secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
          expiresIn: this.configService.get<number>(
            'JWT_ACCESS_TOKEN_EXPIRES_IN',
          ),
        },
      ),
      this.jwtService.signAsync(
        { user: jwtPayload },
        {
          secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
          expiresIn: this.configService.get<number>(
            'JWT_REFRESH_TOKEN_EXPIRES_IN',
          ),
        },
      ),
    ]);

    return { access_token, refresh_token };
  }

  async register(newUser: CreateUserDTO): Promise<UserView> {
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
      throw new BadRequestException(msg);
    }
    if (!newUser.username) {
      newUser.username = newUser.firstName + uuidv4();
    }

    const passwordHash = newUser.password
      ? await this.#hashPassword(newUser.password)
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
    try {
      const userDb = await this.userService.findByEmailOrUsername({
        email: user.email,
        username: user.username,
      });

      if (!userDb) {
        throw new BadRequestException("l'email n'existe pas");
      }

      const credentials = await this.credentialsRepository.findByEmail(
        userDb.email,
      );
      if (!credentials) {
        throw new BadRequestException("l'email n'existe pas");
      }

      const matches = await this.#comparePassword(
        user.password,
        credentials.passwordHash,
      );
      if (!matches) {
        throw new BadRequestException('mauvais mot de passe');
      }
      if (!userDb.active)
        throw new BadRequestException('ce compte a eté désactivé.');

      const tokens = await this.#generateTokens({
        email: userDb.email,
        username: userDb.username,
        sub: userDb.id,
        firstName: userDb.firstName,
        lastName: userDb.lastName,
        imageUrl: userDb.imageUrl,
        role: userDb.role,
        recieve_notifications: userDb.recieve_notifications,
      });

      const refreshHash = await this.#hashPassword(tokens.refresh_token);
      credentials.setRefreshToken(refreshHash);
      await this.credentialsRepository.save(credentials);

      return tokens;
    } catch (err) {
      throw new ForbiddenException(err);
    }
  }

  async verifyAccessToken(userId: string): Promise<{ role: UserRole }> {
    try {
      const user = await this.userService.findBy({ id: userId });
      return { role: user.role };
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async refresh_token(id: string, refresh_token: string) {
    try {
      const [userDb, credentials] = await Promise.all([
        this.userService.findBy({ id }),
        this.credentialsRepository.findByUserId(id),
      ]);

      if (!userDb || !credentials?.refreshTokenHash) {
        throw new ForbiddenException('user deleted or logged out');
      }

      const equal = await bcrypt.compare(
        refresh_token,
        credentials.refreshTokenHash,
      );
      if (!equal) {
        throw new ForbiddenException('old token');
      }

      const tokens = await this.#generateTokens({
        email: userDb.email,
        username: userDb.username,
        sub: userDb.id,
        firstName: userDb.firstName,
        lastName: userDb.lastName,
        imageUrl: userDb.imageUrl,
        role: userDb.role,
        recieve_notifications: userDb.recieve_notifications,
      });

      const refreshHash = await this.#hashPassword(tokens.refresh_token);
      credentials.setRefreshToken(refreshHash);
      await this.credentialsRepository.save(credentials);

      return tokens;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
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
      throw new NotFoundException(
        "l'utilisateur associe a ce email n'est pas touvee ",
      );
    }

    const token: string = await new Promise((resolve, reject) => {
      randomBytes(32, (err, buf) => {
        if (err) reject(err);
        resolve(buf.toString('hex'));
      });
    });

    const hashed_token = await this.#hashPassword(token);
    credentials.requestPasswordReset(
      hashed_token,
      new Date(Date.now() + 1000 * 60 * 15),
    );
    await this.credentialsRepository.save(credentials);
    await this.#sendEmail(email, credentials.userId, token);

    return 'sent';
  }

  async resetPassword({ password, token, userId }: ResetPasswordDTO) {
    const credentials =
      await this.credentialsRepository.findByUserIdWithToken(userId);
    if (!credentials) {
      throw new NotFoundException(
        "l'utilisateur associe a ce email n'est pas touvee ",
      );
    }

    const passwordToken = credentials.passwordToken;
    if (!passwordToken) {
      throw new UnauthorizedException('access denied (token absence)');
    }
    const matches = await bcrypt.compare(token, passwordToken.token);
    if (!matches) {
      throw new UnauthorizedException('access denied (compare))');
    }
    if (new Date(Date.now()) > passwordToken.expiresIn) {
      throw new UnauthorizedException(
        'votre demande de re-initialization a expiré',
      );
    }

    const hashed_password = await this.#hashPassword(password);
    credentials.resetPassword(hashed_password); // also clears passwordToken
    await this.credentialsRepository.save(credentials);
    await this.userService.notifyPasswordChanged(userId);

    return 'done';
  }

  async #sendEmail(email: string, userId: string, token: string) {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: this.configService.get('ethereal_user'),
        pass: this.configService.get('ethereal_password'),
      },
    });

    await transporter.sendMail({
      from: '"bmt" <assoulsidali@gmail.com>',
      to: email,
      subject: 'Mot de pasee oublié',
      html: `<b>vous avez envoyer une demmande de réinitialisation de mot de passe.</b><br/> presser sur le lien si il s'agit bien de vous </b><br/> le lien:  http://localhost:3000/reset-password?token=${token}&userId=${userId}`,
    });
  }

  async connectedUserResetPassword(
    { actualPassword, password }: ConnectedUserResetPassword,
    userId: string,
  ) {
    const credentials = await this.credentialsRepository.findByUserId(userId);
    if (!credentials) throw new BadRequestException("couldn't find user");

    const matches = await this.#comparePassword(
      actualPassword,
      credentials.passwordHash,
    );
    if (!matches) throw new UnauthorizedException('mot de passe icorrect');

    const hashed_password = await this.#hashPassword(password);
    credentials.resetPassword(hashed_password);
    await this.credentialsRepository.save(credentials);

    return 'done';
  }
}
