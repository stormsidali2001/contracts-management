import { Logger } from "@nestjs/common";
import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Namespace ,Socket} from "socket.io";
import { SocketWithJwtPayload } from "src/auth/types/JwtPayload.interface";
import { SocketStateService } from "src/socket/SocketState.service";
import { UserNotificationService } from "src/user/user-notification.service";


@WebSocketGateway({
    namespace:"notifications",
    transports:['websocket']
   
})
export class NotificationsGateWay implements OnGatewayInit , OnGatewayConnection , OnGatewayDisconnect{
    constructor(
        private socketStateService:SocketStateService,
        private notificationService:UserNotificationService
    ){}
    private readonly logger = new Logger(NotificationsGateWay.name);
    @WebSocketServer() io:Namespace;
    afterInit(server: any) {
        this.logger.log("notification gatway initialized !!!");
        this.socketStateService.notificationServer = server;
    }

    handleConnection(client: SocketWithJwtPayload, ...args: any[]) {
        const sockets = this.io.sockets;
        //@ts-ignore
        this.logger.log(`Client connected: socketid: ${client.id} `);

        this.logger.debug(`
            Number of connected sockets is : ${sockets.size}
        `);

    }
    handleDisconnect(client: any) {
        const sockets = this.io.sockets;
        this.logger.log(`Client disconnected: ${client.id}`);
        this.logger.debug(`Number of connected sockets is : ${sockets.size}`);
    }

    @SubscribeMessage('request_all_notifications')
    async getNotifications(@ConnectedSocket() client:SocketWithJwtPayload){
        const userId = client.user.sub;
        const notifications = await this.notificationService.getUserNotifications(userId)
        this.logger.debug(`request all notifications user : ${client.user.email}`);

        client.emit("send_all_notifications",notifications)


    }
   
}