import { Injectable } from '@nestjs/common';
import {
  ConnectedUserResetPassword,
  CreateUserDTO,
  ForgotPasswordDTO,
  LoginUserDTO,
  ResetPasswordDTO,
} from 'src/core/dtos/user.dto';
import { AuthenticationService } from './authentication.service';
import { PasswordManagementService } from './password-management.service';
import { RegistrationService } from './registration.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly registrationService: RegistrationService,
    private readonly authenticationService: AuthenticationService,
    private readonly passwordManagementService: PasswordManagementService,
  ) {}

  async register(newUser: CreateUserDTO) {
    return this.registrationService.register(newUser);
  }

  async login(user: LoginUserDTO) {
    return this.authenticationService.login(user);
  }

  async refresh_token(id: string, refresh_token: string) {
    return this.authenticationService.refresh_token(id, refresh_token);
  }

  async logout(userId: string) {
    return this.authenticationService.logout(userId);
  }

  async forgotPassword(dto: ForgotPasswordDTO) {
    return this.passwordManagementService.forgotPassword(dto);
  }

  async resetPassword(dto: ResetPasswordDTO) {
    return this.passwordManagementService.resetPassword(dto);
  }

  async connectedUserResetPassword(
    dto: ConnectedUserResetPassword,
    userId: string,
  ) {
    return this.passwordManagementService.connectedUserResetPassword(
      dto,
      userId,
    );
  }

  async verifyAccessToken(userId: string) {
    return this.authenticationService.verifyAccessToken(userId);
  }
}
