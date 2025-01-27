import { ApiProperty } from '@nestjs/swagger';

export class DashboardStatsDto {
  @ApiProperty()
  totalUsers: number;

  @ApiProperty()
  totalEvents: number;

  @ApiProperty()
  totalRevenue: number;

  @ApiProperty()
  ticketsSold: number;

  @ApiProperty({ type: [Object] })
  recentOrders: any[];

  @ApiProperty({ type: [Object] })
  userGrowth: any[];

  @ApiProperty({ type: [Object] })
  salesByCategory: any[];

  @ApiProperty({ type: [Object] })
  topEvents: any[];
}

export class EventAnalyticsDto {
  @ApiProperty()
  event: any;

  @ApiProperty({ type: [Object] })
  sales: any[];

  @ApiProperty({ type: [Object] })
  tickets: any[];

  @ApiProperty()
  revenue: number;
}

export class RevenueAnalyticsDto {
  @ApiProperty()
  date: Date;

  @ApiProperty()
  revenue: number;

  @ApiProperty()
  count: number;
}