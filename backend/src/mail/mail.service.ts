import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as formData from 'form-data';
import * as Mailgun from 'mailgun.js';
import { templates } from './templates';

@Injectable()
export class MailService {
  private mailgun: any;
  private domain: string;
  private from: string;

  constructor(private configService: ConfigService) {
    const mailgun = new Mailgun(formData);
    this.mailgun = mailgun.client({
      username: 'api',
      key: this.configService.get('MAILGUN_API_KEY')
    });
    this.domain = this.configService.get('MAILGUN_DOMAIN');
    this.from = this.configService.get('SMTP_FROM');
  }

  async sendWelcomeEmail(email: string, data: { name: string }): Promise<void> {
    const template = templates.welcome(data);
    
    try {
      console.log('Attempting to send welcome email to:', email);
      console.log('Using Mailgun configuration:', {
        domain: this.domain,
        from: this.from,
        apiKey: this.configService.get('MAILGUN_API_KEY')?.substring(0, 8) + '...'
      });
      
      const response = await this.mailgun.messages.create(this.domain, {
        from: this.from,
        to: email,
        subject: template.subject,
        html: template.html
      });
      
      console.log('Welcome email sent successfully:', {
        messageId: response.id,
        status: response.status
      });
    } catch (error) {
      console.error('Failed to send welcome email:', {
        error,
        email,
        mailgun: {
          domain: this.domain,
          from: this.from
        }
      });
      throw error;
    }
  }

  async sendNewsletterConfirmation(email: string): Promise<void> {
    const template = templates.newsletterConfirmation(email);
    
    try {
      console.log('Attempting to send newsletter confirmation to:', email);
      
      const response = await this.mailgun.messages.create(this.domain, {
        from: this.from,
        to: email,
        subject: template.subject,
        html: template.html
      });
      
      console.log('Newsletter confirmation sent successfully:', {
        messageId: response.id,
        status: response.status
      });
    } catch (error) {
      console.error('Failed to send newsletter confirmation:', {
        error,
        email,
        mailgun: {
          domain: this.domain,
          from: this.from
        }
      });
      throw error;
    }
  }

  async sendNotificationEmail(email: string, subject: string, message: string): Promise<void> {
    try {
      await this.mailgun.messages.create(this.domain, {
        from: this.from,
        to: email,
        subject: subject,
        html: message
      });
    } catch (error) {
      console.error('Failed to send notification email:', error);
      throw error;
    }
  }
}