import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const CurrentUserId = createParamDecorator((_:undefined,context:ExecutionContext):string=>{
    const request = context.switchToHttp().getRequest();
    return request.user['sub'];
})