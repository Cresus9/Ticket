import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { EventStatus, OrderStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async getDashboardStats() {
    const cacheKey = 'dashboard_stats';
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const [
      totalUsers,
      totalEvents,
      totalRevenue,
      ticketsSold,
      recentOrders,
      userGrowth,
      salesByCategory,
      topEvents
    ] = await Promise.all([
      this.getTotalUsers(),
      this.getTotalEvents(),
      this.getTotalRevenue(),
      this.getTicketsSold(),
      this.getRecentOrders(),
      this.getUserGrowth(),
      this.getSalesByCategory(),
      this.getTopEvents()
    ]);

    const stats = {
      totalUsers,
      totalEvents,
      totalRevenue,
      ticketsSold,
      recentOrders,
      userGrowth,
      salesByCategory,
      topEvents
    };

    await this.cacheManager.set(cacheKey, stats, 300); // Cache for 5 minutes
    return stats;
  }

  async getEventAnalytics(eventId: string) {
    const cacheKey = `event_analytics_${eventId}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const [event, sales, tickets, revenue] = await Promise.all([
      this.prisma.event.findUnique({ where: { id: eventId } }),
      this.getEventSales(eventId),
      this.getEventTickets(eventId),
      this.getEventRevenue(eventId)
    ]);

    const analytics = {
      event,
      sales,
      tickets,
      revenue
    };

    await this.cacheManager.set(cacheKey, analytics, 300);
    return analytics;
  }

  async getRevenueAnalytics(period: 'daily' | 'weekly' | 'monthly') {
    const cacheKey = `revenue_analytics_${period}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const startDate = this.getStartDate(period);
    const revenue = await this.prisma.order.groupBy({
      by: ['createdAt'],
      where: {
        status: OrderStatus.COMPLETED,
        createdAt: {
          gte: startDate
        }
      },
      _sum: {
        total: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    await this.cacheManager.set(cacheKey, revenue, 300);
    return revenue;
  }

  private async getTotalUsers() {
    return this.prisma.user.count();
  }

  private async getTotalEvents() {
    return this.prisma.event.count({
      where: {
        status: EventStatus.PUBLISHED
      }
    });
  }

  private async getTotalRevenue() {
    const result = await this.prisma.order.aggregate({
      where: {
        status: OrderStatus.COMPLETED
      },
      _sum: {
        total: true
      }
    });
    return result._sum.total || 0;
  }

  private async getTicketsSold() {
    return this.prisma.ticket.count();
  }

  private async getRecentOrders(limit = 10) {
    return this.prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        event: {
          select: {
            title: true
          }
        }
      }
    });
  }

  private async getUserGrowth() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      _count: true,
      orderBy: {
        createdAt: 'asc'
      }
    });
  }

  private async getSalesByCategory() {
    return this.prisma.event.groupBy({
      by: ['categories'],
      where: {
        status: EventStatus.PUBLISHED
      },
      _sum: {
        ticketsSold: true
      }
    });
  }

  private async getTopEvents(limit = 5) {
    return this.prisma.event.findMany({
      take: limit,
      where: {
        status: EventStatus.PUBLISHED
      },
      orderBy: {
        ticketsSold: 'desc'
      },
      include: {
        _count: {
          select: {
            tickets: true,
            orders: true
          }
        }
      }
    });
  }

  private async getEventSales(eventId: string) {
    return this.prisma.order.groupBy({
      by: ['createdAt'],
      where: {
        eventId,
        status: OrderStatus.COMPLETED
      },
      _count: true,
      _sum: {
        total: true
      }
    });
  }

  private async getEventTickets(eventId: string) {
    return this.prisma.ticket.groupBy({
      by: ['status', 'ticketTypeId'],
      where: {
        eventId
      },
      _count: true
    });
  }

  private async getEventRevenue(eventId: string) {
    return this.prisma.order.aggregate({
      where: {
        eventId,
        status: OrderStatus.COMPLETED
      },
      _sum: {
        total: true
      }
    });
  }

  private getStartDate(period: 'daily' | 'weekly' | 'monthly'): Date {
    const date = new Date();
    switch (period) {
      case 'daily':
        date.setDate(date.getDate() - 30); // Last 30 days
        break;
      case 'weekly':
        date.setDate(date.getDate() - 90); // Last 90 days
        break;
      case 'monthly':
        date.setFullYear(date.getFullYear() - 1); // Last 12 months
        break;
    }
    return date;
  }
}