import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Emitter } from '@socket.io/redis-emitter';
import Redis from 'ioredis';

/**
 * Cross-process Socket.IO emitter backed by Redis.
 * Works in any NestJS context — HTTP server, seed script, microservice — as
 * long as the main API has the @socket.io/redis-adapter configured.
 */
@Injectable()
export class RedisEmitterService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisEmitterService.name);
  private readonly redis: Redis;
  private readonly emitter: Emitter;

  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
    });
    this.emitter = new Emitter(this.redis);
    this.logger.log('Redis emitter connected');
  }

  /** Broadcast to every connected client in the namespace. */
  broadcast(event: string, data: unknown): void {
    this.emitter.of('/notifications').emit(event, data);
  }

  /** Emit to all sockets that joined a given room (role, dept, userId…). */
  toRoom(room: string, event: string, data: unknown): void {
    this.emitter.of('/notifications').to(room).emit(event, data);
  }

  onModuleDestroy() {
    this.redis.disconnect();
  }
}
