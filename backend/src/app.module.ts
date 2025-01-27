import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { OrdersModule } from './orders/orders.module';
import { SecurityModule } from './security/security.module';
import { PrismaModule } from './prisma/prisma.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { WebsocketModule } from './websocket/websocket.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    EventsModule,
    OrdersModule,
    SecurityModule,
    MonitoringModule,
    WebsocketModule,
    MailModule,
  ],
})
export class AppModule {}