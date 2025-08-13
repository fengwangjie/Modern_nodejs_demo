// 现代 Node.js 内置测试 - 工具函数测试
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import { AppError, ValidationError, handleError } from '../src/utils/errors.js';
import logger from '../src/utils/logger.js';

describe('错误处理工具', () => {
  test('AppError 应该正确创建结构化错误', () => {
    const error = new AppError('测试错误', 'TEST_ERROR', 400, { field: 'test' });
    
    assert.strictEqual(error.message, '测试错误');
    assert.strictEqual(error.code, 'TEST_ERROR');
    assert.strictEqual(error.statusCode, 400);
    assert.deepStrictEqual(error.context, { field: 'test' });
    assert.ok(error.timestamp);
  });

  test('ValidationError 应该继承 AppError', () => {
    const error = new ValidationError('无效输入', 'email', 'invalid@');
    
    assert.ok(error instanceof AppError);
    assert.strictEqual(error.name, 'ValidationError');
    assert.strictEqual(error.code, 'VALIDATION_ERROR');
    assert.strictEqual(error.statusCode, 400);
  });

  test('handleError 应该正确处理 AppError', () => {
    const error = new AppError('测试错误', 'TEST_ERROR');
    const result = handleError(error);
    
    assert.strictEqual(result.success, false);
    assert.ok(result.error);
    assert.strictEqual(result.error.code, 'TEST_ERROR');
  });

  test('handleError 应该处理未知错误', () => {
    const error = new Error('普通错误');
    const result = handleError(error);
    
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.name, 'UnknownError');
  });
});

describe('日志工具', () => {
  test('logger 应该有正确的日志级别', () => {
    assert.ok(typeof logger.error === 'function');
    assert.ok(typeof logger.warn === 'function');
    assert.ok(typeof logger.info === 'function');
    assert.ok(typeof logger.debug === 'function');
  });
});