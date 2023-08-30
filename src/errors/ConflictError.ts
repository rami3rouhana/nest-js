import BaseError from './BaseError';

export default class ConflictError extends BaseError {
  constructor(message = 'Conflict occurred') {
    super('ConflictError', 409, message);
  }
}
