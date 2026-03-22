import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserService } from 'src/user/application/user.service';
import { JwtPayload } from '../types/JwtPayload.interface';
import { REQUIRED_ROLES_KEY } from '../decorators/RequiredRoles.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles: string[] = this.reflector.getAllAndOverride(REQUIRED_ROLES_KEY, [
      context.getHandler(),
      context.getClass,
    ]);

    if (!roles) return true;

    const request = context.switchToHttp().getRequest();
    const user = <JwtPayload>request.user;
    const userDb = await this.userService.findBy({ id: user.sub });
    console.log(userDb, roles, '........./////');
    return roles.some((role) => userDb.role === role);
  }
}
