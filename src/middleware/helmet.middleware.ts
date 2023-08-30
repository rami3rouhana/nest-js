import { Injectable, NestMiddleware } from '@nestjs/common';
import helmet from 'helmet';
import { IncomingMessage, ServerResponse } from 'http';

@Injectable()
export class HelmetMiddleware implements NestMiddleware {
  use(
    req: IncomingMessage,
    res: ServerResponse<IncomingMessage>,
    next: () => void,
  ) {
    helmet()(req, res, next);
  }
}
