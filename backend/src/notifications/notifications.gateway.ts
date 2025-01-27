import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UseGuards } from '@nestjs/common';
import { WsAuthGuard } from '../auth/guards/ws-auth.guard';
import { Notification } from '@prisma/client';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
})
@UseGuards(WsAuthGuard)
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, Set<string>> = new Map();

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId).add(client.id);

      client.join(`user:${userId}`);
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, sockets] of this.userSockets.entries()) {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
        break;
      }
    }
  }

  sendNotification(userId: string, notification: Notification) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }

  @SubscribeMessage('markAsRead')
  handleMarkAsRead(client: Socket, notificationId: string) {
    // Sync read status across devices
    const room = Array.from(client.rooms).find(room => room.startsWith('user:'));
    if (room) {
      this.server.to(room).emit('notificationRead', notificationId);
    }
  }

  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  getUserSocketCount(userId: string): number {
    return this.userSockets.get(userId)?.size || 0;
  }
}