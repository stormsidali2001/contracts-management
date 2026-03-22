import { INestApplicationContext, Logger, UnauthorizedException, WebSocketAdapter } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { Server, ServerOptions } from 'socket.io';
import { SocketWithJwtPayload } from 'src/auth/types/JwtPayload.interface';

export class SocketIoAdapter extends IoAdapter implements WebSocketAdapter {
  private readonly logger = new Logger(SocketIoAdapter.name);
  private server: Server;

  constructor(private app: INestApplicationContext) {
    super(app);
  }

  public createIOServer(port: number, options?: ServerOptions): any {
    const configService = this.app.get(ConfigService);
    const clientPort = parseInt(configService.get('CLIENT_PORT'));
    const url1 = `http://localhost:${clientPort}`;
    const regexUrl2 = new RegExp(
      `/^http:\\/\\/192\\.168\\.1\\.([1-9]|[1-9]\\d):${clientPort}$/`,
    );

    const cors = { origin: [url1, regexUrl2] };
    this.logger.log(
      `Creating socket.io server — cors: ${url1} | ${regexUrl2}`,
    );

    const jwtService = this.app.get(JwtService);
    this.server = super.createIOServer(port, { ...options, cors });

    // Redis pub/sub adapter — makes all emit() calls work across processes
    const redisHost = configService.get<string>('REDIS_HOST', 'localhost');
    const redisPort = configService.get<number>('REDIS_PORT', 6379);
    const pubClient = new Redis({ host: redisHost, port: redisPort });
    const subClient = pubClient.duplicate();
    this.server.adapter(createAdapter(pubClient, subClient));
    this.logger.log(`Redis adapter attached (${redisHost}:${redisPort})`);

    this.server.of('notifications').use(
      tokenMiddlewareWrapper(jwtService, this.logger, configService),
    );
    this.logger.log('JWT middleware set on /notifications');

    return this.server;
  }

  bindClientConnect(server: Server, callback: Function): void {
    server.on('connection', (socket: SocketWithJwtPayload) => {
      callback(socket);
    });
  }
}

function tokenMiddlewareWrapper(
  jwtService: JwtService,
  logger: Logger,
  configService: ConfigService,
) {
  return async (socket: SocketWithJwtPayload, next: (err?: Error) => void) => {
    const token = socket.handshake.auth.token;
    try {
      logger.log('Authenticating socket...');
      const payload = await jwtService.verify(token, {
        secret: configService.get('JWT_ACCESS_TOKEN_SECRET'),
      });
      socket.user = payload.user;
      logger.debug(`Socket ${socket.id} authenticated as ${socket.user.sub}`);
      next();
    } catch (e) {
      logger.error(`Socket ${socket.id} auth failed: ${e}`);
      next(new UnauthorizedException('unauthorized'));
    }
  };
}
