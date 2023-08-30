import BaseError from './BaseError';

export default class AuthorizationError extends BaseError {
  constructor(message = 'Authorization denied') {
    super('AuthorizationError', 403, message);
  }
}
