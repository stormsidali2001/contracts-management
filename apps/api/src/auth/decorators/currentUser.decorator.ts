import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../types/JwtPayload.interface';

export const CurrentUser = createParamDecorator(
  (_: undefined, context: ExecutionContext): JwtPayload => {
    const request = context.switchToHttp().getRequest();
    return request.user as JwtPayload;
  },
);
