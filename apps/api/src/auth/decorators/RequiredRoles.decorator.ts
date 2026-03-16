import {SetMetadata} from '@nestjs/common'
export const REQUIRED_ROLES_KEY = 'required_roles'
export const RequiredRoles = (...roles:string[])=> SetMetadata(REQUIRED_ROLES_KEY,roles);