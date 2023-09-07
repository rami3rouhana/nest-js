import BaseError from './BaseError';

export class RefreshTokenRequiredError extends BaseError {
  constructor() {
    super('RefreshTokenRequiredError', 401, 'Refresh token is required');
  }
}
