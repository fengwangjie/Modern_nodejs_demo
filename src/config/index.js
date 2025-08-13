// 现代配置管理 - 使用 ES 模块和环境变量
// 对于 Node.js 18，手动加载 .env 文件
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 简单的 .env 文件解析器
try {
  const envPath = join(__dirname, '../../.env');
  const envFile = readFileSync(envPath, 'utf8');
  const envVars = envFile.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  
  envVars.forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
} catch (error) {
  console.warn('Could not load .env file:', error.message);
}

export const config = {
  port: parseInt(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.DATABASE_URL || 'sqlite://./data/app.db'
  },
  api: {
    key: process.env.API_KEY,
    timeout: 5000
  },
  features: {
    analytics: process.env.ENABLE_ANALYTICS === 'true',
    monitoring: process.env.ENABLE_MONITORING === 'true'
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};

// 配置验证
function validateConfig() {
  const required = ['API_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

validateConfig();

export default config;