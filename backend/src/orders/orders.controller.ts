import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
  HttpStatus,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Role, OrderStatus } from '@prisma/client';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Order created successfully' })
  async create(@Request() req: any, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(req.user.id, createOrderDto);
  }

  @Get('user')
  @ApiOperation({ summary: 'Get current user orders' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return user orders' })
  async getUserOrders(@Request() req: any) {
    return this.ordersService.getUserOrders(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return the order' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found' })
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Order status updated' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus
  ) {
    return this.ordersService.updateStatus(id, status);
  }
}