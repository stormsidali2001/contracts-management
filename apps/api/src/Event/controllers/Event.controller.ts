import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUserId } from 'src/auth/decorators/currentUserId.decorator';
import { JwtAccessTokenGuard } from 'src/auth/guards/jwt-access-token.guard';
import { UserService } from 'src/user/user.service';
import { EventView } from 'src/core/views/event.view';
import { EventService } from '../services/Event.service';

@ApiTags('events')
@Controller('events')
export class EventController {
  constructor(
    private readonly eventService: EventService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(JwtAccessTokenGuard)
  @Get('')
  async getEvents(
    @Query('limit') limit: number = 20,
    @CurrentUserId() userId: string,
  ): Promise<EventView[]> {
    const user = await this.userService.findBy({ id: userId });
    return this.eventService.getEvents(limit, user);
  }
}
