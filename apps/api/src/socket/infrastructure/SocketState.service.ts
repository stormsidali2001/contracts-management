import { Injectable, Logger } from '@nestjs/common';
import { Namespace } from 'socket.io';
import { UserRole } from 'src/core/types/UserRole.enum';
import { RedisEmitterService } from './redis-emitter.service';

/**
 * Thin wrapper that delegates all socket emission to the Redis-backed emitter.
 * Rooms are joined by the gateway on connect, so targeting is purely room-based
 * and works across every process that shares the same Redis instance.
 *
 * Room convention:
 *   admin | juridical | employee  — role rooms
 *   dept:<departementId>          — departement room
 *   user:<userId>                 — per-user room
 */
@Injectable()
export class SocketStateService {
  private readonly logger = new Logger(SocketStateService.name);

  /** Set by NotificationsGateway.afterInit — used only for local namespace ops. */
  public notificationServer: Namespace = null;

  constructor(private readonly redisEmitter: RedisEmitterService) {}

  /** Broadcast to ALL connected clients. */
  emitConnected(data: unknown, eventName: string): void {
    this.logger.debug(`broadcast → ${eventName}`);
    this.redisEmitter.broadcast(eventName, data);
  }

  /** Emit only to admin sockets. */
  emitDataToAdminsOnly(eventName: string, data: unknown): void {
    this.logger.debug(`→ admins: ${eventName}`);
    this.redisEmitter.toRoom(UserRole.ADMIN, eventName, data);
  }

  /**
   * Emit to admins, juridicals, AND members of a specific departement.
   */
  emitDataToConnectedUsersWithContrainsts(
    eventName: string,
    departementId: string,
    data: unknown,
  ): void {
    this.logger.debug(`→ org(${departementId}): ${eventName}`);
    this.redisEmitter.toRoom(UserRole.ADMIN, eventName, data);
    this.redisEmitter.toRoom(UserRole.JURIDICAL, eventName, data);
    this.redisEmitter.toRoom(`dept:${departementId}`, eventName, data);
  }

  /** Send to specific users by userId. */
  emitIfConnected(
    userData: { userId: string; data: unknown }[],
    eventName: string,
  ): void {
    userData.forEach(({ userId, data }) => {
      this.logger.debug(`→ user(${userId}): ${eventName}`);
      this.redisEmitter.toRoom(`user:${userId}`, eventName, data);
    });
  }
}
