import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationTemplateService } from './services/template.service';
import { NotificationPreferenceService } from './services/preference.service';
import { NotificationSchedulerService } from './services/scheduler.service';
import { FCMService } from './services/fcm.service';
import { MailModule } from '../mail/mail.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    PrismaModule,
    MailModule,
    ConfigModule,
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsGateway,
    NotificationTemplateService,
    NotificationPreferenceService,
    NotificationSchedulerService,
    FCMService,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}