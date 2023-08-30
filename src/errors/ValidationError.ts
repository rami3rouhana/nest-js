import BaseError from './BaseError';

export class ValidationError extends BaseError {
  constructor(message: string) {
    super('ValidationError', 400, message);
  }
}
