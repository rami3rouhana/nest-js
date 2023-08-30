import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class HeaderVersioningMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const apiVersion = Array.isArray(req.headers['x-api-version'])
      ? req.headers['x-api-version'][0]
      : req.headers['x-api-version'];

    if (!apiVersion) {
      res.status(400).json({
        statusCode: 400,
        message: 'API version is required in the X-API-Version header',
      });
      return;
    }

    // Attach the version information to the request object
    (req as any).apiVersion = apiVersion;

    next();
  }
}
