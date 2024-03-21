class AppError extends Error {
  constructor(message, statusCode) {
    // this will set the message property of the error object to the message that is passed to the constructor function
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor); // this will capture the stack trace of the error object
  }
}

module.exports = AppError;
