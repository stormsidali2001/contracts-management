import { ForbiddenException, INestApplicationContext, Injectable, Logger, UnauthorizedException, WebSocketAdapter } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { WsException } from "@nestjs/websockets";
import { Server, ServerOptions } from "socket.io";
import { SocketWithJwtPayload } from "src/auth/types/JwtPayload.interface";
import { SocketStateService } from "src/socket/SocketState.service";

export class SocketIoAdapter extends IoAdapter  implements WebSocketAdapter {
    private readonly logger = new Logger(SocketIoAdapter.name);
    private server:Server;
    constructor(
      private app:INestApplicationContext,
        ) {
      super(app)
    }



    public createIOServer(port: number, options?: ServerOptions): any {
        const configService = this.app.get(ConfigService);
        const clientPort = parseInt(configService.get('CLIENT_PORT'));
        const url1 = `http://localhost:${clientPort}`;
        const regexUrl2 = new RegExp(`/^http:\/\/192\.168\.1\.([1-9]|[1-9]\d):${clientPort}$/`);

        const cors = {
            origin: [
              url1,
              regexUrl2,
            ],
          };
        this.logger.log(`Creating socket.io server with cors configurations : url = ${url1} or url = \n ${regexUrl2.toString()}`);
        const jwtService = this.app.get(JwtService)

        this.server =  super.createIOServer(port,{...options, cors});
        const middleWare = tokenMiddlewareWrapper(jwtService,this.logger,configService);
        this.server.of('notifications').use(middleWare);
        this.logger.log(`server is created and middlwares are set`);
     
        return this.server;

    }
     bindClientConnect(server:Server, callback: Function): void {
      const socketStateService = this.app.get(SocketStateService)
      server.on('connection', (socket: SocketWithJwtPayload) => {
        if (socket.user) {
          socketStateService.add(socket.user.sub, socket);
          Logger.debug(`user: ${socket.user.sub} has now : ${socketStateService.get(socket.user.sub).length} connected socket`,'connection')
   
          socket.on('disconnect', () => {
            socketStateService.remove(socket.user.sub, socket);
            Logger.debug(`user: ${socket.user.sub} has now : ${socketStateService.get(socket.user.sub).length} connected socket`,'disconnect')

          });
        }
   
        callback(socket);
      });
    }
 
}

function tokenMiddlewareWrapper(jwtService:JwtService,logger:Logger,configService:ConfigService) {
  return  async(socket:SocketWithJwtPayload,next) => {
      const token = socket.handshake.auth.token ;
      console.log("token: ",token,'...............................')
      try{
          logger.log('authenticating the socket ...');
          const payload = await jwtService.verify(token,{
              secret:configService.get('JWT_ACCESS_TOKEN_SECRET'),
              
          });

          socket.user = payload.user;
         
          logger.debug(`socket ${socket.id} of user: ${socket.user.sub} authenticated`);
          next()

      }catch(e){
          logger.error(`Failed to authenticate socket: ${socket.id} \n ${e}`);
          
          next( new UnauthorizedException("unauthorized"))
      }
  }
}