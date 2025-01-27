import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { EventsModule } from '../events/events.module';
import { OrdersModule } from '../orders/orders.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    EventsModule,
    OrdersModule,
    CacheModule.register({
      ttl: 300, // Cache for 5 minutes
    }),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}