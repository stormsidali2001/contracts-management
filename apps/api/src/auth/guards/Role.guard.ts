import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtPayload } from '../types/JwtPayload.interface';
import { REQUIRED_ROLES_KEY } from '../decorators/RequiredRoles.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles: string[] = this.reflector.getAllAndOverride(REQUIRED_ROLES_KEY, [
      context.getHandler(),
      context.getClass,
    ]);

    if (!roles) return true;

    const request = context.switchToHttp().getRequest();
    const user = <JwtPayload>request.user;
    return roles.some((role) => user.role === role);
  }
}
