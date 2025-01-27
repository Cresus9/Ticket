import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentProcessorService } from './services/payment-processor.service';
import { PaymentValidationService } from './services/payment-validation.service';
import { PaymentNotificationService } from './services/payment-notification.service';
import { PaymentLoggingService } from './services/payment-logging.service';
import { OrdersModule } from '../orders/orders.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [OrdersModule, NotificationsModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    PaymentProcessorService,
    PaymentValidationService,
    PaymentNotificationService,
    PaymentLoggingService
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}