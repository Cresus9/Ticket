import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  HttpStatus
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HttpCacheInterceptor } from '../cache/interceptors/cache.interceptor';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@UseInterceptors(HttpCacheInterceptor)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard analytics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns dashboard analytics data' })
  getDashboardStats() {
    return this.analyticsService.getDashboardStats();
  }

  @Get('events/:id')
  @ApiOperation({ summary: 'Get analytics for specific event' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns event analytics data' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Event not found' })
  getEventAnalytics(@Param('id') id: string) {
    return this.analyticsService.getEventAnalytics(id);
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue analytics by period' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns revenue analytics data' })
  getRevenueAnalytics(
    @Query('period') period: 'daily' | 'weekly' | 'monthly' = 'monthly'
  ) {
    return this.analyticsService.getRevenueAnalytics(period);
  }
}