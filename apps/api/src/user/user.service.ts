import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import {
  CreateUserDTO,
  UpdateUserDTO,
} from 'src/core/dtos/user.dto';
import { Entity } from 'src/core/types/entity.enum';
import { Operation } from 'src/core/types/operation.enum';
import { PaginationResponse } from 'src/core/types/paginationResponse.interface';
import { UserRole } from 'src/core/types/UserRole.enum';
import { UserView } from 'src/core/views/user.view';
import { DirectionService } from 'src/direction/services/direction.service';
import { StatsParamsDTO } from 'src/statistics/models/statsPramsDTO.interface';
import { User } from './domain/user';
import {
  IUserRepository,
  USER_REPOSITORY,
} from './domain/user.repository';
import {
  NotificationBody,
  UserNotificationService,
} from './user-notification.service';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly directionService: DirectionService,
    @Inject(forwardRef(() => UserNotificationService))
    private readonly notificationService: UserNotificationService,
  ) {}

  async create(newUser: CreateUserDTO): Promise<UserView> {
    const { departementId = null, directionId = null, ...userData } = newUser;
    let directionData: { id: string; abriviation: string } | null = null;
    let departementData: { id: string; abriviation: string } | null = null;

    if (directionId && departementId) {
      const direction = await this.directionService.findWithDepartement(
        directionId,
        departementId,
      );
      if (!direction) throw new BadRequestException('direction not found');
      const dept = direction.departements[0];
      if (!dept) throw new BadRequestException('departement is not in direction');
      directionData = { id: direction.id, abriviation: direction.abriviation };
      departementData = { id: dept.id, abriviation: dept.abriviation };
    }

    const user = User.create({
      id: uuid(),
      ...userData,
      role: userData.role ?? UserRole.EMPLOYEE,
      directionId,
      departementId,
    });

    const saved = await this.userRepository.save(user);

    const admins = await this.userRepository.findAdmins();
    const extraMessage =
      directionData && departementData
        ? `au ${departementData.abriviation} de ${directionData.abriviation}`
        : '';
    const notifications: NotificationBody[] = admins.map((u) => ({
      userId: u.id,
      message: `l'utilisateur ${saved.email} de type ${saved.role} est ajouté ${extraMessage} avec success`,
    }));

    if (notifications.length > 0)
      await this.notificationService.sendNotifications(notifications);

    await this.notificationService.emitDataToAdminsOnly({
      entity: saved.role as unknown as Entity,
      operation: Operation.INSERT,
      departementId,
      directionId,
      entityId: saved.id,
      departementAbriviation: departementData?.abriviation ?? '',
      directionAbriviation: directionData?.abriviation ?? '',
    });
    await this.notificationService.IncrementUsersStats({
      type: saved.role as unknown as Entity,
      operation: Operation.INSERT,
    });

    return UserView.from(saved);
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async findByEmailOrUsername({
    email,
    username,
  }: {
    email: string;
    username: string;
  }): Promise<User | null> {
    try {
      return this.userRepository.findByEmailOrUsername(email, username);
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  // Used by auth guards and socket adapters that only need basic user fields
  async findBy(options: { id?: string; role?: UserRole }): Promise<User | null> {
    if (options.id) return this.userRepository.findById(options.id);
    return null;
  }

  async findAll(
    offset = 0,
    limit = 10,
    orderBy?: string,
    searchQuery?: string,
    departementId?: string,
    directionId?: string,
    active?: 'active' | 'not_active',
    role?: UserRole,
  ): Promise<PaginationResponse<UserView>> {
    const result = await this.userRepository.findPaginated(
      offset,
      limit,
      orderBy,
      searchQuery,
      departementId,
      directionId,
      active,
      role,
    );
    return { total: result.total, data: UserView.fromMany(result.data) };
  }

  async updateUserUniqueCheck(
    id: string,
    dto: UpdateUserDTO,
    currentUserId: string,
  ): Promise<UserView> {
    const currentUser = await this.userRepository.findById(currentUserId);
    if (!currentUser)
      throw new InternalServerErrorException('connected user not found');

    const duplicate = await this.userRepository
      .findByEmailOrUsername(dto.email ?? '', dto.username ?? '')
      .then(async (u) => {
        if (!u) return null;
        return this.userRepository.findProfileById(u.id);
      });

    if (!duplicate) throw new NotFoundException("l'utilisateur n'existe pas");
    if (currentUser.role !== UserRole.ADMIN && duplicate.id !== currentUser.id)
      throw new ForbiddenException('permission denied');
    if (duplicate.id !== id)
      throw new ForbiddenException("username et l'email   exists deja");

    const user = await this.userRepository.findById(id);
    if (!dto.imageUrl) delete dto.imageUrl;
    user.update(dto);
    await this.userRepository.save(user);

    const saved = await this.userRepository.findProfileById(id);
    await this.notificationService.emitDataToAdminsOnly({
      entity: saved.role as unknown as Entity,
      entityId: id,
      operation: Operation.UPDATE,
      departementId: saved.departementId,
      directionId: saved.directionId,
      departementAbriviation: saved.departement?.abriviation ?? '',
      directionAbriviation: saved.direction?.abriviation ?? '',
    });

    const admins = await this.userRepository.findAdmins();
    const extraMessage =
      saved.departement && saved.direction
        ? `au ${saved.departement.abriviation} de ${saved.direction.abriviation}`
        : '';
    const notifications: NotificationBody[] = admins.map((u) => ({
      userId: u.id,
      message: `l'utilisateur ${saved.email} de type ${saved.role} ${extraMessage} est mis a jour avec success`,
    }));

    if (notifications.length > 0)
      await this.notificationService.sendNotifications(notifications);

    await this.notificationService.emitDataToAdminsOnly({
      entity: saved.role as unknown as Entity,
      operation: Operation.UPDATE,
      departementId: saved.departement?.id,
      directionId: saved.direction?.id,
      entityId: saved.id,
      departementAbriviation: saved.departement?.abriviation ?? '',
      directionAbriviation: saved.direction?.abriviation ?? '',
    });
    await this.notificationService.IncrementUsersStats({
      type: saved.role as unknown as Entity,
      operation: Operation.UPDATE,
    });

    return UserView.from(saved);
  }

  async findByIdWithDepartementAndDirection(id: string): Promise<UserView> {
    const user = await this.userRepository.findProfileById(id);
    return UserView.from(user);
  }

  async getUserTypesStats(params: StatsParamsDTO, _user: User) {
    const stats = await this.userRepository.getUserTypesStats(params);
    const response: any = { juridical: 0, employee: 0, admin: 0, total: 0 };
    stats.forEach((st) => {
      response[(st.role as unknown as string).toLowerCase()] = parseInt(st.total);
    });
    response.total = response.juridical + response.admin + response.employee;
    return response;
  }

  async recieveNotifications(
    userId: string,
    recieve_notifications: boolean,
  ): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    user.toggleNotifications();
    await this.userRepository.save(user);

    const profile = await this.userRepository.findProfileById(userId);
    await this.notificationService.emitDataToAdminsOnly({
      entity: user.role as unknown as Entity,
      entityId: userId,
      operation: Operation.UPDATE,
      directionId: user.directionId,
      departementId: user.departementId,
      departementAbriviation: profile?.departement?.abriviation ?? '',
      directionAbriviation: profile?.direction?.abriviation ?? '',
    });
    return !recieve_notifications;
  }

  async deleteUser(userId: string): Promise<void> {
    const profile = await this.userRepository.findProfileById(userId);
    if (!profile) throw new NotFoundException("l'utilisateur n'est pas trouvé");

    await this.userRepository.delete(userId);

    await this.notificationService.emitDataToAdminsOnly({
      entity: profile.role as unknown as Entity,
      entityId: profile.role,
      operation: Operation.DELETE,
      directionId: profile.direction?.id,
      departementId: profile.departement?.id,
      departementAbriviation: profile.departement?.abriviation ?? '',
      directionAbriviation: profile.direction?.abriviation ?? '',
    });

    const admins = await this.userRepository.findAdmins();
    const extraMessage =
      profile.departement && profile.direction
        ? `au ${profile.departement.abriviation} de ${profile.direction.abriviation}`
        : '';
    const notifications: NotificationBody[] = admins.map((u) => ({
      userId: u.id,
      message: `l'utilisateur ${profile.email} de type ${profile.role} est supprimé ${extraMessage} avec success`,
    }));

    if (notifications.length > 0)
      await this.notificationService.sendNotifications(notifications);

    await this.notificationService.emitDataToAdminsOnly({
      entity: profile.role as unknown as Entity,
      operation: Operation.DELETE,
      departementId: profile.departement?.id,
      directionId: profile.direction?.id,
      entityId: profile.id,
      departementAbriviation: profile.departement?.abriviation ?? '',
      directionAbriviation: profile.direction?.abriviation ?? '',
    });
    await this.notificationService.IncrementUsersStats({
      type: profile.role as unknown as Entity,
      operation: Operation.DELETE,
    });
  }

  async updateImage(userId: string, imageUrl: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) return;
    user.updateImage(imageUrl);
    await this.userRepository.save(user);
  }

  /**
   * Emits admin notifications after a password reset.
   * Called by AuthService after credential reset via UserCredentials aggregate.
   */
  async notifyPasswordChanged(userId: string): Promise<void> {
    const saved = await this.userRepository.findProfileById(userId);
    if (!saved) return;

    const admins = await this.userRepository.findAdmins();
    const extraMessage =
      saved.departement && saved.direction
        ? `au ${saved.departement.abriviation} de ${saved.direction.abriviation}`
        : '';
    const notifications: NotificationBody[] = admins.map((u) => ({
      userId: u.id,
      message: `l'utilisateur ${saved.email} de type ${saved.role} ${extraMessage} est mise a jour avec success`,
    }));

    if (notifications.length > 0)
      await this.notificationService.sendNotifications(notifications);

    await this.notificationService.emitDataToAdminsOnly({
      entity: saved.role as unknown as Entity,
      operation: Operation.UPDATE,
      departementId: saved.departement?.id,
      directionId: saved.direction?.id,
      entityId: saved.id,
      departementAbriviation: saved.departement?.abriviation ?? '',
      directionAbriviation: saved.direction?.abriviation ?? '',
    });
    await this.notificationService.IncrementUsersStats({
      type: saved.role as unknown as Entity,
      operation: Operation.UPDATE,
    });
  }

  // ── Read-model pass-through (used by AgreementService / NotificationService)

  async findAllBy(options: {
    departementId?: string;
    directionId?: string;
    role?: UserRole;
    departement?: { id: string };
  }): Promise<User[]> {
    if (options.departement?.id) {
      return this.userRepository.findByDepartementId(options.departement.id);
    }
    if (options.role === UserRole.JURIDICAL && options.departementId) {
      return this.userRepository.findJuridicalsByOrg(
        options.departementId,
        options.directionId,
      );
    }
    return [];
  }
}
