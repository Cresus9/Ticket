import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SecurityService } from '../security.service';

@Injectable()
export class SecurityInterceptor implements NestInterceptor {
  constructor(private securityService: SecurityService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip, user } = request;

    return next.handle().pipe(
      tap({
        next: () => {
          // Log successful requests
          this.securityService.logSecurityEvent({
            action: `${method} ${url}`,
            ip,
            userId: user?.id,
            details: 'Successful request',
            severity: 'LOW',
          });
        },
        error: (error) => {
          // Log errors
          const severity = error instanceof HttpException && error.getStatus() < HttpStatus.INTERNAL_SERVER_ERROR
            ? 'MEDIUM'
            : 'HIGH';

          this.securityService.logSecurityEvent({
            action: `${method} ${url}`,
            ip,
            userId: user?.id,
            details: `Error: ${error.message}`,
            severity,
          });
        },
      }),
    );
  }
}