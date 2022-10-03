class InternalError extends Error {
  constructor(msg) {
    const message = msg === '' ? 'Произошла ошибка' : msg;
    super(message);
    this.statusCode = 500;
  }
}

module.exports = { InternalError };
