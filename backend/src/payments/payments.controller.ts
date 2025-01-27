import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('process')
  @ApiOperation({ summary: 'Process payment for order' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Payment processed successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid payment details' })
  async processPayment(
    @Request() req: any,
    @Body() processPaymentDto: ProcessPaymentDto
  ) {
    try {
      return await this.paymentsService.processPayment(
        req.user.id,
        processPaymentDto
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}