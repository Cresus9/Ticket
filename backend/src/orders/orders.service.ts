import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus, TicketStatus } from '@prisma/client';
import { createHash } from 'crypto';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private eventsService: EventsService,
    private notificationsService: NotificationsService,
  ) {}

  async create(userId: string, data: CreateOrderDto) {
    // Verify event exists and get ticket types
    const event = await this.eventsService.findOne(data.eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Calculate total and verify ticket availability
    let total = 0;
    const ticketTypes = await Promise.all(
      data.tickets.map(async (ticket) => {
        const ticketType = await this.prisma.ticketType.findUnique({
          where: { id: ticket.ticketTypeId }
        });

        if (!ticketType) {
          throw new NotFoundException(`Ticket type ${ticket.ticketTypeId} not found`);
        }

        if (ticketType.available < ticket.quantity) {
          throw new BadRequestException(`Not enough tickets available for ${ticketType.name}`);
        }

        if (ticket.quantity > ticketType.maxPerOrder) {
          throw new BadRequestException(`Maximum ${ticketType.maxPerOrder} tickets allowed per order for ${ticketType.name}`);
        }

        total += ticketType.price * ticket.quantity;
        return ticketType;
      })
    );

    // Create order and tickets in a transaction
    return this.prisma.$transaction(async (prisma) => {
      // Create order
      const order = await prisma.order.create({
        data: {
          userId,
          eventId: data.eventId,
          total,
          status: OrderStatus.PENDING,
          paymentMethod: data.paymentMethod,
        }
      });

      // Create tickets
      for (let i = 0; i < data.tickets.length; i++) {
        const ticketData = data.tickets[i];
        const ticketType = ticketTypes[i];

        for (let j = 0; j < ticketData.quantity; j++) {
          await prisma.ticket.create({
            data: {
              orderId: order.id,
              eventId: data.eventId,
              userId,
              ticketTypeId: ticketData.ticketTypeId,
              name: ticketType.name,
              description: ticketType.description,
              price: ticketType.price,
              status: TicketStatus.VALID,
              qrCode: this.generateQRCode(order.id, ticketType.id, j),
              available: ticketType.available,
              maxPerOrder: ticketType.maxPerOrder
            }
          });
        }

        // Update ticket availability
        await prisma.ticketType.update({
          where: { id: ticketData.ticketTypeId },
          data: {
            available: {
              decrement: ticketData.quantity
            }
          }
        });
      }

      // Send notification
      await this.notificationsService.create({
        userId,
        type: 'ORDER_CREATED',
        title: 'Order Created',
        message: `Your order for ${event.title} has been created. Please complete the payment.`,
        metadata: {
          orderId: order.id,
          eventId: data.eventId,
          total,
          currency: event.currency
        }
      });

      return order;
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        tickets: {
          include: {
            ticketType: true
          }
        },
        event: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async getUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        tickets: {
          include: {
            ticketType: true
          }
        },
        event: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateStatus(id: string, status: OrderStatus) {
    const order = await this.findOne(id);

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: { status }
    });

    // Send notification
    await this.notificationsService.create({
      userId: order.userId,
      type: status === OrderStatus.COMPLETED ? 'ORDER_COMPLETED' : 'ORDER_CANCELLED',
      title: status === OrderStatus.COMPLETED ? 'Order Completed' : 'Order Cancelled',
      message: status === OrderStatus.COMPLETED 
        ? 'Your order has been completed successfully.'
        : 'Your order has been cancelled.',
      metadata: { orderId: id }
    });

    return updatedOrder;
  }

  private generateQRCode(orderId: string, ticketTypeId: string, index: number): string {
    const payload = {
      orderId,
      ticketTypeId,
      index,
      timestamp: Date.now()
    };

    return createHash('sha256')
      .update(JSON.stringify(payload))
      .digest('hex');
  }
}