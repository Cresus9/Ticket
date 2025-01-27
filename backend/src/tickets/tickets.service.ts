import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventStatus } from '@prisma/client';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async validateTickets(eventId: string, tickets: { [key: string]: number }) {
    // Verify event exists
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        ticketTypes: true
      }
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check if event is published
    if (event.status !== EventStatus.PUBLISHED) {
      throw new BadRequestException('Event is not available for booking');
    }

    // Validate each ticket type
    for (const [ticketTypeId, quantity] of Object.entries(tickets)) {
      const ticketType = event.ticketTypes.find(t => t.id === ticketTypeId);
      
      if (!ticketType) {
        throw new NotFoundException(`Ticket type ${ticketTypeId} not found`);
      }

      if (ticketType.available < quantity) {
        throw new BadRequestException(`Not enough tickets available for ${ticketType.name}`);
      }

      if (quantity > ticketType.maxPerOrder) {
        throw new BadRequestException(`Maximum ${ticketType.maxPerOrder} tickets allowed per order for ${ticketType.name}`);
      }
    }

    return {
      available: true,
      event: {
        id: event.id,
        title: event.title,
        ticketTypes: event.ticketTypes.map(type => ({
          id: type.id,
          name: type.name,
          available: type.available,
          maxPerOrder: type.maxPerOrder
        }))
      }
    };
  }
}