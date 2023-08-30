import { Injectable, NestMiddleware } from '@nestjs/common';
import * as csurf from 'csurf';
import * as cookieParser from 'cookie-parser';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    cookieParser()(req, res, (err) => {
      if (err) {
        throw err;
      }
      csurf({
        cookie: {
          key: '_csrf', // the name of the cookie
          path: '/', // the path for which the cookie is set
          httpOnly: true, // whether the cookie is only accessible by the server
          secure: process.env.NODE_ENV === 'production', // whether the cookie can only be sent over HTTPS
          ignoreMethods: ['GET'], // ignore CSRF protection for these methods
          maxAge: 1000 * 60 * 60, // set the expiry time for the cookie
          disableQuery: true, // will not be read from the query string
          sameSite: 'strict', // or 'lax' or 'none'
        },
      })(req, res, (csrfErr) => {
        if (csrfErr) {
          if (csrfErr.code === 'EBADCSRFTOKEN') {
            res.status(403).send('Invalid CSRF token');
            return;
          }
          throw csrfErr;
        }
        next();
      });
    });
  }
}
