import { Injectable, Inject } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { v4 as uuid } from 'uuid';
import {
  CreateUserDTO,
  UpdateUserDTO,
} from 'src/core/dtos/user.dto';
import { PaginationResponse } from 'src/core/types/paginationResponse.interface';
import { UserRole } from 'src/core/types/UserRole.enum';
import { DirectionService } from 'src/direction/application/direction.service';
import { StatsParamsDTO } from 'src/statistics/models/statsPramsDTO.interface';
import { User } from '../domain/user.aggregate';
import {
  IUserRepository,
  UserProfile,
  USER_REPOSITORY,
} from '../domain/user.repository';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from 'src/shared/domain/errors';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly directionService: DirectionService,
    private readonly eventBus: EventBus,
  ) {}

  async create(newUser: CreateUserDTO): Promise<User> {
    const { departementId = null, directionId = null, ...userData } = newUser;
    let directionData: { id: string; abriviation: string } | null = null;
    let departementData: { id: string; abriviation: string } | null = null;

    if (directionId && departementId) {
      const direction = await this.directionService.find(directionId);
      if (!direction) throw new NotFoundError('direction not found');
      const dept = direction.departements.find((d) => d.id === departementId) ?? null;
      if (!dept) throw new NotFoundError('departement is not in direction');
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
    user.recordCreated(departementData?.abriviation ?? '', directionData?.abriviation ?? '');
    this.eventBus.publishAll(user.pullEvents());

    return saved;
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
    return this.userRepository.findByEmailOrUsername(email, username);
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
  ): Promise<PaginationResponse<User>> {
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
    dto: UpdateUserDTO,
    currentUserId: string,
  ): Promise<UserProfile> {
    const currentUser = await this.userRepository.findById(currentUserId);
    if (!currentUser)
      throw new NotFoundError('connected user not found');

    const duplicate = await this.userRepository
      .findByEmailOrUsername(dto.email ?? '', dto.username ?? '')
      .then(async (u) => {
        if (!u) return null;
        return this.userRepository.findProfileById(u.id);
      });

    if (!duplicate) throw new NotFoundError("l'utilisateur n'existe pas");
    if (currentUser.role !== UserRole.ADMIN && duplicate.id !== currentUser.id)
      throw new ForbiddenError('permission denied');
    if (duplicate.id !== id)
      throw new ConflictError("username et l'email exists deja");

    const user = await this.userRepository.findById(id);
    if (!dto.imageUrl) delete dto.imageUrl;
    user.update(dto);
    await this.userRepository.save(user);

    const saved = await this.userRepository.findProfileById(id);
    user.recordUpdated(saved.departement?.abriviation ?? '', saved.direction?.abriviation ?? '');
    this.eventBus.publishAll(user.pullEvents());

    return saved;
  }

  async findByIdWithDepartementAndDirection(id: string): Promise<UserProfile> {
    return this.userRepository.findProfileById(id);
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
    return !recieve_notifications;
  }

  async deleteUser(userId: string): Promise<void> {
    const profile = await this.userRepository.findProfileById(userId);
    if (!profile) throw new NotFoundError("l'utilisateur n'est pas trouvé");

    const user = await this.userRepository.findById(userId);
    user.recordDeleted(
      profile.departement?.abriviation ?? '',
      profile.direction?.abriviation ?? '',
    );

    await this.userRepository.delete(userId);
    this.eventBus.publishAll(user.pullEvents());
  }

  async updateImage(userId: string, imageUrl: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) return;
    user.updateImage(imageUrl);
    await this.userRepository.save(user);
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
