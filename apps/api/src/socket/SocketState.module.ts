import { Global, Module } from '@nestjs/common';
import { RedisEmitterService } from './redis-emitter.service';
import { SocketStateService } from './SocketState.service';

@Global()
@Module({
  providers: [RedisEmitterService, SocketStateService],
  exports: [RedisEmitterService, SocketStateService],
})
export class SocketStateModule {}
