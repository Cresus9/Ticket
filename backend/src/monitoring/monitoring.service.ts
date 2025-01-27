import { Injectable, Inject } from '@nestjs/common';
import { Counter, Gauge } from 'prom-client';

@Injectable()
export class MonitoringService {
  constructor(
    @Inject('http_requests_total')
    private readonly requestsTotal: Counter<string>,
    @Inject('active_users_total')
    private readonly activeUsers: Gauge<string>,
    @Inject('ticket_sales_total')
    private readonly ticketSales: Counter<string>,
    @Inject('event_capacity_usage')
    private readonly eventCapacity: Gauge<string>
  ) {}

  incrementRequestCount(method: string, path: string, statusCode: number) {
    this.requestsTotal.labels(method, path, statusCode.toString()).inc();
  }

  setActiveUsers(count: number) {
    this.activeUsers.set(count);
  }

  recordTicketSale(eventId: string, ticketType: string, quantity: number) {
    this.ticketSales.labels(eventId, ticketType).inc(quantity);
  }

  updateEventCapacity(eventId: string, usedCapacity: number, totalCapacity: number) {
    const usage = (usedCapacity / totalCapacity) * 100;
    this.eventCapacity.labels(eventId).set(usage);
  }
}