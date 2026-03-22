import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PasswordTokenEntity } from 'src/core/entities/PasswordToken';
import { UserCredentialsEntity } from 'src/core/entities/UserCredentials.entity';
import { IUserCredentialsRepository } from '../domain/user-credentials.repository';
import { PasswordToken, UserCredentials } from '../domain/user-credentials.aggregate';

@Injectable()
export class UserCredentialsRepository implements IUserCredentialsRepository {
  constructor(
    @InjectRepository(UserCredentialsEntity)
    private readonly repo: Repository<UserCredentialsEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async save(credentials: UserCredentials): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const credRepo = manager.getRepository(UserCredentialsEntity);
      const tokenRepo = manager.getRepository(PasswordTokenEntity);

      const existing = await credRepo.findOneBy({ userId: credentials.userId });
      if (existing) {
        await credRepo
          .createQueryBuilder()
          .update(UserCredentialsEntity)
          .set({
            password: credentials.passwordHash,
            refresh_token_hash: credentials.refreshTokenHash,
          })
          .where('userId = :userId', { userId: credentials.userId })
          .execute();
      } else {
        await credRepo
          .createQueryBuilder()
          .insert()
          .into(UserCredentialsEntity)
          .values({
            userId: credentials.userId,
            password: credentials.passwordHash,
            refresh_token_hash: credentials.refreshTokenHash,
          })
          .execute();
      }

      if (credentials.passwordToken !== undefined) {
        const current = await credRepo
          .createQueryBuilder('c')
          .leftJoinAndSelect('c.password_token', 'pt')
          .where('c.userId = :userId', { userId: credentials.userId })
          .getOne();

        if (current?.password_token) {
          await credRepo
            .createQueryBuilder()
            .relation(UserCredentialsEntity, 'password_token')
            .of(current.id)
            .set(null);
          await tokenRepo.delete(current.password_token.id);
        }

        if (credentials.passwordToken !== null) {
          const saved = await tokenRepo.save({
            token: credentials.passwordToken.token,
            expiresIn: credentials.passwordToken.expiresIn,
          });
          await credRepo
            .createQueryBuilder()
            .relation(UserCredentialsEntity, 'password_token')
            .of(current?.id ?? (await credRepo.findOneBy({ userId: credentials.userId }))!.id)
            .set(saved);
          credentials.passwordToken.id = saved.id;
        }
      }
    });
  }

  async findByUserId(userId: string): Promise<UserCredentials | null> {
    const entity = await this.repo
      .createQueryBuilder('c')
      .addSelect('c.password')
      .where('c.userId = :userId', { userId })
      .getOne();

    return entity ? this.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<UserCredentials | null> {
    const entity = await this.repo
      .createQueryBuilder('c')
      .addSelect('c.password')
      .innerJoin('c.user', 'u')
      .where('u.email = :email', { email })
      .getOne();

    return entity ? this.toDomain(entity) : null;
  }

  async findByEmailWithToken(email: string): Promise<UserCredentials | null> {
    const entity = await this.repo
      .createQueryBuilder('c')
      .addSelect('c.password')
      .innerJoin('c.user', 'u')
      .leftJoinAndSelect('c.password_token', 'pt')
      .where('u.email = :email', { email })
      .getOne();

    return entity ? this.toDomain(entity) : null;
  }

  async findByUserIdWithToken(userId: string): Promise<UserCredentials | null> {
    const entity = await this.repo
      .createQueryBuilder('c')
      .addSelect('c.password')
      .leftJoinAndSelect('c.password_token', 'pt')
      .where('c.userId = :userId', { userId })
      .getOne();

    return entity ? this.toDomain(entity) : null;
  }

  private toDomain(entity: UserCredentialsEntity): UserCredentials {
    const pt = entity.password_token;
    const passwordToken: PasswordToken | null | undefined = pt
      ? { id: pt.id, token: pt.token, expiresIn: pt.expiresIn }
      : pt === null
      ? null
      : undefined;

    return UserCredentials.reconstitute({
      userId: entity.userId,
      passwordHash: (entity as any).password,
      refreshTokenHash: entity.refresh_token_hash ?? null,
      passwordToken,
    });
  }
}
