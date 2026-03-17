import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PasswordTokenEntity } from 'src/core/entities/PasswordToken';
import { UserEntity } from 'src/core/entities/User.entity';
import { IUserCredentialsRepository } from './domain/user-credentials.repository';
import { PasswordToken, UserCredentials } from './domain/user-credentials';

@Injectable()
export class UserCredentialsRepository implements IUserCredentialsRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async save(credentials: UserCredentials): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(UserEntity);
      const tokenRepo = manager.getRepository(PasswordTokenEntity);

      const data: Record<string, unknown> = {
        id: credentials.userId,
        refresh_token_hash: credentials.refreshTokenHash,
        password: credentials.passwordHash,
      };

      await userRepo.save(data as unknown as UserEntity);

      // password_token: undefined = not touched, null = clear, value = set/replace
      if (credentials.passwordToken !== undefined) {
        const current = await userRepo
          .createQueryBuilder('u')
          .leftJoinAndSelect('u.password_token', 'pt')
          .where('u.id = :id', { id: credentials.userId })
          .getOne();

        if (current?.password_token) {
          await userRepo.update(credentials.userId, {
            password_token: null as any,
          });
          await tokenRepo.delete(current.password_token.id);
        }

        if (credentials.passwordToken !== null) {
          const saved = await tokenRepo.save({
            token: credentials.passwordToken.token,
            expiresIn: credentials.passwordToken.expiresIn,
          });
          await userRepo.update(credentials.userId, { password_token: saved });
          credentials.passwordToken.id = saved.id;
        }
      }
    });
  }

  async findByUserId(userId: string): Promise<UserCredentials | null> {
    const entity = await this.repo
      .createQueryBuilder('u')
      .select(['u.id', 'u.refresh_token_hash'])
      .addSelect('u.password')
      .where('u.id = :userId', { userId })
      .getOne();

    return entity ? this.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<UserCredentials | null> {
    const entity = await this.repo
      .createQueryBuilder('u')
      .select(['u.id', 'u.refresh_token_hash'])
      .addSelect('u.password')
      .where('u.email = :email', { email })
      .getOne();

    return entity ? this.toDomain(entity) : null;
  }

  async findByEmailWithToken(email: string): Promise<UserCredentials | null> {
    const entity = await this.repo
      .createQueryBuilder('u')
      .select(['u.id', 'u.refresh_token_hash'])
      .addSelect('u.password')
      .leftJoinAndSelect('u.password_token', 'pt')
      .where('u.email = :email', { email })
      .getOne();

    return entity ? this.toDomain(entity) : null;
  }

  async findByUserIdWithToken(userId: string): Promise<UserCredentials | null> {
    const entity = await this.repo
      .createQueryBuilder('u')
      .select(['u.id', 'u.refresh_token_hash'])
      .addSelect('u.password')
      .leftJoinAndSelect('u.password_token', 'pt')
      .where('u.id = :userId', { userId })
      .getOne();

    return entity ? this.toDomain(entity) : null;
  }

  private toDomain(entity: UserEntity): UserCredentials {
    const pt = entity.password_token;
    const passwordToken: PasswordToken | null | undefined = pt
      ? { id: pt.id, token: pt.token, expiresIn: pt.expiresIn }
      : pt === null
      ? null
      : undefined;

    return UserCredentials.create({
      userId: entity.id,
      passwordHash: (entity as any).password,
      refreshTokenHash: entity.refresh_token_hash ?? null,
      passwordToken,
    });
  }
}
