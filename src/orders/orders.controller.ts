import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { OrderService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  async create(@Request() req: any, @Body() createOrderDto: any) {
    return this.ordersService.createOrder({
      userId: req.user.id,
      ...createOrderDto
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders' })
  async getOrders(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.ordersService.getOrders({
      status,
      startDate,
      endDate,
      page,
      limit
    });
  }

  @Get('user')
  @ApiOperation({ summary: 'Get current user orders' })
  async getUserOrders(@Request() req: any) {
    return this.ordersService.getUserOrders(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by id' })
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string
  ) {
    return this.ordersService.updateStatus(id, status);
  }
}