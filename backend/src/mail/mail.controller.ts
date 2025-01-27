import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { MailService } from './mail.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('mail')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('test-welcome')
  @ApiOperation({ summary: 'Send test welcome email' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Email sent successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid email' })
  async sendTestWelcomeEmail(@Body() data: { email: string; name: string }) {
    if (!data.email || !data.name) {
      throw new HttpException('Email and name are required', HttpStatus.BAD_REQUEST);
    }

    try {
      console.log('Sending test welcome email to:', data.email);
      await this.mailService.sendWelcomeEmail(data.email, { name: data.name });
      console.log('Welcome email sent successfully to:', data.email);
      return { success: true, message: 'Welcome email sent successfully' };
    } catch (error) {
      console.error('Failed to send test welcome email:', error);
      throw new HttpException(
        error.message || 'Failed to send welcome email',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('test-newsletter')
  @ApiOperation({ summary: 'Send test newsletter confirmation email' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Email sent successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid email' })
  async sendTestNewsletterConfirmation(@Body('email') email: string) {
    if (!email) {
      throw new HttpException('Email is required', HttpStatus.BAD_REQUEST);
    }

    try {
      console.log('Sending test newsletter confirmation to:', email);
      await this.mailService.sendNewsletterConfirmation(email);
      console.log('Newsletter confirmation sent successfully to:', email);
      return { success: true, message: 'Newsletter confirmation email sent successfully' };
    } catch (error) {
      console.error('Failed to send test newsletter confirmation:', error);
      throw new HttpException(
        error.message || 'Failed to send confirmation email',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}