import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace } from 'socket.io';
import { SocketWithJwtPayload } from 'src/auth/types/JwtPayload.interface';
import { EventService } from 'src/Event/application/Event.service';
import { SocketStateService } from 'src/socket/SocketState.service';
import { UserNotificationService } from 'src/user/application/user-notification.service';
import { UserService } from './application/user.service';

@WebSocketGateway({
  namespace: 'notifications',
  transports: ['websocket'],
})
export class NotificationsGateWay
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private socketStateService: SocketStateService,
    private notificationService: UserNotificationService,
    private readonly eventService: EventService,
    private readonly userService: UserService,
  ) {}
  private readonly logger = new Logger(NotificationsGateWay.name);
  @WebSocketServer() io: Namespace;
  afterInit(server: any) {
    this.logger.log('notification gatway initialized !!!');
    this.socketStateService.notificationServer = server;
  }

  async handleConnection(client: SocketWithJwtPayload) {
    if (client.user) {
      const userDb = await this.userService.findBy({ id: client.user.sub });
      if (userDb) {
        // Role room (admin | juridical | employee)
        client.join(userDb.role);
        // Per-user room for direct notifications
        client.join(`user:${userDb.id}`);
        // Departement room for org-scoped events
        if (userDb.departementId) {
          client.join(`dept:${userDb.departementId}`);
        }
      }
    }
    this.logger.log(
      `Client connected: ${client.id} — sockets: ${this.io.sockets.size}`,
    );
  }

  handleDisconnect(client: SocketWithJwtPayload) {
    this.logger.log(
      `Client disconnected: ${client.id} — sockets: ${this.io.sockets.size}`,
    );
  }

  @SubscribeMessage('request_all_notifications')
  async getNotifications(@ConnectedSocket() client: SocketWithJwtPayload) {
    const userId = client.user.sub;
    const notifications = await this.notificationService.getUserNotifications(
      userId,
    );
    this.logger.debug(`request all notifications user : ${client.user.email}`);
    client.emit('send_all_notifications', notifications);
  }

  @SubscribeMessage('REQUEST_ALL_EVENTS')
  async getLastEvents(@ConnectedSocket() client: SocketWithJwtPayload) {
    this.logger.debug(`request all events user : ${client.user.email}`);
    const user = await this.userService.findBy({ id: client.user.sub });
    const events = await this.eventService.getEvents(20, user);

    client.emit('SEND_EVENTS', events);
  }
}

