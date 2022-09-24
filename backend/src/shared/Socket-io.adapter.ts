import { INestApplicationContext, Logger, WebSocketAdapter } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { Server, ServerOptions } from "socket.io";
import { SocketWithJwtPayload } from "src/auth/types/JwtPayload.interface";


export class SocketIoAdapter extends IoAdapter   {
    private readonly logger = new Logger(SocketIoAdapter.name);
    constructor(private app:INestApplicationContext   
        ) {
      super(app)
    }

    
    createIOServer(port: number, options?: ServerOptions): any {
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

        const server:Server =  super.createIOServer(port,{...options, cors});
        const middleWare = tokenMiddlewareWrapper(jwtService,this.logger,configService);
        server.use(middleWare);
        return server;

    }
 
}

function tokenMiddlewareWrapper(jwtService:JwtService,logger:Logger,configService:ConfigService) {
  return  async(socket:SocketWithJwtPayload,next) => {
      const token = socket.handshake.auth.token || socket.handshake.headers['token'];
      console.log("token: ",token)
      try{
          logger.log('authenticating the socket ...');
          const payload = await jwtService.verify(token,{
              secret:configService.get('ACCESS_TOKEN_SECRET')
          });

          socket.user = payload;
         
          logger.log(`socket ${socket.id} authenticated`);
          next()

      }catch(e){
          logger.error(`Failed to authenticate socket: ${socket.id} \n ${e}`);
          next(new Error('Forbidden'))
      }
  }
}