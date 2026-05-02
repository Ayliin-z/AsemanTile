// backend/src/middleware/logger.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_DIR = path.join(__dirname, '../../logs');

// ایجاد پوشه logs اگر وجود ندارد
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// ========== نوشتن در فایل لاگ ==========
const writeLog = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...meta
  };
  
  const logString = JSON.stringify(logEntry) + '\n';
  const dateStr = new Date().toISOString().split('T')[0];
  const logFile = path.join(LOG_DIR, `${dateStr}.log`);
  
  fs.appendFileSync(logFile, logString);
  
  // در محیط توسعه، در کنسول هم نمایش بده
  if (process.env.NODE_ENV === 'development') {
    const color = level === 'error' ? '\x1b[31m' : level === 'warn' ? '\x1b[33m' : '\x1b[32m';
    console.log(`${color}[${level.toUpperCase()}]\x1b[0m ${timestamp} - ${message}`);
  }
};

// ========== Middleware لاگ کردن درخواست‌ها ==========
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // لاگ کردن بعد از اتمام درخواست
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent')
    };
    
    if (req.user) {
      logData.userId = req.user.id;
      logData.userType = req.user.type;
    }
    
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    writeLog(level, `${req.method} ${req.url}`, logData);
  });
  
  next();
};

// ========== لاگ خطاها ==========
export const errorLogger = (err, req, res, next) => {
  const logData = {
    method: req.method,
    url: req.url,
    error: err.message,
    stack: err.stack,
    ip: req.ip || req.connection.remoteAddress
  };
  
  if (req.user) {
    logData.userId = req.user.id;
  }
  
  writeLog('error', err.message, logData);
  next(err);
};

// ========== لاگ عملیات مهم (مانند ورود، خروج، حذف) ==========
export const auditLog = (action, userId, details = {}) => {
  writeLog('info', `AUDIT: ${action}`, {
    action,
    userId,
    ...details
  });
};

// ========== لاگ مخصوص API ==========
export const apiLogger = (req, res, next) => {
  const logBody = { ...req.body };
  
  // حذف اطلاعات حساس از لاگ
  if (logBody.password) delete logBody.password;
  if (logBody.token) delete logBody.token;
  
  writeLog('debug', `API Request: ${req.method} ${req.url}`, {
    body: Object.keys(logBody).length ? logBody : undefined,
    query: Object.keys(req.query).length ? req.query : undefined,
    params: Object.keys(req.params).length ? req.params : undefined
  });
  
  next();
};

// ========== تابع کمکی برای لاگ ==========
export const log = {
  info: (message, meta = {}) => writeLog('info', message, meta),
  warn: (message, meta = {}) => writeLog('warn', message, meta),
  error: (message, meta = {}) => writeLog('error', message, meta),
  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV === 'development') {
      writeLog('debug', message, meta);
    }
  }
};

export default {
  requestLogger,
  errorLogger,
  auditLog,
  apiLogger,
  log
};
