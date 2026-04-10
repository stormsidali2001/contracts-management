import { Global, Module } from '@nestjs/common';
import { RedisEmitterService } from './infrastructure/redis-emitter.service';
import { SocketStateService } from './infrastructure/SocketState.service';

@Global()
@Module({
  providers: [RedisEmitterService, SocketStateService],
  exports: [SocketStateService],
})
export class SocketStateModule {}
