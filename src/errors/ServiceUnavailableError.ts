import BaseError from './BaseError';

export default class ServiceUnavailableError extends BaseError {
  constructor(message = 'Service unavailable') {
    super('ServiceUnavailableError', 503, message);
  }
}
