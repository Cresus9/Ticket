import { Module } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { MetricsController } from './metrics.controller';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
      },
    }),
  ],
  controllers: [MetricsController],
  providers: [
    MonitoringService,
    {
      provide: 'http_requests_total',
      useFactory: () => new PrometheusModule.client.Counter({
        name: 'http_requests_total',
        help: 'Total number of HTTP requests',
        labelNames: ['method', 'path', 'status_code']
      })
    },
    {
      provide: 'active_users_total',
      useFactory: () => new PrometheusModule.client.Gauge({
        name: 'active_users_total',
        help: 'Total number of active users'
      })
    },
    {
      provide: 'ticket_sales_total',
      useFactory: () => new PrometheusModule.client.Counter({
        name: 'ticket_sales_total',
        help: 'Total number of tickets sold',
        labelNames: ['event_id', 'ticket_type']
      })
    },
    {
      provide: 'event_capacity_usage',
      useFactory: () => new PrometheusModule.client.Gauge({
        name: 'event_capacity_usage',
        help: 'Event capacity usage percentage',
        labelNames: ['event_id']
      })
    }
  ],
  exports: [MonitoringService]
})
export class MonitoringModule {}