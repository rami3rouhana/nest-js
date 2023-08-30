import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { CustomLoggerService } from 'src/services/custom-logger.service';

@Injectable()
export class SwaggerInterceptor implements NestInterceptor {
  constructor(private readonly customLogger: CustomLoggerService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const controller = context.getClass();
    const method = context.getHandler();

    this.customLogger.log(controller.name, 'Controller');
    this.customLogger.log(method.name, 'Method');

    return next.handle();
  }
}
