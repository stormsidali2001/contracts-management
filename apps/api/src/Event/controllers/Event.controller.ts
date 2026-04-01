import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/currentUser.decorator';
import { JwtAccessTokenGuard } from 'src/auth/guards/jwt-access-token.guard';
import { JwtPayload } from 'src/auth/types/JwtPayload.interface';
import { UserRole } from 'src/core/types/UserRole.enum';
import { EventView } from '@contracts/types';
import { EventPresenter } from 'src/core/mappers/event.presenter';
import { EventService } from '../application/Event.service';

@ApiTags('events')
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @UseGuards(JwtAccessTokenGuard)
  @Get('')
  async getEvents(
    @Query('limit') limit: number = 20,
    @CurrentUser() user: JwtPayload,
  ): Promise<EventView[]> {
    const result = await this.eventService.getEvents(
      limit,
      user.role as UserRole,
      user.departementId,
      user.directionId,
    );
    return EventPresenter.fromMany(result);
  }
}
