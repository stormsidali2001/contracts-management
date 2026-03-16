import {
  Injectable,
  InternalServerErrorException,
  Logger,
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { User, UserRoleEnum } from '@contracts/domain';
import {
  CreateUserDTO,
  UpdateUserDTO,
} from 'src/core/dtos/user.dto';
import { DepartementEntity } from 'src/core/entities/Departement.entity';
import { DirectionEntity } from 'src/core/entities/Direction.entity';
import { UserEntity } from 'src/core/entities/User.entity';
import { Entity } from 'src/core/types/entity.enum';
import { Operation } from 'src/core/types/operation.enum';
import { PaginationResponse } from 'src/core/types/paginationResponse.interface';
import { UserRole } from 'src/core/types/UserRole.enum';
import { DirectionService } from 'src/direction/services/direction.service';
import { StatsParamsDTO } from 'src/statistics/models/statsPramsDTO.interface';
import { FindOptionsWhere, UpdateResult } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import {
  NotificationBody,
  UserNotificationService,
} from './user-notification.service';
import { TypeOrmUserRepository } from './typeorm-user.repository';

@Injectable()
export class UserService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepo: TypeOrmUserRepository,
    private readonly directionService: DirectionService,
    @Inject(forwardRef(() => UserNotificationService))
    private readonly notificationService: UserNotificationService,
  ) {}

  async create(newUser: CreateUserDTO): Promise<UserEntity> {
    const { departementId = null, directionId = null, ...userData } = newUser;
    let direction: DirectionEntity, departement: DepartementEntity;
    if (directionId && departementId) {
      direction = await this.directionService.findDirectionWithDepartement(
        directionId,
        departementId,
      );
      if (!direction) {
        throw new BadRequestException('direction not found');
      }
      departement =
        direction.departements.length > 0 ? direction.departements[0] : null;
      if (!departement) {
        throw new BadRequestException('departement is not in direction');
      }
    }

    // Validate domain invariants early
    User.create({
      id: uuidv4(),
      email: newUser.email,
      username: newUser.username,
      password: newUser.password ?? '$2b$12$placeholder',
      role: newUser.role as unknown as UserRoleEnum,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      imageUrl: newUser.imageUrl,
      directionId,
      departementId,
    });

    const res = await this.userRepo.saveEntity({
      ...userData,
      direction,
      departement,
    });
    console.log('testoooooooo', direction);

    const adminUsers = await this.userRepo.findAdminUsers();
    const extraMessage =
      departement && direction
        ? `au ${departement.abriviation} de ${direction.abriviation}`
        : '';
    const notifications: NotificationBody[] = adminUsers.map((u) => ({
      userId: u.id,
      message: `l'utilisateur ${res.email} de type ${res.role} est ajouté ${extraMessage} avec success`,
    }));

    if (notifications.length > 0)
      await this.notificationService.sendNotifications(notifications);
    await this.notificationService.emitDataToAdminsOnly({
      entity: res.role as unknown as Entity,
      operation: Operation.INSERT,
      departementId: departementId,
      directionId,
      entityId: res.id,
      departementAbriviation: departement?.abriviation ?? '',
      directionAbriviation: direction?.abriviation ?? '',
    });
    await this.notificationService.IncrementUsersStats({
      type: res.role as unknown as Entity,
      operation: Operation.INSERT,
    });
    return res;
  }

  async findBy(options: FindOptionsWhere<UserEntity>): Promise<UserEntity> {
    return this.userRepo.findOneBy(options);
  }

  async getUserPassword(id: string): Promise<UserEntity> {
    return this.userRepo.getUserPassword(id);
  }

  async findByEmailWithToken(email: string): Promise<UserEntity> {
    return this.userRepo.findByEmailWithToken(email);
  }

  async findByIdWithToken(userId: string): Promise<UserEntity> {
    return this.userRepo.findByIdWithToken(userId);
  }

  async findByEmailOrUsername({
    email,
    username,
  }: {
    email: string;
    username: string;
  }): Promise<UserEntity> {
    try {
      return this.userRepo.findByEmailOrUsername({ email, username });
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async findAndUpdate(
    userId: string,
    partialEntity: QueryDeepPartialEntity<UserEntity>,
  ): Promise<UpdateResult> {
    return this.userRepo.update(userId, partialEntity);
  }

  async findAll(
    offset: number = 0,
    limit: number = 10,
    orderBy: string = undefined,
    searchQuery: string = undefined,
    departementId: string = undefined,
    directionId: string = undefined,
    active: 'active' | 'not_active' = undefined,
    role: UserRole = undefined,
  ): Promise<PaginationResponse<UserEntity>> {
    return this.userRepo.findPaginatedWithFilters(
      offset,
      limit,
      orderBy,
      searchQuery,
      departementId,
      directionId,
      active,
      role,
    );
  }

  async updateUserUniqueCheck(
    id: string,
    newUser: UpdateUserDTO,
    currentUserId: string,
  ): Promise<UpdateResult> {
    const currentUser = await this.userRepo.findOneBy({ id: currentUserId });
    if (!currentUser)
      throw new InternalServerErrorException('connected user not found');

    const userDb = await this.userRepo.findByUsernameOrEmailWithRelations(
      newUser.username,
      newUser.email,
    );
    const departement = userDb?.departement;
    const direction = userDb?.direction;
    if (!userDb) throw new NotFoundException("l'utilisateur n'existe pas");
    if (currentUser.role !== UserRole.ADMIN && userDb.id !== currentUser.id)
      throw new ForbiddenException('permission denied');
    if (userDb && userDb.id !== id)
      throw new ForbiddenException("username et l'email   exists deja");

    const { imageUrl } = newUser;
    if (!imageUrl) delete newUser.imageUrl;
    const res = await this.userRepo.updateById(id, { ...newUser });

    await this.notificationService.emitDataToAdminsOnly({
      entity: userDb.role as unknown as Entity,
      entityId: id,
      operation: Operation.UPDATE,
      departementId: userDb.departementId,
      directionId: userDb.directionId,
      departementAbriviation: userDb?.departement?.abriviation ?? '',
      directionAbriviation: userDb?.direction?.abriviation ?? '',
    });

    const adminUsers = await this.userRepo.findAdminUsers();
    const extraMessage =
      departement && direction
        ? `au ${departement.abriviation} de ${direction.abriviation}`
        : '';
    const notifications: NotificationBody[] = adminUsers.map((u) => ({
      userId: u.id,
      message: `l'utilisateur ${userDb.email} de type ${userDb.role}  ${extraMessage} est mis a jour avec success`,
    }));

    if (notifications.length > 0)
      await this.notificationService.sendNotifications(notifications);
    await this.notificationService.emitDataToAdminsOnly({
      entity: userDb.role as unknown as Entity,
      operation: Operation.UPDATE,
      departementId: departement?.id,
      directionId: direction?.id,
      entityId: userDb.id,
      departementAbriviation: departement?.abriviation ?? '',
      directionAbriviation: direction?.abriviation ?? '',
    });
    await this.notificationService.IncrementUsersStats({
      type: userDb.role as unknown as Entity,
      operation: Operation.UPDATE,
    });

    return res;
  }

  async findByIdWithDepartementAndDirection(id: string) {
    return this.userRepo.findByIdWithDepartementAndDirection(id);
  }

  async findAllBy(
    options: FindOptionsWhere<UserEntity> | FindOptionsWhere<UserEntity>[],
  ) {
    return this.userRepo.findManyBy(options);
  }

  async getUserTypesStats(
    { startDate, endDate }: StatsParamsDTO,
    _user: UserEntity,
  ) {
    const stats = await this.userRepo.getUserTypesStats({ startDate, endDate });

    const response: any = {
      juridical: 0,
      employee: 0,
      admin: 0,
      total: 0,
    };
    stats.forEach((st) => {
      response[(st.role as unknown as String).toLowerCase()] = parseInt(st.total);
    });
    response.total = response.juridical + response.admin + response.employee;
    return response;
  }

  async updateUserPasswordToken(token: string, userId: string) {
    await this.userRepo.updatePasswordToken(token, userId);
  }

  async deleteUserPasswordToken(id: string, userId: string) {
    await this.userRepo.deletePasswordToken(id, userId);
  }

  async deleteUserPasswordTokenAndUpdatePassword(
    id: string,
    userId: string,
    password: string,
    directionId: string,
    departementId: string,
    userRole: UserRole,
  ) {
    await this.userRepo.deletePasswordTokenAndUpdatePassword(id, userId, password);

    const userDb = await this.userRepo.findByIdWithDeptAndDirByUserId(userId);
    await this.notificationService.emitDataToAdminsOnly({
      entity: userRole as unknown as Entity,
      entityId: userId,
      operation: Operation.UPDATE,
      directionId,
      departementId,
      departementAbriviation: userDb?.departement?.abriviation ?? '',
      directionAbriviation: userDb?.direction?.abriviation ?? '',
    });
    const adminUsers = await this.userRepo.findAdminUsers();
    const departement = userDb?.departement;
    const direction = userDb?.direction;
    const extraMessage =
      departement && direction
        ? `au ${departement.abriviation} de ${direction.abriviation}`
        : '';
    const notifications: NotificationBody[] = adminUsers.map((u) => ({
      userId: u.id,
      message: `l'utilisateur ${userDb.email} de type ${userDb.role}  ${extraMessage} est mise a jour avec success`,
    }));

    if (notifications.length > 0)
      await this.notificationService.sendNotifications(notifications);
    await this.notificationService.emitDataToAdminsOnly({
      entity: userDb.role as unknown as Entity,
      operation: Operation.UPDATE,
      departementId: departement?.id,
      directionId: direction?.id,
      entityId: userDb.id,
      departementAbriviation: departement?.abriviation ?? '',
      directionAbriviation: direction?.abriviation ?? '',
    });
    await this.notificationService.IncrementUsersStats({
      type: userDb.role as unknown as Entity,
      operation: Operation.UPDATE,
    });
  }

  async updateUserPassword(id: string, hashed_password: string) {
    return this.userRepo.updateById(id, { password: hashed_password });
  }

  async recieveNotifications(userId: string, recieve_notifications: boolean) {
    const userDb = await this.userRepo.findByIdWithDeptAndDirByUserId(userId);
    //@ts-ignore
    await this.userRepo.updateById(userId, {
      recieve_notifications: () => '!recieve_notifications',
    });
    await this.notificationService.emitDataToAdminsOnly({
      entity: userDb.role as unknown as Entity,
      entityId: userId,
      operation: Operation.UPDATE,
      directionId: userDb.directionId,
      departementId: userDb.departementId,
      departementAbriviation: userDb?.departement?.abriviation ?? '',
      directionAbriviation: userDb?.direction?.abriviation ?? '',
    });
    return !recieve_notifications;
  }

  async deleteUser(userId: string) {
    const userDb = await this.userRepo.findByIdWithDeptAndDirByUserId(userId);
    const departement = userDb?.departement;
    const direction = userDb?.direction;
    Logger.debug(userId + '---->' + JSON.stringify(userDb), 'deleteUser');
    if (!userDb) throw new NotFoundException("l'utilisateur n'est pas trouvé");

    await this.userRepo.deleteUserWithNotifications(userId);

    await this.notificationService.emitDataToAdminsOnly({
      entity: userDb.role as unknown as Entity,
      entityId: userDb.role,
      operation: Operation.DELETE,
      directionId: direction?.id,
      departementId: departement?.id,
      departementAbriviation: userDb?.departement?.abriviation ?? '',
      directionAbriviation: userDb?.direction?.abriviation ?? '',
    });
    const adminUsers = await this.userRepo.findAdminUsers();
    const extraMessage =
      departement && direction
        ? `au ${departement.abriviation} de ${direction.abriviation}`
        : '';
    const notifications: NotificationBody[] = adminUsers.map((u) => ({
      userId: u.id,
      message: `l'utilisateur ${userDb.email} de type ${userDb.role} est supprimé ${extraMessage} avec success`,
    }));

    if (notifications.length > 0)
      await this.notificationService.sendNotifications(notifications);
    await this.notificationService.emitDataToAdminsOnly({
      entity: userDb.role as unknown as Entity,
      operation: Operation.DELETE,
      departementId: departement?.id,
      directionId: direction?.id,
      entityId: userDb.id,
      departementAbriviation: departement?.abriviation ?? '',
      directionAbriviation: direction?.abriviation ?? '',
    });
    await this.notificationService.IncrementUsersStats({
      type: userDb.role as unknown as Entity,
      operation: Operation.DELETE,
    });
  }
}
