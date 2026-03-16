import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, Repository, UpdateResult } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { User, UserRepository } from '@contracts/domain';
import { NotificationEntity } from 'src/core/entities/Notification.entity';
import { PasswordTokenEntity } from 'src/core/entities/PasswordToken';
import { UserEntity } from 'src/core/entities/User.entity';
import { PaginationResponse } from 'src/core/types/paginationResponse.interface';
import { UserRole } from 'src/core/types/UserRole.enum';
import { StatsParamsDTO } from 'src/statistics/models/statsPramsDTO.interface';
import { UserMapper } from './user.mapper';

@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  // ── Domain-repository interface ───────────────────────────────────────

  async findById(id: string): Promise<User | null> {
    const entity = await this.repo.findOneBy({ id });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repo.findOneBy({ email });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const entity = await this.repo.findOneBy({ username });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findAll(filters?: {
    role?: string;
    directionId?: string;
    departementId?: string;
    isActive?: boolean;
  }): Promise<User[]> {
    const where: any = {};
    if (filters?.role) where.role = filters.role;
    if (filters?.directionId) where.directionId = filters.directionId;
    if (filters?.departementId) where.departementId = filters.departementId;
    if (filters?.isActive !== undefined) where.active = filters.isActive;
    const entities = await this.repo.findBy(where);
    return entities.map(UserMapper.toDomain);
  }

  async save(user: User): Promise<void> {
    await this.repo.save(UserMapper.toPersistence(user));
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  // ── Service-level query methods ───────────────────────────────────────

  async saveEntity(data: Partial<UserEntity>): Promise<UserEntity> {
    return this.repo.save(data as UserEntity);
  }

  async findOneBy(options: FindOptionsWhere<UserEntity>): Promise<UserEntity | null> {
    return this.repo.findOneBy(options);
  }

  async findManyBy(
    options: FindOptionsWhere<UserEntity> | FindOptionsWhere<UserEntity>[],
  ): Promise<UserEntity[]> {
    return this.repo.find({ where: options });
  }

  async getUserPassword(id: string): Promise<UserEntity | null> {
    return this.repo
      .createQueryBuilder('u')
      .select('u.password')
      .where('u.id = :userId', { userId: id })
      .getOne();
  }

  async findByEmailWithToken(email: string): Promise<UserEntity | null> {
    return this.repo
      .createQueryBuilder('u')
      .where('u.email = :email', { email })
      .leftJoinAndSelect('u.password_token', 'password_token')
      .getOne();
  }

  async findByIdWithToken(userId: string): Promise<UserEntity | null> {
    return this.repo
      .createQueryBuilder('u')
      .where('u.id = :userId', { userId })
      .leftJoinAndSelect('u.password_token', 'password_token')
      .getOne();
  }

  async findByEmailOrUsername({
    email,
    username,
  }: {
    email: string;
    username: string;
  }): Promise<UserEntity | null> {
    return this.repo
      .createQueryBuilder('user')
      .select([
        'user.password',
        'user.email',
        'user.username',
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.imageUrl',
        'user.role',
        'user.departementId',
        'user.directionId',
        'user.recieve_notifications',
        'user.active',
      ])
      .where('user.username = :username or user.email = :email', {
        username,
        email,
      })
      .getOne();
  }

  async update(
    userId: string,
    partialEntity: QueryDeepPartialEntity<UserEntity>,
  ): Promise<UpdateResult> {
    return this.repo.update({ id: userId }, partialEntity);
  }

  async updateById(
    id: string,
    partialEntity: QueryDeepPartialEntity<UserEntity>,
  ): Promise<UpdateResult> {
    return this.repo.update(id, partialEntity);
  }

  async findPaginatedWithFilters(
    offset: number,
    limit: number,
    orderBy?: string,
    searchQuery?: string,
    departementId?: string,
    directionId?: string,
    active?: 'active' | 'not_active',
    role?: UserRole,
  ): Promise<PaginationResponse<UserEntity>> {
    let query = this.repo
      .createQueryBuilder('user')
      .skip(offset)
      .take(limit);

    if (searchQuery && searchQuery.length >= 2) {
      query = query.andWhere(`(
                MATCH(user.email) AGAINST ('${searchQuery}' IN BOOLEAN MODE)
                or MATCH(user.firstName) AGAINST ('${searchQuery}' IN BOOLEAN MODE)
                or MATCH(user.lastName) AGAINST ('${searchQuery}' IN BOOLEAN MODE)
                or MATCH(user.username) AGAINST ('${searchQuery}' IN BOOLEAN MODE)
            )`);
    }
    if (departementId) {
      query = query.andWhere('user.departementId = :departementId', { departementId });
    }
    if (directionId) {
      query = query.andWhere('user.directionId = :directionId', { directionId });
    }
    if (active) {
      query = query.andWhere('user.active = :active', {
        active: active === 'active' ? true : false,
      });
    }
    if (role) {
      query = query.andWhere('user.role = :role', { role });
    }
    if (orderBy) {
      query = query.orderBy(`${orderBy}`);
    }
    const res = await query.getManyAndCount();
    return { total: res[1], data: res[0] };
  }

  async findByUsernameOrEmailWithRelations(
    username: string,
    email: string,
  ): Promise<UserEntity | null> {
    return this.repo
      .createQueryBuilder('user')
      .select([
        'user.password',
        'user.email',
        'user.username',
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.imageUrl',
        'user.role',
        'user.departementId',
        'user.directionId',
      ])
      .where('user.username = :username or user.email = :email', { username, email })
      .leftJoinAndSelect('user.departement', 'dp')
      .leftJoinAndSelect('user.direction', 'dr')
      .getOne();
  }

  async findByIdWithDepartementAndDirection(id: string): Promise<UserEntity | null> {
    return this.repo
      .createQueryBuilder('u')
      .where('u.id = :id', { id })
      .leftJoinAndSelect('u.departement', 'dp')
      .leftJoinAndSelect('u.direction', 'dr')
      .getOne();
  }

  async findByIdWithDeptAndDirByUserId(userId: string): Promise<UserEntity | null> {
    return this.repo
      .createQueryBuilder('u')
      .where('u.id = :userId', { userId })
      .leftJoinAndSelect('u.departement', 'dp')
      .leftJoinAndSelect('u.direction', 'dr')
      .getOne();
  }

  async findAdminUsers(): Promise<UserEntity[]> {
    return this.repo
      .createQueryBuilder('u')
      .where('u.role = :userRole', { userRole: UserRole.ADMIN })
      .getMany();
  }

  async getUserTypesStats(
    { startDate, endDate }: StatsParamsDTO,
  ): Promise<{ role: string; total: string }[]> {
    let query = this.repo
      .createQueryBuilder('u')
      .select('count(u.id)', 'total')
      .addSelect('u.role', 'role')
      .groupBy('u.role');

    if (startDate) {
      query = query.andWhere('u.created_at >= :startDate', { startDate });
    }
    if (endDate) {
      query = query.andWhere('u.created_at <= :endDate', { endDate });
    }
    return query.getRawMany();
  }

  async updatePasswordToken(token: string, userId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const userRepository = manager.getRepository(UserEntity);
      const passwordTokenRepository = manager.getRepository(PasswordTokenEntity);
      const tokenDb = await passwordTokenRepository.save({
        token,
        expiresIn: new Date(Date.now() + 1000 * 60 * 15),
      });
      await userRepository.update(userId, { password_token: tokenDb });
    });
  }

  async deletePasswordToken(id: string, userId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const userRepository = manager.getRepository(UserEntity);
      const passwordTokenRepository = manager.getRepository(PasswordTokenEntity);
      await userRepository.update(userId, { password_token: null });
      await passwordTokenRepository.delete(id);
    });
  }

  async deletePasswordTokenAndUpdatePassword(
    id: string,
    userId: string,
    password: string,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const userRepository = manager.getRepository(UserEntity);
      const passwordTokenRepository = manager.getRepository(PasswordTokenEntity);
      await userRepository.update(userId, { password_token: null, password });
      await passwordTokenRepository.delete(id);
    });
  }

  async deleteUserWithNotifications(userId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const userRepository = manager.getRepository(UserEntity);
      const notificationRepository = manager.getRepository(NotificationEntity);

      await notificationRepository
        .createQueryBuilder()
        .delete()
        .where('notifications.userId = :userId', { userId })
        .execute();
      await userRepository
        .createQueryBuilder()
        .delete()
        .where('users.id = :userId', { userId })
        .execute();
    });
  }
}
