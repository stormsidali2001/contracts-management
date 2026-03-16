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
import { FindOptionsWhere, UpdateResult } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import {
  ConnectedUserResetPassword,
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
import {
  NotificationBody,
  UserNotificationService,
} from './user-notification.service';
import { UserRepository } from './user.repository';
@Injectable()
export class UserService {
  private logger = new Logger(UserService.name);

  constructor(
    private readonly userRepository: UserRepository,
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
      if (!direction) throw new BadRequestException('direction not found');
      departement =
        direction.departements.length > 0 ? direction.departements[0] : null;
      if (!departement)
        throw new BadRequestException('departement is not in direction');
    }

    const res = await this.userRepository.save({
      ...userData,
      direction,
      departement,
    });

    const adminUsers = await this.userRepository.findAdminUsers();
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
      departementId,
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
    return this.userRepository.findAllBy(options).then((r) => r[0] ?? null);
  }

  async getUserPassword(id: string): Promise<UserEntity> {
    return this.userRepository.getUserPassword(id);
  }

  async findByEmailWithToken(email: string): Promise<UserEntity> {
    return this.userRepository.findByEmailWithToken(email);
  }

  async findByIdWithToken(userId: string): Promise<UserEntity> {
    return this.userRepository.findByIdWithToken(userId);
  }

  async findByEmailOrUsername({
    email,
    username,
  }: {
    email: string;
    username: string;
  }): Promise<UserEntity> {
    try {
      return this.userRepository.findByEmailOrUsername(email, username);
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async findAndUpdate(
    userId: string,
    partialEntity: QueryDeepPartialEntity<UserEntity>,
  ): Promise<UpdateResult> {
    return this.userRepository.update(userId, partialEntity);
  }

  async findAll(
    offset = 0,
    limit = 10,
    orderBy: string = undefined,
    searchQuery: string = undefined,
    departementId: string = undefined,
    directionId: string = undefined,
    active: 'active' | 'not_active' = undefined,
    role: UserRole = undefined,
  ): Promise<PaginationResponse<UserEntity>> {
    return this.userRepository.findPaginated(
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
    const currentUser = await this.userRepository.findById(currentUserId);
    if (!currentUser)
      throw new InternalServerErrorException('connected user not found');

    const userDb = await this.userRepository
      .findByEmailOrUsername(newUser.email, newUser.username)
      .then(async (u) => {
        if (!u) return null;
        // re-fetch with relations for notification data
        return this.userRepository.findByIdWithDepartementAndDirection(u.id);
      });

    if (!userDb) throw new NotFoundException("l'utilisateur n'existe pas");
    if (currentUser.role !== UserRole.ADMIN && userDb.id !== currentUser.id)
      throw new ForbiddenException('permission denied');
    if (userDb.id !== id)
      throw new ForbiddenException("username et l'email   exists deja");

    const { imageUrl } = newUser;
    if (!imageUrl) delete newUser.imageUrl;
    const res = await this.userRepository.update(id, { ...newUser });

    const departement = userDb.departement;
    const direction = userDb.direction;

    await this.notificationService.emitDataToAdminsOnly({
      entity: userDb.role as unknown as Entity,
      entityId: id,
      operation: Operation.UPDATE,
      departementId: userDb.departementId,
      directionId: userDb.directionId,
      departementAbriviation: departement?.abriviation ?? '',
      directionAbriviation: direction?.abriviation ?? '',
    });

    const adminUsers = await this.userRepository.findAdminUsers();
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

  async findByIdWithDepartementAndDirection(id: string): Promise<UserEntity> {
    return this.userRepository.findByIdWithDepartementAndDirection(id);
  }

  async findAllBy(
    options: FindOptionsWhere<UserEntity> | FindOptionsWhere<UserEntity>[],
  ): Promise<UserEntity[]> {
    return this.userRepository.findAllBy(options);
  }

  async getUserTypesStats(params: StatsParamsDTO, _user: UserEntity) {
    const stats = await this.userRepository.getUserTypesStats(params);
    const response: any = { juridical: 0, employee: 0, admin: 0, total: 0 };
    stats.forEach((st) => {
      response[(st.role as unknown as string).toLowerCase()] = parseInt(
        st.total,
      );
    });
    response.total = response.juridical + response.admin + response.employee;
    return response;
  }

  async updateUserPasswordToken(token: string, userId: string): Promise<void> {
    await this.userRepository.savePasswordToken(token, userId);
  }

  async deleteUserPasswordToken(id: string, userId: string): Promise<void> {
    await this.userRepository.deletePasswordToken(id, userId);
  }

  async deleteUserPasswordTokenAndUpdatePassword(
    id: string,
    userId: string,
    password: string,
    directionId: string,
    departementId: string,
    userRole: UserRole,
  ): Promise<void> {
    await this.userRepository.deletePasswordTokenAndUpdatePassword(
      id,
      userId,
      password,
    );

    const userDb =
      await this.userRepository.findByIdWithDepartementAndDirection(userId);
    await this.notificationService.emitDataToAdminsOnly({
      entity: userRole as unknown as Entity,
      entityId: userId,
      operation: Operation.UPDATE,
      directionId,
      departementId,
      departementAbriviation: userDb?.departement?.abriviation ?? '',
      directionAbriviation: userDb?.direction?.abriviation ?? '',
    });

    const adminUsers = await this.userRepository.findAdminUsers();
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

  async updateUserPassword(
    id: string,
    hashed_password: string,
  ): Promise<UpdateResult> {
    return this.userRepository.updatePassword(id, hashed_password);
  }

  async recieveNotifications(
    userId: string,
    recieve_notifications: boolean,
  ): Promise<boolean> {
    const userDb =
      await this.userRepository.findByIdWithDepartementAndDirection(userId);
    await this.userRepository.toggleNotifications(userId);
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

  async deleteUser(userId: string): Promise<void> {
    const userDb =
      await this.userRepository.findByIdWithDepartementAndDirection(userId);
    const departement = userDb?.departement;
    const direction = userDb?.direction;
    Logger.debug(userId + '---->' + JSON.stringify(userDb), 'deleteUser');
    if (!userDb) throw new NotFoundException("l'utilisateur n'est pas trouvé");

    await this.userRepository.delete(userId);

    await this.notificationService.emitDataToAdminsOnly({
      entity: userDb.role as unknown as Entity,
      entityId: userDb.role,
      operation: Operation.DELETE,
      directionId: direction?.id,
      departementId: departement?.id,
      departementAbriviation: userDb?.departement?.abriviation ?? '',
      directionAbriviation: userDb?.direction?.abriviation ?? '',
    });
    const adminUsers = await this.userRepository.findAdminUsers();
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
