import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationPreferenceService } from './services/preference.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { SavePushTokenDto } from './dto/save-push-token.dto';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly preferenceService: NotificationPreferenceService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns user notifications' })
  async getUserNotifications(
    @Request() req: any,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('type') type?: NotificationType,
    @Query('read') read?: boolean,
  ) {
    return this.notificationsService.getUserNotifications(req.user.id, {
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      type,
      read,
    });
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Notification marked as read' })
  async markAsRead(@Request() req: any, @Param('id') id: string) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Put('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: HttpStatus.OK, description: 'All notifications marked as read' })
  async markAllAsRead(@Request() req: any) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get notification preferences' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns notification preferences' })
  async getPreferences(@Request() req: any) {
    return this.preferenceService.getUserPreferences(req.user.id);
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Update notification preferences' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Preferences updated successfully' })
  async updatePreferences(
    @Request() req: any,
    @Body() updatePreferencesDto: UpdatePreferencesDto
  ) {
    return this.preferenceService.updatePreferences(req.user.id, updatePreferencesDto);
  }

  @Post('push-token')
  @ApiOperation({ summary: 'Save push notification token' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Token saved successfully' })
  async savePushToken(
    @Request() req: any,
    @Body() savePushTokenDto: SavePushTokenDto
  ) {
    return this.notificationsService.savePushToken(
      req.user.id,
      savePushTokenDto.token,
      savePushTokenDto.device
    );
  }

  @Delete('push-token/:token')
  @ApiOperation({ summary: 'Remove push notification token' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Token removed successfully' })
  async removePushToken(@Param('token') token: string) {
    return this.notificationsService.removePushToken(token);
  }
}