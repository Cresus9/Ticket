import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MonitoringService } from '../monitoring.service';

@Injectable()
export class MonitoringInterceptor implements NestInterceptor {
  constructor(private readonly monitoringService: MonitoringService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;

    return next.handle().pipe(
      tap({
        next: () => {
          const statusCode = context.switchToHttp().getResponse().statusCode;
          this.monitoringService.incrementRequestCount(method, url, statusCode);
        },
        error: (error) => {
          const statusCode = error.status || 500;
          this.monitoringService.incrementRequestCount(method, url, statusCode);
        },
      })
    );
  }
}