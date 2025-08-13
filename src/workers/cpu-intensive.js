// Worker Thread 示例 - CPU 密集型任务
import { parentPort, workerData } from 'node:worker_threads';

function fibonacci(n) {
  if (n < 2) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

function processComplexData(item) {
  // 模拟 CPU 密集型计算
  const start = performance.now();
  
  // 计算斐波那契数列（CPU 密集型）
  const fibResult = fibonacci(30);
  
  // 模拟复杂的数据转换
  const processed = {
    id: item.id || Math.random().toString(36).substr(2, 9),
    originalData: item,
    fibonacciResult: fibResult,
    processingTime: performance.now() - start,
    processedAt: new Date().toISOString(),
    workerId: process.pid
  };

  return processed;
}

try {
  const result = processComplexData(workerData.item);
  parentPort.postMessage(result);
} catch (error) {
  parentPort.postMessage({
    error: true,
    message: error.message,
    stack: error.stack
  });
}