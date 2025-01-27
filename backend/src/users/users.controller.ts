import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('users')
@Controller('api/users')  // Added 'api' prefix
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get user dashboard data' })
  @ApiResponse({ status: 200, description: 'Returns user dashboard data' })
  async getDashboard(@Request() req: any) {
    return this.usersService.getDashboardData(req.user.id);
  }
}