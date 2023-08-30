import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CustomLoggerService } from '../services/custom-logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly customLogger: CustomLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.url;
    const now = Date.now();

    this.customLogger.log(`${method} ${url}`, `Request`);

    return next.handle().pipe(
      tap(() => {
        this.customLogger.log(
          `${method} ${url} - Time: ${Date.now() - now}ms`,
          `Response`,
        );
      }),
    );
  }
}
