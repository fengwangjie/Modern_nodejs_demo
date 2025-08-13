// 监控功能模块
import { PerformanceObserver, performance } from 'node:perf_hooks';
import logger from '#utils/logger';

class Monitoring {
  constructor() {
    this.metrics = new Map();
    this.isEnabled = true;
    this.setupPerformanceObserver();
  }

  setupPerformanceObserver() {
    const obs = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 100) { // 记录慢操作
          logger.warn('Slow operation detected', {
            name: entry.name,
            duration: entry.duration,
            type: entry.entryType
          });
          
          this.recordMetric('slow_operations', {
            name: entry.name,
            duration: entry.duration,
            timestamp: new Date().toISOString()
          });
        }
      }
    });

    obs.observe({ entryTypes: ['function', 'http', 'dns', 'measure'] });
  }

  recordMetric(name, value) {
    if (!this.isEnabled) return;

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    this.metrics.get(name).push({
      value,
      timestamp: new Date().toISOString()
    });

    logger.debug('Metric recorded', { name, value });
  }

  startTimer(name) {
    performance.mark(`${name}-start`);
    return {
      end: () => {
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
      }
    };
  }

  getMetrics(name) {
    return this.metrics.get(name) || [];
  }

  getAllMetrics() {
    const result = {};
    for (const [name, values] of this.metrics) {
      result[name] = values;
    }
    return result;
  }

  clearMetrics() {
    this.metrics.clear();
    logger.info('Monitoring metrics cleared');
  }

  getSystemInfo() {
    return {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    };
  }

  disable() {
    this.isEnabled = false;
    logger.info('Monitoring disabled');
  }

  enable() {
    this.isEnabled = true;
    logger.info('Monitoring enabled');
  }
}

export default new Monitoring();