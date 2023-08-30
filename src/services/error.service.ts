export default class ErrorService {
  logError(error) {
    console.error(error);
  }

  handle(error, request, reply) {
    this.logError(error);

    if (!error.isOperational) {
      return reply.status(500).send({ error: 'An unexpected error occurred' });
    }

    reply.status(error.statusCode).send({ error: error.message });
  }
}
