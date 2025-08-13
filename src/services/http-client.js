// 现代 HTTP 客户端 - 使用内置 fetch API 和 AbortController
import { NetworkError } from '#utils/errors';
import logger from '#utils/logger';

export class HttpClient {
  constructor(baseURL = '', defaultTimeout = 5000) {
    this.baseURL = baseURL;
    this.defaultTimeout = defaultTimeout;
  }

  async request(url, options = {}) {
    const fullUrl = this.baseURL + url;
    const timeout = options.timeout || this.defaultTimeout;
    
    // 使用 AbortSignal.timeout 进行超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      logger.debug('HTTP request started', { url: fullUrl, method: options.method || 'GET' });
      
      const response = await fetch(fullUrl, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new NetworkError(
          `HTTP ${response.status}: ${response.statusText}`,
          fullUrl,
          response.status
        );
      }

      const data = await response.json();
      logger.debug('HTTP request completed', { url: fullUrl, status: response.status });
      
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        logger.warn('HTTP request timeout', { url: fullUrl, timeout });
        throw new NetworkError('Request timed out', fullUrl, 408);
      }
      
      if (error instanceof NetworkError) {
        throw error;
      }
      
      logger.error('HTTP request failed', { url: fullUrl, error: error.message });
      throw new NetworkError('Network request failed', fullUrl, 500);
    }
  }

  async get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  }

  async post(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(data)
    });
  }

  async put(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(data)
    });
  }

  async delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  }
}

// 创建默认客户端实例
export const httpClient = new HttpClient();
export default httpClient;