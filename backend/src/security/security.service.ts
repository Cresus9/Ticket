import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import axios from 'axios';

@Injectable()
export class SecurityService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async verifyRecaptcha(token: string): Promise<boolean> {
    try {
      const secretKey = this.configService.get<string>('RECAPTCHA_SECRET_KEY');
      const response = await axios.post(
        'https://www.google.com/recaptcha/api/siteverify',
        null,
        {
          params: {
            secret: secretKey,
            response: token,
          },
        },
      );
      return response.data.success;
    } catch (error) {
      console.error('reCAPTCHA verification error:', error);
      return false;
    }
  }

  async logSecurityEvent(data: {
    action: string;
    ip: string;
    userId?: string;
    details: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
  }) {
    return this.prisma.securityLog.create({
      data: {
        action: data.action,
        ip: data.ip,
        userId: data.userId,
        details: data.details,
        severity: data.severity,
      },
    });
  }

  async blockIP(ip: string, reason: string, duration: number) {
    const expiresAt = new Date(Date.now() + duration * 60 * 1000); // duration in minutes
    return this.prisma.blockedIP.create({
      data: {
        ip,
        reason,
        expiresAt,
      },
    });
  }

  async isIPBlocked(ip: string): Promise<boolean> {
    const blockedIP = await this.prisma.blockedIP.findFirst({
      where: {
        ip,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
    return !!blockedIP;
  }

  async getSecurityLogs(params: {
    skip?: number;
    take?: number;
    severity?: 'LOW' | 'MEDIUM' | 'HIGH';
    startDate?: Date;
    endDate?: Date;
  }) {
    return this.prisma.securityLog.findMany({
      where: {
        severity: params.severity,
        createdAt: {
          gte: params.startDate,
          lte: params.endDate,
        },
      },
      skip: params.skip,
      take: params.take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async getBlockedIPs() {
    return this.prisma.blockedIP.findMany({
      where: {
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  validatePassword(password: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
}