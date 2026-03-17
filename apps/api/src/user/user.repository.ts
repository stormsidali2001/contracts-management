import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { NotificationEntity } from 'src/core/entities/Notification.entity';
import { PasswordTokenEntity } from 'src/core/entities/PasswordToken';
import { UserEntity } from 'src/core/entities/User.entity';
import { UserRole } from 'src/core/types/UserRole.enum';
import { PaginationResponse } from 'src/core/types/paginationResponse.interface';
import { StatsParamsDTO } from 'src/statistics/models/statsPramsDTO.interface';
import { User } from './domain/user';
import { IUserRepository, UserProfile } from './domain/user.repository';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  // ── Persistence ─────────────────────────────────────────────────────────

  async save(user: User): Promise<User> {
    await this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(UserEntity);
      const tokenRepo = manager.getRepository(PasswordTokenEntity);

      const data: Record<string, unknown> = {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        active: user.active,
        role: user.role,
        recieve_notifications: user.recieve_notifications,
        directionId: user.directionId,
        departementId: user.departementId,
      };
      if (user.password !== undefined) data.password = user.password;
      if (user.refresh_token_hash !== undefined)
        data.refresh_token_hash = user.refresh_token_hash;

      await userRepo.save(data as unknown as UserEntity);

      // password_token: undefined = not touched, null = clear, value = set/replace
      if (user.password_token !== undefined) {
        const current = await userRepo
          .createQueryBuilder('u')
          .leftJoinAndSelect('u.password_token', 'pt')
          .where('u.id = :id', { id: user.id })
          .getOne();

        if (current?.password_token) {
          await userRepo.update(user.id, { password_token: null as any });
          await tokenRepo.delete(current.password_token.id);
        }

        if (user.password_token !== null) {
          const saved = await tokenRepo.save({
            token: user.password_token.token,
            expiresIn: user.password_token.expiresIn,
          });
          await userRepo.update(user.id, { password_token: saved });
          user.password_token.id = saved.id;
        }
      }
    });

    return user;
  }

  async delete(userId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(UserEntity);
      const notificationRepo = manager.getRepository(NotificationEntity);

      await notificationRepo
        .createQueryBuilder()
        .delete()
        .where('notifications.userId = :userId', { userId })
        .execute();

      await userRepo
        .createQueryBuilder()
        .delete()
        .where('users.id = :userId', { userId })
        .execute();
    });
  }

  // ── Aggregate loaders ────────────────────────────────────────────────────

  async findById(id: string): Promise<User | null> {
    const entity = await this.repo.findOneBy({ id });
    return entity ? this.toDomain(entity) : null;
  }

  async findByEmailOrUsername(
    email: string,
    username: string,
  ): Promise<User | null> {
    const entity = await this.repo
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.email',
        'user.username',
        'user.password',
        'user.firstName',
        'user.lastName',
        'user.imageUrl',
        'user.role',
        'user.departementId',
        'user.directionId',
        'user.recieve_notifications',
        'user.active',
        'user.refresh_token_hash',
      ])
      .where('user.username = :username or user.email = :email', {
        username,
        email,
      })
      .getOne();

    return entity ? this.toDomain(entity) : null;
  }

  async findProfileById(id: string): Promise<UserProfile | null> {
    const entity = await this.repo
      .createQueryBuilder('u')
      .where('u.id = :id', { id })
      .leftJoinAndSelect('u.departement', 'dp')
      .leftJoinAndSelect('u.direction', 'dr')
      .getOne();

    if (!entity) return null;
    const user = this.toDomain(entity);
    const profile: UserProfile = Object.assign(user as unknown as UserProfile, {
      direction: entity.direction
        ? { id: entity.direction.id, title: entity.direction.title, abriviation: entity.direction.abriviation }
        : null,
      departement: entity.departement
        ? { id: entity.departement.id, title: entity.departement.title, abriviation: entity.departement.abriviation }
        : null,
    });
    return profile;
  }

  async findByEmailWithPasswordToken(email: string): Promise<User | null> {
    const entity = await this.repo
      .createQueryBuilder('u')
      .where('u.email = :email', { email })
      .leftJoinAndSelect('u.password_token', 'password_token')
      .getOne();

    return entity ? this.toDomain(entity) : null;
  }

  async findByIdWithPasswordToken(id: string): Promise<User | null> {
    const entity = await this.repo
      .createQueryBuilder('u')
      .where('u.id = :id', { id })
      .leftJoinAndSelect('u.password_token', 'password_token')
      .getOne();

    return entity ? this.toDomain(entity) : null;
  }

  async findByIdWithPassword(id: string): Promise<User | null> {
    const entity = await this.repo
      .createQueryBuilder('u')
      .select([
        'u.id',
        'u.email',
        'u.username',
        'u.password',
        'u.firstName',
        'u.lastName',
        'u.imageUrl',
        'u.role',
        'u.active',
        'u.departementId',
        'u.directionId',
        'u.recieve_notifications',
        'u.refresh_token_hash',
      ])
      .where('u.id = :id', { id })
      .getOne();

    return entity ? this.toDomain(entity) : null;
  }

  async findAdmins(): Promise<User[]> {
    const entities = await this.repo
      .createQueryBuilder('u')
      .where('u.role = :userRole', { userRole: UserRole.ADMIN })
      .getMany();

    return entities.map((e) => this.toDomain(e));
  }

  // ── Read-model queries ───────────────────────────────────────────────────

  async findPaginated(
    offset = 0,
    limit = 10,
    orderBy?: string,
    searchQuery?: string,
    departementId?: string,
    directionId?: string,
    active?: 'active' | 'not_active',
    role?: UserRole,
  ): Promise<PaginationResponse<User>> {
    let query = this.repo.createQueryBuilder('user').skip(offset).take(limit);

    if (searchQuery && searchQuery.length >= 2) {
      query = query.andWhere(`(
        MATCH(user.email) AGAINST ('${searchQuery}' IN BOOLEAN MODE)
        or MATCH(user.firstName) AGAINST ('${searchQuery}' IN BOOLEAN MODE)
        or MATCH(user.lastName) AGAINST ('${searchQuery}' IN BOOLEAN MODE)
        or MATCH(user.username) AGAINST ('${searchQuery}' IN BOOLEAN MODE)
      )`);
    }
    if (departementId)
      query = query.andWhere('user.departementId = :departementId', {
        departementId,
      });
    if (directionId)
      query = query.andWhere('user.directionId = :directionId', {
        directionId,
      });
    if (active)
      query = query.andWhere('user.active = :active', {
        active: active === 'active',
      });
    if (role) query = query.andWhere('user.role = :role', { role });
    if (orderBy) query = query.orderBy(orderBy);

    const [data, total] = await query.getManyAndCount();
    return { total, data: data.map((e) => this.toDomain(e)) };
  }

  async getUserTypesStats({
    startDate,
    endDate,
  }: StatsParamsDTO): Promise<{ role: string; total: string }[]> {
    let query = this.repo
      .createQueryBuilder('u')
      .select('count(u.id)', 'total')
      .addSelect('u.role', 'role')
      .groupBy('u.role');

    if (startDate)
      query = query.andWhere('u.created_at >= :startDate', { startDate });
    if (endDate)
      query = query.andWhere('u.created_at <= :endDate', { endDate });

    return query.getRawMany();
  }

  async findByDepartementId(departementId: string): Promise<User[]> {
    const entities = await this.repo.find({
      where: { departementId },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findJuridicalsByOrg(
    departementId: string,
    directionId: string,
  ): Promise<User[]> {
    const entities = await this.repo.find({
      where: { role: UserRole.JURIDICAL, departementId, directionId },
    });
    return entities.map((e) => this.toDomain(e));
  }

  // ── Mapper ───────────────────────────────────────────────────────────────

  private toDomain(entity: UserEntity): User {
    return User.create({
      id: entity.id,
      email: entity.email,
      username: entity.username,
      firstName: entity.firstName,
      lastName: entity.lastName,
      imageUrl: entity.imageUrl,
      active: entity.active,
      role: entity.role,
      recieve_notifications: entity.recieve_notifications,
      created_at: entity.created_at,
      directionId: entity.directionId ?? null,
      departementId: entity.departementId ?? null,
      password: (entity as any).password,
      refresh_token_hash: entity.refresh_token_hash,
      password_token: entity.password_token
        ? {
            id: entity.password_token.id,
            token: entity.password_token.token,
            expiresIn: entity.password_token.expiresIn,
          }
        : entity.password_token === null
        ? null
        : undefined,
    });
  }
}
