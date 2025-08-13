// 现代错误处理 - 结构化错误类
export class AppError extends Error {
  constructor(message, code, statusCode = 500, context = {}) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.context = context;
    this.timestamp = new Date().toISOString();
    
    // 保持堆栈跟踪
    Error.captureStackTrace(this, AppError);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}

export class ValidationError extends AppError {
  constructor(message, field, value) {
    super(message, 'VALIDATION_ERROR', 400, { field, value });
    this.name = 'ValidationError';
  }
}

export class NetworkError extends AppError {
  constructor(message, url, statusCode) {
    super(message, 'NETWORK_ERROR', statusCode, { url });
    this.name = 'NetworkError';
  }
}

// 错误处理中间件
export function handleError(error) {
  if (error instanceof AppError) {
    return {
      error: error.toJSON(),
      success: false
    };
  }

  // 未知错误
  return {
    error: {
      name: 'UnknownError',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString()
    },
    success: false
  };
}