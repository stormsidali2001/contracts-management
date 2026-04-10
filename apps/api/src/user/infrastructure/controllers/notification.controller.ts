import {
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUserId } from 'src/auth/infrastructure/decorators/currentUserId.decorator';
import { JwtAccessTokenGuard } from 'src/auth/infrastructure/guards/jwt-access-token.guard';
import { NotificationView } from '@contracts/types';
import { NotificationPresenter } from 'src/user/infrastructure/notification.presenter';
import { UserNotificationService } from '../../application/user-notification.service';

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
    const result = await this.userNotificationService.getUserNotifications(
      userId,
    );
    return NotificationPresenter.fromMany(result);
  }

  @UseGuards(JwtAccessTokenGuard)
  @Patch('read-all')
  @HttpCode(204)
  async markAllAsRead(@CurrentUserId() userId: string): Promise<void> {
    await this.userNotificationService.markAllAsRead(userId);
  }

  @UseGuards(JwtAccessTokenGuard)
  @Patch(':id/read')
  @HttpCode(204)
  async markAsRead(
    @Param('id') notificationId: string,
    @CurrentUserId() userId: string,
  ): Promise<void> {
    await this.userNotificationService.markAsRead(notificationId, userId);
  }
}
