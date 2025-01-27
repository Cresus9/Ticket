import { Controller, Get } from '@nestjs/common';
import { PrometheusController } from '@willsoto/nestjs-prometheus';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('monitoring')
@Controller('metrics')
export class MetricsController extends PrometheusController {
  @Get()
  @ApiOperation({ summary: 'Get application metrics' })
  getMetrics() {
    return super.index();
  }
}