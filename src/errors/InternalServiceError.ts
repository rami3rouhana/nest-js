import BaseError from './BaseError';

export default class InternalServerError extends BaseError {
  constructor(message = 'Internal server error') {
    super('InternalServerError', 500, message);
  }
}
