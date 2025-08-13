// 现代日志工具 - 结构化日志和诊断通道
import diagnostics_channel from 'node:diagnostics_channel';

const logChannel = diagnostics_channel.channel('app:logger');

class Logger {
  constructor(level = 'info') {
    this.levels = { error: 0, warn: 1, info: 2, debug: 3 };
    this.level = this.levels[level] || 2;
  }

  log(level, message, context = {}) {
    if (this.levels[level] > this.level) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      pid: process.pid
    };

    console.log(JSON.stringify(logEntry));
    
    // 发布诊断信息
    logChannel.publish(logEntry);
  }

  error(message, context) { this.log('error', message, context); }
  warn(message, context) { this.log('warn', message, context); }
  info(message, context) { this.log('info', message, context); }
  debug(message, context) { this.log('debug', message, context); }
}

export const logger = new Logger(process.env.LOG_LEVEL);
export default logger;