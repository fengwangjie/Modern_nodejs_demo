// 现代 Node.js 应用主文件 - 展示所有现代特性
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import config from '#config';
import logger from '#utils/logger';
import { AppError, handleError } from '#utils/errors';
import { HttpClient } from '#services/http-client';
import DataProcessor from '#services/data-processor';
import StreamProcessor from '#services/stream-processor';
import FeatureLoader from '#services/feature-loader';

// Top-level await - 现代初始化模式
const appConfig = JSON.parse(
  await readFile('./package.json', 'utf8')
);

logger.info('Application starting', {
  name: appConfig.name,
  version: appConfig.version,
  nodeVersion: process.version
});

// 初始化服务
const httpClient = new HttpClient();
const dataProcessor = new DataProcessor();
const streamProcessor = new StreamProcessor();
const featureLoader = new FeatureLoader();

// 加载可选功能
const features = await featureLoader.loadOptionalFeatures();
logger.info('Features loaded', { features: features.map(f => f.name) });

// 创建 HTTP 服务器
const server = createServer(async (req, res) => {
  // 设置 CORS 和基本头部
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;

    // 路由处理
    switch (path) {
      case '/':
        res.writeHead(200);
        res.end(JSON.stringify({
          message: 'Modern Node.js API',
          version: appConfig.version,
          features: featureLoader.getLoadedFeatures(),
          timestamp: new Date().toISOString()
        }));
        break;

      case '/health':
        await handleHealthCheck(res);
        break;

      case '/process-data':
        await handleDataProcessing(req, res);
        break;

      case '/stream-demo':
        await handleStreamDemo(res);
        break;

      case '/fetch-demo':
        await handleFetchDemo(res);
        break;

      case '/metrics':
        await handleMetrics(res);
        break;

      default:
        res.writeHead(404);
        res.end(JSON.stringify({
          error: 'Not Found',
          path,
          timestamp: new Date().toISOString()
        }));
    }
  } catch (error) {
    logger.error('Request handling failed', {
      url: req.url,
      method: req.method,
      error: error.message
    });

    const errorResponse = handleError(error);
    res.writeHead(errorResponse.error.statusCode || 500);
    res.end(JSON.stringify(errorResponse));
  }
});

// 健康检查端点
async function handleHealthCheck(res) {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    features: featureLoader.getLoadedFeatures()
  };

  // 如果监控功能可用，添加系统信息
  if (featureLoader.isFeatureAvailable('monitoring')) {
    const systemInfo = await featureLoader.executeFeature('monitoring', 'getSystemInfo');
    health.system = systemInfo;
  }

  res.writeHead(200);
  res.end(JSON.stringify(health));
}

// 数据处理演示
async function handleDataProcessing(req, res) {
  const sampleData = [
    { id: 1, name: 'Item 1', value: 100 },
    { id: 2, name: 'Item 2', value: 200 },
    { id: 3, name: 'Item 3', value: 300 }
  ];

  // 使用 AsyncIterator 处理数据
  const results = [];
  for await (const result of dataProcessor.processStream(sampleData)) {
    results.push(result);
  }

  // 记录分析事件
  if (featureLoader.isFeatureAvailable('analytics')) {
    await featureLoader.executeFeature('analytics', 'track', 'data_processed', {
      itemCount: results.length
    });
  }

  res.writeHead(200);
  res.end(JSON.stringify({
    message: 'Data processed successfully',
    results,
    count: results.length
  }));
}

// 流处理演示
async function handleStreamDemo(res) {
  const data = ['hello', 'world', 'from', 'streams'];
  
  // 演示 Web Streams 互操作
  const webStreamResults = await streamProcessor.demonstrateStreamInterop();
  
  // 内存流处理
  const memoryResults = await streamProcessor.processInMemoryStream(
    data,
    item => `processed: ${item.toUpperCase()}`
  );

  res.writeHead(200);
  res.end(JSON.stringify({
    message: 'Stream processing demo',
    webStreamResults,
    memoryResults
  }));
}

// Fetch API 演示
async function handleFetchDemo(res) {
  try {
    // 使用内置 fetch API 获取数据
    const response = await httpClient.get('https://jsonplaceholder.typicode.com/posts/1');
    
    res.writeHead(200);
    res.end(JSON.stringify({
      message: 'Fetch demo successful',
      data: response
    }));
  } catch (error) {
    throw new AppError('Fetch demo failed', 'FETCH_ERROR', 500, {
      originalError: error.message
    });
  }
}

// 指标端点
async function handleMetrics(res) {
  let metrics = {};

  if (featureLoader.isFeatureAvailable('monitoring')) {
    metrics = await featureLoader.executeFeature('monitoring', 'getAllMetrics');
  }

  res.writeHead(200);
  res.end(JSON.stringify({
    message: 'Application metrics',
    metrics,
    timestamp: new Date().toISOString()
  }));
}

// 优雅关闭处理
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// 启动服务器
server.listen(config.port, () => {
  logger.info('Server started', {
    port: config.port,
    environment: config.nodeEnv,
    pid: process.pid
  });
  
  console.log(`🚀 Modern Node.js server running on http://localhost:${config.port}`);
  console.log(`📊 Health check: http://localhost:${config.port}/health`);
  console.log(`🔄 Data processing: http://localhost:${config.port}/process-data`);
  console.log(`🌊 Stream demo: http://localhost:${config.port}/stream-demo`);
  console.log(`🌐 Fetch demo: http://localhost:${config.port}/fetch-demo`);
  console.log(`📈 Metrics: http://localhost:${config.port}/metrics`);
});

export default server;