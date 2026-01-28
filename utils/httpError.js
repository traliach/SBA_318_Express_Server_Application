export class HttpError extends Error {
  /**
   * @param {number} status HTTP status code
   * @param {string} message safe error message for clients
   * @param {{ code?: string, details?: any }} [opts]
   */
  constructor(status, message, opts = {}) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = opts.code;
    this.details = opts.details;
  }
}

/**
 * Convenience factory for consistent route errors.
 * @param {number} status
 * @param {string} message
 * @param {{ code?: string, details?: any }} [opts]
 */
export function createHttpError(status, message, opts) {
  return new HttpError(status, message, opts);
}

