// 现代 Node.js 内置测试 - 服务测试
import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import DataProcessor from '../src/services/data-processor.js';
import StreamProcessor from '../src/services/stream-processor.js';
import FeatureLoader from '../src/services/feature-loader.js';

describe('数据处理服务', () => {
  let processor;

  beforeEach(() => {
    processor = new DataProcessor();
  });

  test('应该处理单个数据项', async () => {
    const item = { id: 1, name: 'test' };
    const result = await processor.processItem(item);
    
    assert.ok(result.processed);
    assert.ok(result.timestamp);
    assert.strictEqual(typeof result.id, 'string');
  });

  test('应该使用 AsyncIterator 处理数据流', async () => {
    const data = [
      { id: 1, name: 'item1' },
      { id: 2, name: 'item2' }
    ];

    const results = [];
    for await (const result of processor.processStream(data)) {
      results.push(result);
    }

    assert.strictEqual(results.length, 2);
    assert.ok(results.every(r => r.processed));
  });

  test('应该批量处理数据', async () => {
    const data = Array.from({ length: 10 }, (_, i) => ({ id: i, name: `item${i}` }));
    const results = await processor.processBatch(data, 3);
    
    assert.strictEqual(results.length, 10);
    assert.ok(results.every(r => r.processed));
  });
});

describe('流处理服务', () => {
  let streamProcessor;

  beforeEach(() => {
    streamProcessor = new StreamProcessor();
  });

  test('应该创建 Web Stream', async () => {
    const data = ['test1', 'test2', 'test3'];
    const webStream = streamProcessor.createWebReadableStream(data);
    
    assert.ok(webStream instanceof ReadableStream);
  });

  test('应该演示 Web Streams 互操作', async () => {
    const results = await streamProcessor.demonstrateStreamInterop();
    
    assert.ok(Array.isArray(results));
    assert.ok(results.length > 0);
    assert.ok(results.every(r => typeof r === 'string'));
  });

  test('应该处理内存流', async () => {
    const data = ['hello', 'world'];
    const results = await streamProcessor.processInMemoryStream(
      data,
      item => item.toUpperCase()
    );
    
    assert.deepStrictEqual(results, ['HELLO', 'WORLD']);
  });
});

describe('功能加载器', () => {
  let featureLoader;

  beforeEach(() => {
    featureLoader = new FeatureLoader();
  });

  test('应该跟踪已加载的功能', () => {
    const features = featureLoader.getLoadedFeatures();
    assert.ok(Array.isArray(features));
  });

  test('应该检查功能可用性', () => {
    const isAvailable = featureLoader.isFeatureAvailable('nonexistent');
    assert.strictEqual(isAvailable, false);
  });
});