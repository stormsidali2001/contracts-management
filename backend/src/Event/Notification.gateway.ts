import { Logger } from "@nestjs/common";
import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Namespace ,Socket} from "socket.io";
import { SocketWithJwtPayload } from "src/auth/types/JwtPayload.interface";


@WebSocketGateway({
    namespace:"notifications"
})
export class NotificationsGateWay implements OnGatewayInit , OnGatewayConnection , OnGatewayDisconnect{
    private readonly logger = new Logger(NotificationsGateWay.name);
    @WebSocketServer() io:Namespace;
    afterInit(server: any) {
        this.logger.log("notification gatway initialized !!!");
    }
    handleConnection(client: SocketWithJwtPayload, ...args: any[]) {
        const sockets = this.io.sockets;
        // console.log(client)
        this.logger.log(`Client connected: socketid: ${client.id} `);
        this.logger.debug(`Number of connected sockets is : ${sockets.size}`);
    }
    handleDisconnect(client: any) {
        const sockets = this.io.sockets;
        this.logger.log(`Client disconnected: ${client.id}`);
        this.logger.debug(`Number of connected sockets is : ${sockets.size}`);
    }

    @SubscribeMessage('request_all_notifications')
    async getNotifications(@ConnectedSocket() client:SocketWithJwtPayload){
    }
   
}