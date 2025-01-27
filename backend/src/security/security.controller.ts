import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Query,
  Ip,
  HttpStatus,
} from '@nestjs/common';
import { SecurityService } from './security.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { VerifyRecaptchaDto, ReportActivityDto } from './dto/security.dto';
import { Throttle } from '@nestjs/throttler';

@ApiTags('security')
@Controller('security')
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Post('recaptcha')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Verify reCAPTCHA token' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Token verified successfully' })
  async verifyRecaptcha(@Body() data: VerifyRecaptchaDto) {
    const isValid = await this.securityService.verifyRecaptcha(data.token);
    return { success: isValid };
  }

  @Post('report')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Report suspicious activity' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Activity reported successfully' })
  async reportActivity(@Body() data: ReportActivityDto, @Ip() ip: string) {
    await this.securityService.logSecurityEvent({
      ...data,
      ip,
    });
    return { success: true };
  }

  @Get('logs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get security logs (admin only)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns security logs' })
  async getSecurityLogs(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('severity') severity?: 'LOW' | 'MEDIUM' | 'HIGH',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.securityService.getSecurityLogs({
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      severity,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('blocked-ips')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get blocked IPs (admin only)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns blocked IPs' })
  async getBlockedIPs() {
    return this.securityService.getBlockedIPs();
  }
}