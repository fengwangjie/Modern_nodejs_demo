// 分析功能模块
import logger from '#utils/logger';

class Analytics {
  constructor() {
    this.events = [];
    this.isEnabled = true;
  }

  track(event, properties = {}) {
    if (!this.isEnabled) return;

    const eventData = {
      event,
      properties,
      timestamp: new Date().toISOString(),
      sessionId: this.getSessionId()
    };

    this.events.push(eventData);
    logger.debug('Analytics event tracked', eventData);

    // 模拟发送到分析服务
    this.sendToAnalyticsService(eventData);
  }

  async sendToAnalyticsService(eventData) {
    // 模拟异步发送
    setTimeout(() => {
      logger.debug('Event sent to analytics service', { 
        event: eventData.event 
      });
    }, 100);
  }

  getSessionId() {
    // 简单的会话 ID 生成
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getEvents() {
    return [...this.events];
  }

  clearEvents() {
    this.events = [];
    logger.info('Analytics events cleared');
  }

  disable() {
    this.isEnabled = false;
    logger.info('Analytics disabled');
  }

  enable() {
    this.isEnabled = true;
    logger.info('Analytics enabled');
  }
}

export default new Analytics();