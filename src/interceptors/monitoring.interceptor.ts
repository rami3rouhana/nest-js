import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CustomLoggerService } from 'src/services/custom-logger.service';

@Injectable()
export class MonitoringInterceptor implements NestInterceptor {
  constructor(private readonly customLogger: CustomLoggerService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const elapsedTime = Date.now() - now;
        this.customLogger.log(`${elapsedTime}ms`, `Process Elapsed Time`);
      }),
    );
  }
}
