// 动态导入和条件功能加载
import config from '#config';
import logger from '#utils/logger';

export class FeatureLoader {
  constructor() {
    this.loadedFeatures = new Map();
  }

  // 动态加载数据库适配器
  async loadDatabaseAdapter() {
    const dbUrl = config.database.url;
    const dbType = dbUrl.split('://')[0]; // 从 URL 中提取数据库类型

    try {
      logger.info('Loading database adapter', { type: dbType });
      
      // 动态导入适配器
      const adapter = await import(`./adapters/${dbType}-adapter.js`);
      return adapter.default;
    } catch (error) {
      logger.warn(`Database adapter ${dbType} not available, falling back to sqlite`, {
        error: error.message
      });
      
      // 回退到 SQLite
      const fallback = await import('./adapters/sqlite-adapter.js');
      return fallback.default;
    }
  }

  // 条件功能加载
  async loadOptionalFeatures() {
    const features = [];

    if (config.features.analytics) {
      try {
        logger.info('Loading analytics feature');
        const analytics = await import('./features/analytics.js');
        features.push({
          name: 'analytics',
          module: analytics.default,
          enabled: true
        });
        this.loadedFeatures.set('analytics', analytics.default);
      } catch (error) {
        logger.warn('Failed to load analytics feature', { error: error.message });
      }
    }

    if (config.features.monitoring) {
      try {
        logger.info('Loading monitoring feature');
        const monitoring = await import('./features/monitoring.js');
        features.push({
          name: 'monitoring',
          module: monitoring.default,
          enabled: true
        });
        this.loadedFeatures.set('monitoring', monitoring.default);
      } catch (error) {
        logger.warn('Failed to load monitoring feature', { error: error.message });
      }
    }

    logger.info('Optional features loaded', { 
      count: features.length,
      features: features.map(f => f.name)
    });

    return features;
  }

  // 运行时功能切换
  async toggleFeature(featureName, enabled) {
    if (enabled && !this.loadedFeatures.has(featureName)) {
      try {
        const feature = await import(`./features/${featureName}.js`);
        this.loadedFeatures.set(featureName, feature.default);
        logger.info('Feature enabled', { feature: featureName });
        return true;
      } catch (error) {
        logger.error('Failed to enable feature', { 
          feature: featureName, 
          error: error.message 
        });
        return false;
      }
    } else if (!enabled && this.loadedFeatures.has(featureName)) {
      this.loadedFeatures.delete(featureName);
      logger.info('Feature disabled', { feature: featureName });
      return true;
    }

    return false;
  }

  // 获取已加载的功能
  getLoadedFeatures() {
    return Array.from(this.loadedFeatures.keys());
  }

  // 检查功能是否可用
  isFeatureAvailable(featureName) {
    return this.loadedFeatures.has(featureName);
  }

  // 执行功能方法
  async executeFeature(featureName, method, ...args) {
    const feature = this.loadedFeatures.get(featureName);
    
    if (!feature) {
      throw new Error(`Feature ${featureName} is not loaded`);
    }

    if (typeof feature[method] !== 'function') {
      throw new Error(`Method ${method} not found in feature ${featureName}`);
    }

    return feature[method](...args);
  }
}

export default FeatureLoader;