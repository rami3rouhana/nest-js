export default class BaseError extends Error {
  name: string;
  statusCode: number;
  isOperational: boolean;

  constructor(name: string, statusCode: number, message: string) {
    super(message);
    this.name = name;
    this.statusCode = statusCode;
    this.isOperational = true; // This distinguishes operational errors from programming errors.
  }
}
