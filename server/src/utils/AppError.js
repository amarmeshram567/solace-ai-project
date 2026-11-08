// Expected, user-facing errors. Anything that is not an AppError is treated as
// an internal failure and returned as a generic message.
export class AppError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
  }
}
