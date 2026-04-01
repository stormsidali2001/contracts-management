import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUserId } from 'src/auth/decorators/currentUserId.decorator';
import { JwtAccessTokenGuard } from 'src/auth/guards/jwt-access-token.guard';
import { NotificationView } from '@contracts/types';
import { NotificationPresenter } from 'src/user/infrastructure/notification.presenter';
import { UserNotificationService } from '../application/user-notification.service';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly userNotificationService: UserNotificationService,
  ) {}

  @UseGuards(JwtAccessTokenGuard)
  @Get('')
  async getUserNotifications(
    @CurrentUserId() userId: string,
  ): Promise<NotificationView[]> {
    const result = await this.userNotificationService.getUserNotifications(userId);
    return NotificationPresenter.fromMany(result);
  }
}
