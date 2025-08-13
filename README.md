# 现代 Node.js 模式示例 (2025)

这个项目展示了现代 Node.js 开发的最佳实践和新特性，基于文章《Modern Node.js Patterns for 2025》中介绍的内容。

## 🚀 特性展示

### 1. ES 模块和 node: 前缀
- 使用 ES 模块 (`type: "module"`)
- 内置模块使用 `node:` 前缀
- 内部模块使用 import maps (`#config`, `#utils/*`)

### 2. Top-level await
- 应用初始化时直接使用 await
- 无需包装函数

### 3. 内置 Web APIs
- 使用内置 `fetch` API 替代外部 HTTP 库
- `AbortController` 用于请求取消和超时
- Web Streams 与 Node.js Streams 互操作

### 4. 内置测试框架
- 使用 `node:test` 模块进行测试
- 支持 watch 模式和覆盖率报告

### 5. 现代异步模式
- AsyncIterator 处理数据流
- 结构化错误处理
- Promise.all 并行执行

### 6. Worker Threads
- CPU 密集型任务使用 Worker Threads
- 保持主线程响应性

### 7. 高级流处理
- Transform streams
- Web Streams 互操作
- 背压处理

### 8. 动态导入
- 条件功能加载
- 运行时模块切换

### 9. 现代开发体验
- 内置 watch 模式 (`--watch`)
- 环境文件支持 (`--env-file`)
- 诊断通道和性能监控

## 📦 安装和运行

### 前提条件
- Node.js >= 20.0.0

### 安装依赖
```bash
# 这个项目不需要外部依赖！
# 所有功能都使用 Node.js 内置 API
```

### 开发模式
```bash
# 使用 watch 模式和环境文件
npm run dev
```

### 生产模式
```bash
npm start
```

### 运行测试
```bash
# 运行所有测试
npm test

# 带覆盖率报告
npm run test:coverage
```

## 🌐 API 端点

启动服务器后，可以访问以下端点：

- `GET /` - 应用信息
- `GET /health` - 健康检查
- `GET /process-data` - 数据处理演示 (AsyncIterator)
- `GET /stream-demo` - 流处理演示
- `GET /fetch-demo` - Fetch API 演示
- `GET /metrics` - 应用指标

## 🏗️ 项目结构

```
src/
├── app.js                 # 主应用文件 (top-level await)
├── config/
│   └── index.js          # 配置管理
├── utils/
│   ├── logger.js         # 结构化日志
│   └── errors.js         # 错误处理类
├── services/
│   ├── http-client.js    # HTTP 客户端 (fetch API)
│   ├── data-processor.js # 数据处理 (AsyncIterator)
│   ├── stream-processor.js # 流处理
│   ├── feature-loader.js # 动态功能加载
│   ├── adapters/         # 数据库适配器
│   └── features/         # 可选功能模块
└── workers/
    └── cpu-intensive.js  # Worker Thread 示例

test/
├── utils.test.js         # 工具函数测试
├── services.test.js      # 服务测试
└── integration.test.js   # 集成测试
```

## 🔧 现代特性详解

### ES 模块和 Import Maps
```javascript
// 使用 node: 前缀
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';

// 使用 import maps
import config from '#config';
import logger from '#utils/logger';
```

### Top-level Await
```javascript
// 直接在模块顶层使用 await
const config = JSON.parse(
  await readFile('./config.json', 'utf8')
);
```

### 内置 Fetch 和 AbortController
```javascript
// 带超时的 HTTP 请求
const response = await fetch(url, {
  signal: AbortSignal.timeout(5000)
});
```

### AsyncIterator 数据处理
```javascript
// 流式处理大量数据
for await (const result of processor.processStream(data)) {
  console.log('处理结果:', result);
}
```

### Worker Threads
```javascript
// CPU 密集型任务不阻塞主线程
const result = await processWithWorker(data);
```

### 内置测试
```javascript
import { test, describe } from 'node:test';
import assert from 'node:assert';

describe('功能测试', () => {
  test('应该正常工作', () => {
    assert.strictEqual(1 + 1, 2);
  });
});
```

## 🎯 最佳实践

1. **使用 node: 前缀** - 明确区分内置模块和第三方包
2. **结构化错误处理** - 创建有意义的错误类
3. **异步优先** - 使用 async/await 和 Promise.all
4. **流式处理** - 处理大数据时使用流
5. **Worker Threads** - CPU 密集型任务使用工作线程
6. **内置工具优先** - 减少外部依赖
7. **诊断和监控** - 使用内置性能监控
8. **优雅关闭** - 处理 SIGTERM 和 SIGINT

## 🚀 部署

### 单文件可执行程序
```bash
# 构建单文件可执行程序
npm run build

# 这将创建一个独立的可执行文件
# 用户无需安装 Node.js 即可运行
```

## 📚 学习资源

这个项目实现了以下现代 Node.js 模式：

- ✅ ES 模块和 node: 前缀
- ✅ Top-level await
- ✅ 内置 Fetch API
- ✅ AbortController
- ✅ 内置测试框架
- ✅ AsyncIterator 模式
- ✅ Worker Threads
- ✅ Web Streams 互操作
- ✅ 动态导入
- ✅ 诊断通道
- ✅ 性能监控
- ✅ 结构化错误处理
- ✅ 现代开发工具

每个特性都有完整的示例代码和测试，可以直接运行和学习。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个示例项目！