import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity } from 'src/core/entities/Event.entity';
import { EventRepository } from './event.repository';
import { EventService } from './services/Event.service';

@Module({
  imports: [TypeOrmModule.forFeature([EventEntity])],
  providers: [EventRepository, EventService],
  exports: [EventService],
})
export class EventModule {}

