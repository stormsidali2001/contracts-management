import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  FindOptionsWhere,
  Repository,
  UpdateResult,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { NotificationEntity } from 'src/core/entities/Notification.entity';
import { PasswordTokenEntity } from 'src/core/entities/PasswordToken';
import { UserEntity } from 'src/core/entities/User.entity';
import { UserRole } from 'src/core/types/UserRole.enum';
import { PaginationResponse } from 'src/core/types/paginationResponse.interface';
import { StatsParamsDTO } from 'src/statistics/models/statsPramsDTO.interface';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async save(data: Partial<UserEntity>): Promise<UserEntity> {
    return this.repo.save(data as UserEntity);
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.repo.findOneBy({ id });
  }

  async findByEmailOrUsername(
    email: string,
    username: string,
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
        'user.recieve_notifications',
        'user.active',
      ])
      .where('user.username = :username or user.email = :email', {
        username,
        email,
      })
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

  async findByIdWithDepartementAndDirection(
    id: string,
  ): Promise<UserEntity | null> {
    return this.repo
      .createQueryBuilder('u')
      .where('u.id = :id', { id })
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

  async findPaginated(
    offset = 0,
    limit = 10,
    orderBy?: string,
    searchQuery?: string,
    departementId?: string,
    directionId?: string,
    active?: 'active' | 'not_active',
    role?: UserRole,
  ): Promise<PaginationResponse<UserEntity>> {
    let query = this.repo.createQueryBuilder('user').skip(offset).take(limit);

    if (searchQuery && searchQuery.length >= 2) {
      query = query.andWhere(`(
        MATCH(user.email) AGAINST ('${searchQuery}' IN BOOLEAN MODE)
        or MATCH(user.firstName) AGAINST ('${searchQuery}' IN BOOLEAN MODE)
        or MATCH(user.lastName) AGAINST ('${searchQuery}' IN BOOLEAN MODE)
        or MATCH(user.username) AGAINST ('${searchQuery}' IN BOOLEAN MODE)
      )`);
    }
    if (departementId) {
      query = query.andWhere('user.departementId = :departementId', {
        departementId,
      });
    }
    if (directionId) {
      query = query.andWhere('user.directionId = :directionId', {
        directionId,
      });
    }
    if (active) {
      query = query.andWhere('user.active = :active', {
        active: active === 'active',
      });
    }
    if (role) {
      query = query.andWhere('user.role = :role', { role });
    }
    if (orderBy) {
      query = query.orderBy(`${orderBy}`);
    }

    const [data, total] = await query.getManyAndCount();
    return { total, data };
  }

  async findAllBy(
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

  async getUserTypesStats({
    startDate,
    endDate,
  }: StatsParamsDTO): Promise<{ role: string; total: string }[]> {
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

  async update(
    id: string,
    partial: QueryDeepPartialEntity<UserEntity>,
  ): Promise<UpdateResult> {
    return this.repo.update(id, partial);
  }

  async updatePassword(id: string, password: string): Promise<UpdateResult> {
    return this.repo.update(id, { password });
  }

  async toggleNotifications(userId: string): Promise<void> {
    // @ts-ignore — SQL expression toggle
    await this.repo.update(userId, {
      recieve_notifications: () => '!recieve_notifications',
    });
  }

  async savePasswordToken(token: string, userId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(UserEntity);
      const tokenRepo = manager.getRepository(PasswordTokenEntity);
      const tokenDb = await tokenRepo.save({
        token,
        expiresIn: new Date(Date.now() + 1000 * 60 * 15),
      });
      await userRepo.update(userId, { password_token: tokenDb });
    });
  }

  async deletePasswordToken(id: string, userId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(UserEntity);
      const tokenRepo = manager.getRepository(PasswordTokenEntity);
      await userRepo.update(userId, { password_token: null });
      await tokenRepo.delete(id);
    });
  }

  async deletePasswordTokenAndUpdatePassword(
    tokenId: string,
    userId: string,
    password: string,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(UserEntity);
      const tokenRepo = manager.getRepository(PasswordTokenEntity);
      await userRepo.update(userId, { password_token: null, password });
      await tokenRepo.delete(tokenId);
    });
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
}
