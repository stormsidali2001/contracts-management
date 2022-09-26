import { Logger } from "@nestjs/common";
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Namespace ,Socket} from "socket.io";


@WebSocketGateway({
    namespace:"notifications"
})
export class NotificationsGateWay implements OnGatewayInit , OnGatewayConnection , OnGatewayDisconnect{
    private readonly logger = new Logger(NotificationsGateWay.name);
    @WebSocketServer() io:Namespace;
    afterInit(server: any) {
        this.logger.log("notification gatway initialized !!!");
    }
    handleConnection(client: Socket, ...args: any[]) {
        const sockets = this.io.sockets;
        console.log(client)
        this.logger.log(`Client connected: ${client.id}`);
        this.logger.debug(`Number of connected sockets is : ${sockets.size}`);
    }
    handleDisconnect(client: any) {
        const sockets = this.io.sockets;
        this.logger.log(`Client disconnected: ${client.id}`);
        this.logger.debug(`Number of connected sockets is : ${sockets.size}`);
    }
   
}