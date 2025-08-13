// 现代异步模式 - AsyncIterator 和事件处理
import { EventEmitter } from 'node:events';
import { Worker } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';
import logger from '#utils/logger';

export class DataProcessor extends EventEmitter {
  constructor() {
    super();
    this.isProcessing = false;
  }

  // 使用 AsyncIterator 处理数据流
  async *processStream(data, options = {}) {
    this.isProcessing = true;
    this.emit('start', { totalItems: data.length });

    try {
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        
        // 模拟异步处理
        performance.mark(`process-item-${i}-start`);
        
        const result = await this.processItem(item, options);
        
        performance.mark(`process-item-${i}-end`);
        performance.measure(
          `process-item-${i}`,
          `process-item-${i}-start`,
          `process-item-${i}-end`
        );

        this.emit('progress', { 
          current: i + 1, 
          total: data.length, 
          item: result 
        });

        yield result;

        // 允许事件循环处理其他任务
        await new Promise(resolve => setImmediate(resolve));
      }

      this.emit('complete');
    } catch (error) {
      this.emit('error', error);
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }

  async processItem(item, options = {}) {
    // 对于 CPU 密集型任务，使用 Worker Threads
    if (options.useCPUIntensive) {
      return this.processWithWorker(item);
    }

    // 简单的异步处理
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
    
    return {
      id: item.id || Math.random().toString(36).substr(2, 9),
      processed: true,
      timestamp: new Date().toISOString(),
      data: typeof item === 'string' ? item.toUpperCase() : item
    };
  }

  async processWithWorker(item) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(
        fileURLToPath(new URL('../workers/cpu-intensive.js', import.meta.url)),
        { workerData: { item } }
      );

      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  }

  // 批量处理方法
  async processBatch(data, batchSize = 5) {
    const results = [];
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      // 并行处理批次中的项目
      const batchResults = await Promise.all(
        batch.map(item => this.processItem(item))
      );
      
      results.push(...batchResults);
      
      logger.info('Batch processed', { 
        batchNumber: Math.floor(i / batchSize) + 1,
        itemsProcessed: results.length,
        totalItems: data.length
      });
    }

    return results;
  }
}

export default DataProcessor;