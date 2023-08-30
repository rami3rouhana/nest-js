import BaseError from './BaseError';

export default class AuthenticationError extends BaseError {
  constructor(message = 'Authentication failed') {
    super('AuthenticationError', 401, message);
  }
}
