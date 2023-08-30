import ErrorService from './error.service';

describe('ErrorService', () => {
  let errorService;
  let mockRequest;
  let mockReply;

  beforeEach(() => {
    errorService = new ErrorService();

    console.error = jest.fn();

    mockRequest = {};
    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  it('should log the error', () => {
    const mockError = new Error('Test error');
    errorService.logError(mockError);
    expect(console.error).toHaveBeenCalledWith(mockError);
  });

  it('should handle operational errors', () => {
    const mockError = {
      isOperational: true,
      statusCode: 400,
      message: 'Bad Request',
    };

    errorService.handle(mockError, mockRequest, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith({ error: 'Bad Request' });
  });

  it('should handle non-operational errors', () => {
    const mockError = {
      isOperational: false,
    };

    errorService.handle(mockError, mockRequest, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      error: 'An unexpected error occurred',
    });
  });
});
