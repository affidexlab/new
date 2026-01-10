/**
 * Custom error classes for DecaFlow React SDK
 */

export class DecaFlowError extends Error {
  code?: string;
  details?: Record<string, any>;

  constructor(message: string, code?: string, details?: Record<string, any>) {
    super(message);
    this.name = 'DecaFlowError';
    this.code = code;
    this.details = details;
  }
}

export class NetworkError extends DecaFlowError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'NETWORK_ERROR', details);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends DecaFlowError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class QuoteExpiredError extends DecaFlowError {
  constructor(message: string = 'Quote has expired') {
    super(message, 'QUOTE_EXPIRED');
    this.name = 'QuoteExpiredError';
  }
}
