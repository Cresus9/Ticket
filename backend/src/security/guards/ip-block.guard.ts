import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { SecurityService } from '../security.service';

@Injectable()
export class IPBlockGuard implements CanActivate {
  constructor(private securityService: SecurityService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip;

    const isBlocked = await this.securityService.isIPBlocked(ip);
    return !isBlocked;
  }
}