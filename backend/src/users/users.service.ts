import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getDashboardData(userId: string) {
    const now = new Date();
    
    const [upcomingEvents, totalTickets, totalSpent, recentOrders] = await Promise.all([
      // Get upcoming events count - only events that are in the future
      this.prisma.ticket.count({
        where: {
          userId,
          event: {
            date: {
              gt: now // Only future events
            },
            status: 'PUBLISHED' // Only published events
          },
          status: 'VALID' // Only valid tickets
        }
      }),

      // Get total tickets
      this.prisma.ticket.count({
        where: {
          userId,
          status: 'VALID'
        }
      }),

      // Get total spent
      this.prisma.order.aggregate({
        where: {
          userId,
          status: 'COMPLETED'
        },
        _sum: {
          total: true
        }
      }),

      // Get recent orders with event details
      this.prisma.order.findMany({
        where: {
          userId
        },
        select: {
          id: true,
          total: true,
          status: true,
          createdAt: true,
          event: {
            select: {
              title: true,
              date: true,
              time: true,
              location: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      })
    ]);

    return {
      stats: {
        upcomingEvents,
        totalTickets,
        totalSpent: totalSpent._sum.total || 0
      },
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        eventName: order.event.title,
        total: order.total,
        status: order.status,
        date: order.event.date,
        time: order.event.time,
        location: order.event.location
      }))
    };
  }
}