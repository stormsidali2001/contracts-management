import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUserId } from 'src/auth/decorators/currentUserId.decorator';
import { JwtAccessTokenGuard } from 'src/auth/guards/jwt-access-token.guard';
import { UserService } from 'src/user/application/user.service';
import { EventView } from '@contracts/types';
import { EventMapper } from 'src/core/mappers/event.mapper';
import { EventService } from '../application/Event.service';

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
    const result = await this.eventService.getEvents(limit, user);
    return EventMapper.fromMany(result);
  }
}
