import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { doubleCsrf } from 'csrf-csrf';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { generateToken } = doubleCsrf({
      getSecret: () => this.configService.get<string>('CSRF_SECERT'),
      cookieName: 'x-csrf-token',
    });
    cookieParser()(req, res, (err) => {
      if (err) {
        throw err;
      }

      // Check for CSRF token in the header
      const csrfTokenInHeader = req.headers['x-csrf-token'];

      // Check for CSRF token in cookie
      const csrfTokenInCookie = req.cookies['x-csrf-token'];

      if (req.method === 'GET') {
        if (!csrfTokenInCookie) {
          const newCsrfToken = generateToken(req, res);
          res.setHeader('x-csrf-token', newCsrfToken);
        } else {
          const [token] = csrfTokenInCookie.split('|');
          res.setHeader('x-csrf-token', token);
        }
        next();
      } else if (csrfTokenInCookie && csrfTokenInHeader) {
        // For non-GET requests, validate the token in the header against the cookie
        const [token] = csrfTokenInCookie.split('|');
        if (token !== csrfTokenInHeader) {
          res.status(403).send('Invalid CSRF token');
          return;
        }
        res.setHeader('x-csrf-token', token);
        next();
      } else if (!csrfTokenInCookie) {
        const newCsrfToken = generateToken(req, res);
        res.setHeader('x-csrf-token', newCsrfToken);
        next();
      } else {
        res.status(403).send('Missing CSRF token in header');
        return;
      }
    });
  }
}
