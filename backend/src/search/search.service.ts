import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { SearchEventsDto } from './dto/search-events.dto';
import { EventStatus, Prisma } from '@prisma/client';

@Injectable()
export class SearchService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async searchEvents(params: SearchEventsDto) {
    const cacheKey = `search:${JSON.stringify(params)}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const where: Prisma.EventWhereInput = {
      status: EventStatus.PUBLISHED,
      AND: [],
    };

    // Full-text search on title and description
    if (params.query) {
      where.AND.push({
        OR: [
          { title: { contains: params.query, mode: 'insensitive' } },
          { description: { contains: params.query, mode: 'insensitive' } },
        ],
      });
    }

    // Date range filter
    if (params.startDate || params.endDate) {
      where.AND.push({
        date: {
          gte: params.startDate ? new Date(params.startDate) : undefined,
          lte: params.endDate ? new Date(params.endDate) : undefined,
        },
      });
    }

    // Location filter
    if (params.location) {
      where.AND.push({
        location: { contains: params.location, mode: 'insensitive' },
      });
    }

    // Category filter
    if (params.category) {
      where.AND.push({
        categories: { has: params.category },
      });
    }

    // Price range filter
    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      where.AND.push({
        price: {
          gte: params.minPrice,
          lte: params.maxPrice,
        },
      });
    }

    const [results, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        include: {
          ticketTypes: true,
          _count: {
            select: {
              tickets: true,
              orders: true,
            },
          },
        },
        orderBy: this.getOrderBy(params.sortBy),
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      this.prisma.event.count({ where }),
    ]);

    const response = {
      results,
      total,
      page: params.page,
      totalPages: Math.ceil(total / params.limit),
    };

    await this.cacheManager.set(cacheKey, response, 300);
    return response;
  }

  async getSuggestions(query: string) {
    const cacheKey = `suggestions:${query}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const suggestions = await this.prisma.event.findMany({
      where: {
        status: EventStatus.PUBLISHED,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { location: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        title: true,
        location: true,
      },
      take: 5,
    });

    await this.cacheManager.set(cacheKey, suggestions, 300);
    return suggestions;
  }

  async getPopularSearches() {
    const cacheKey = 'popular-searches';
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const searches = await this.prisma.searchLog.groupBy({
      by: ['query'],
      _count: {
        query: true,
      },
      orderBy: {
        _count: {
          query: 'desc',
        },
      },
      take: 10,
    });

    await this.cacheManager.set(cacheKey, searches, 3600); // Cache for 1 hour
    return searches;
  }

  async logSearch(query: string, userId?: string) {
    await this.prisma.searchLog.create({
      data: {
        query,
        userId,
      },
    });
  }

  private getOrderBy(sortBy?: string): Prisma.EventOrderByWithRelationInput {
    switch (sortBy) {
      case 'price_asc':
        return { price: 'asc' };
      case 'price_desc':
        return { price: 'desc' };
      case 'date_asc':
        return { date: 'asc' };
      case 'date_desc':
        return { date: 'desc' };
      case 'popularity':
        return { ticketsSold: 'desc' };
      default:
        return { date: 'asc' };
    }
  }
}