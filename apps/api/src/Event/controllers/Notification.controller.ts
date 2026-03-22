import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUserId } from 'src/auth/decorators/currentUserId.decorator';
import { JwtAccessTokenGuard } from 'src/auth/guards/jwt-access-token.guard';
import { NotificationView } from '@contracts/types';
import { NotificationMapper } from 'src/core/mappers/notification.mapper';
import { UserNotificationService } from 'src/user/application/user-notification.service';

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
    return NotificationMapper.fromMany(result);
  }
}
