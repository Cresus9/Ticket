import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { v4 as uuidv4 } from 'uuid';
import { Prisma, TicketStatus } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async getUserBookings(userId: string) {
    const bookings = await this.prisma.ticket.findMany({
      where: {
        userId,
      },
      include: {
        event: true,
        ticketType: true,
        order: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return bookings.map(booking => ({
      id: booking.id,
      eventName: booking.event.title,
      date: booking.event.date,
      time: booking.event.time,
      location: booking.event.location,
      status: this.getBookingStatus(booking.event.date),
      ticketType: booking.ticketType.name,
      price: booking.ticketType.price,
      currency: booking.event.currency,
      ticketId: booking.id,
      qrCode: booking.qrCode,
    }));
  }

  async createBooking(userId: string, createBookingDto: CreateBookingDto) {
    const event = await this.prisma.event.findUnique({
      where: { id: createBookingDto.eventId },
      include: { ticketTypes: true },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Calculate total and validate ticket availability
    let total = 0;
    for (const ticket of createBookingDto.tickets) {
      const ticketType = event.ticketTypes.find(t => t.id === ticket.ticketTypeId);
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
    }

    // Create order and tickets in a transaction
    return this.prisma.$transaction(async (prisma) => {
      // Create order
      const order = await prisma.order.create({
        data: {
          userId,
          eventId: event.id,
          total,
          status: 'PENDING',
          paymentMethod: createBookingDto.paymentMethod,
        },
      });

      // Create tickets
      const tickets = [];
      for (const ticketData of createBookingDto.tickets) {
        const ticketType = event.ticketTypes.find(t => t.id === ticketData.ticketTypeId)!;
        
        for (let i = 0; i < ticketData.quantity; i++) {
          const ticketCreateData: Prisma.TicketCreateInput = {
            order: { connect: { id: order.id } },
            event: { connect: { id: event.id } },
            user: { connect: { id: userId } },
            ticketType: { connect: { id: ticketData.ticketTypeId } },
            status: TicketStatus.VALID,
            qrCode: uuidv4(),
          };

          const ticket = await prisma.ticket.create({
            data: ticketCreateData,
          });
          tickets.push(ticket);
        }

        // Update ticket availability
        await prisma.ticketType.update({
          where: { id: ticketData.ticketTypeId },
          data: {
            available: {
              decrement: ticketData.quantity,
            },
          },
        });
      }

      // Update event tickets sold count
      await prisma.event.update({
        where: { id: event.id },
        data: {
          ticketsSold: {
            increment: tickets.length,
          },
        },
      });

      return { order, tickets };
    });
  }

  async getBooking(userId: string, bookingId: string) {
    const booking = await this.prisma.ticket.findFirst({
      where: {
        id: bookingId,
        userId,
      },
      include: {
        event: true,
        ticketType: true,
        order: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return {
      id: booking.id,
      eventName: booking.event.title,
      date: booking.event.date,
      time: booking.event.time,
      location: booking.event.location,
      status: this.getBookingStatus(booking.event.date),
      ticketType: booking.ticketType.name,
      price: booking.ticketType.price,
      currency: booking.event.currency,
      ticketId: booking.id,
      qrCode: booking.qrCode,
    };
  }

  private getBookingStatus(eventDate: Date): 'upcoming' | 'completed' | 'cancelled' {
    const now = new Date();
    const eventDateTime = new Date(eventDate);
    
    if (eventDateTime > now) {
      return 'upcoming';
    }
    return 'completed';
  }
}