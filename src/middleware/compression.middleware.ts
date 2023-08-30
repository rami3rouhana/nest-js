import { Injectable, NestMiddleware } from '@nestjs/common';
import * as compression from 'compression';

@Injectable()
export class CompressionMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    compression()(req, res, next);
  }
}
