import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { PaymentProcessorService } from './services/payment-processor.service';
import { PaymentValidationService } from './services/payment-validation.service';
import { PaymentNotificationService } from './services/payment-notification.service';
import { PaymentLoggingService } from './services/payment-logging.service';
import { ProcessPaymentDto, PaymentMethod } from './dto/process-payment.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private ordersService: OrdersService,
    private paymentProcessor: PaymentProcessorService,
    private paymentValidation: PaymentValidationService,
    private paymentNotification: PaymentNotificationService,
    private paymentLogging: PaymentLoggingService,
  ) {}

  async processPayment(userId: string, data: ProcessPaymentDto) {
    // Get order and validate ownership
    const order = await this.ordersService.findOne(data.orderId);
    if (order.userId !== userId) {
      throw new BadRequestException('Unauthorized to process this payment');
    }

    // Validate payment amount matches order total
    if (!this.paymentValidation.validatePaymentAmount(order.total, data.amount)) {
      throw new BadRequestException('Payment amount does not match order total');
    }

    // Log payment attempt
    await this.paymentLogging.logPaymentAttempt({
      orderId: data.orderId,
      userId,
      amount: data.amount,
      currency: data.currency,
      method: data.method,
      status: 'INITIATED'
    });

    try {
      // Send pending notification
      await this.paymentNotification.sendPaymentPendingNotification(userId, {
        orderId: data.orderId,
        amount: data.amount,
        currency: data.currency,
        method: data.method
      });

      // Process payment based on method
      let paymentResult;
      if (data.method === PaymentMethod.CARD) {
        const validation = this.paymentValidation.validateCardDetails(data.details);
        if (!validation.valid) {
          throw new BadRequestException(validation.error);
        }
        paymentResult = await this.paymentProcessor.processCardPayment(data.details);
      } else if (data.method === PaymentMethod.MOBILE_MONEY) {
        const validation = this.paymentValidation.validateMobileMoneyDetails(data.details);
        if (!validation.valid) {
          throw new BadRequestException(validation.error);
        }
        paymentResult = await this.paymentProcessor.processMobileMoneyPayment(data.details);
      } else {
        throw new BadRequestException('Unsupported payment method');
      }

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Payment processing failed');
      }

      // Update order status
      await this.ordersService.updateStatus(data.orderId, OrderStatus.COMPLETED);

      // Log successful payment
      await this.paymentLogging.logPaymentAttempt({
        orderId: data.orderId,
        userId,
        amount: data.amount,
        currency: data.currency,
        method: data.method,
        status: 'SUCCESS',
        transactionId: paymentResult.transactionId
      });

      // Send success notification
      await this.paymentNotification.sendPaymentSuccessNotification(userId, {
        orderId: data.orderId,
        amount: data.amount,
        currency: data.currency,
        method: data.method,
        transactionId: paymentResult.transactionId
      });

      return {
        success: true,
        transactionId: paymentResult.transactionId
      };
    } catch (error) {
      // Update order status
      await this.ordersService.updateStatus(data.orderId, OrderStatus.CANCELLED);

      // Log failed payment
      await this.paymentLogging.logPaymentAttempt({
        orderId: data.orderId,
        userId,
        amount: data.amount,
        currency: data.currency,
        method: data.method,
        status: 'FAILED',
        error: error.message
      });

      // Send failure notification
      await this.paymentNotification.sendPaymentFailureNotification(userId, {
        orderId: data.orderId,
        amount: data.amount,
        currency: data.currency,
        method: data.method,
        error: error.message
      });

      throw error;
    }
  }
}