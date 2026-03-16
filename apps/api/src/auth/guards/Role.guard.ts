import {Injectable , CanActivate, ExecutionContext, Inject, forwardRef } from '@nestjs/common'
import {Reflector} from '@nestjs/core'
import { Observable } from 'rxjs';
import { UserService } from 'src/user/user.service';
import { JwtPayload } from '../types/JwtPayload.interface';
import {  REQUIRED_ROLES_KEY } from '../decorators/RequiredRoles.decorator';
@Injectable()
export class RoleGuard implements CanActivate{
    constructor(
        @Inject(forwardRef(()=>UserService)) private readonly userService:UserService,
        private readonly reflector:Reflector
    ){}
     async canActivate(context: ExecutionContext): Promise<boolean>  {
        const request = context.switchToHttp().getRequest();
        const user = <JwtPayload>request.user;
        const id = user.sub;
        const userDb =  await this.userService.findBy({id});

        const roles:string[] = this.reflector.getAllAndOverride(REQUIRED_ROLES_KEY,[context.getHandler(),context.getClass]);

        if(!roles) return true;
        console.log(userDb,roles,"........../////")
        return roles.some(role =>  userDb.role === role);

    }
    
}