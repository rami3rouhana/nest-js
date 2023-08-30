import BaseError from './BaseError';

export default class CSRFTokenError extends BaseError {
  constructor(message = 'CSRF token mismatch') {
    super('CSRFTokenError', 401, message);
  }
}
