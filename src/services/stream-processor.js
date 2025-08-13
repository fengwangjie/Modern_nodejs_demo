// 现代流处理 - Web Streams 和 Node.js Streams 互操作
import { Readable, Transform, Writable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createReadStream, createWriteStream } from 'node:fs';
import logger from '#utils/logger';

export class StreamProcessor {
  // 创建转换流
  createTransformStream(transformFn) {
    return new Transform({
      objectMode: true,
      transform(chunk, encoding, callback) {
        try {
          const result = transformFn(chunk);
          this.push(result);
          callback();
        } catch (error) {
          callback(error);
        }
      }
    });
  }

  // 创建 Web Stream（与浏览器兼容）
  createWebReadableStream(data) {
    let index = 0;
    
    return new ReadableStream({
      start(controller) {
        logger.info('Web stream started');
      },
      
      pull(controller) {
        if (index < data.length) {
          controller.enqueue(data[index++]);
        } else {
          controller.close();
        }
      },
      
      cancel() {
        logger.info('Web stream cancelled');
      }
    });
  }

  // Web Streams 和 Node.js Streams 互转换
  async demonstrateStreamInterop() {
    const data = ['Hello', 'World', 'from', 'Web', 'Streams'];
    
    // 创建 Web Stream
    const webReadable = this.createWebReadableStream(data);
    
    // 转换为 Node.js Stream
    const nodeStream = Readable.fromWeb(webReadable);
    
    // 处理数据
    const results = [];
    for await (const chunk of nodeStream) {
      results.push(chunk.toUpperCase());
    }
    
    logger.info('Stream interop demo completed', { results });
    return results;
  }

  // 文件流处理管道
  async processFile(inputPath, outputPath, transformFn) {
    const upperCaseTransform = this.createTransformStream(
      chunk => transformFn ? transformFn(chunk) : chunk.toString().toUpperCase()
    );

    try {
      await pipeline(
        createReadStream(inputPath),
        upperCaseTransform,
        createWriteStream(outputPath)
      );
      
      logger.info('File processing completed', { inputPath, outputPath });
    } catch (error) {
      logger.error('File processing failed', { 
        inputPath, 
        outputPath, 
        error: error.message 
      });
      throw error;
    }
  }

  // 内存中的流处理
  async processInMemoryStream(data, transformFn) {
    const results = [];
    
    const readable = Readable.from(data);
    const transform = this.createTransformStream(transformFn);
    const writable = new Writable({
      objectMode: true,
      write(chunk, encoding, callback) {
        results.push(chunk);
        callback();
      }
    });

    await pipeline(readable, transform, writable);
    return results;
  }

  // 背压处理示例
  async handleBackpressure(largeDataSet) {
    let processed = 0;
    const batchSize = 100;
    
    const readable = new Readable({
      objectMode: true,
      read() {
        if (processed < largeDataSet.length) {
          const batch = largeDataSet.slice(processed, processed + batchSize);
          processed += batch.length;
          this.push(batch);
        } else {
          this.push(null); // 结束流
        }
      }
    });

    const transform = new Transform({
      objectMode: true,
      transform(batch, encoding, callback) {
        // 模拟异步处理
        setTimeout(() => {
          const processedBatch = batch.map(item => ({
            ...item,
            processed: true,
            timestamp: new Date().toISOString()
          }));
          this.push(processedBatch);
          callback();
        }, 10);
      }
    });

    const results = [];
    const writable = new Writable({
      objectMode: true,
      write(chunk, encoding, callback) {
        results.push(...chunk);
        logger.debug('Batch processed', { 
          batchSize: chunk.length, 
          totalProcessed: results.length 
        });
        callback();
      }
    });

    await pipeline(readable, transform, writable);
    return results;
  }
}

export default StreamProcessor;