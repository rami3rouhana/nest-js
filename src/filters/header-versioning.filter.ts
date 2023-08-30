import {
  Injectable,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

export interface CustomRequest extends Request {
  apiVersion?: string;
}

@Injectable()
export class HeaderVersioningFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<CustomRequest>();
    const response = ctx.getResponse<Response>();
    const apiVersion = Array.isArray(request.headers['x-api-version'])
      ? request.headers['x-api-version'][0]
      : request.headers['x-api-version'];

    if (!apiVersion) {
      response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'API version is required in the X-API-Version header',
      });
      return;
    }

    // Attach the version information to the request object
    request.apiVersion = apiVersion;

    // Continue with the next middleware or request handler
    const status = exception.getStatus
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    response.status(status).json(exception.getResponse());
  }
}
