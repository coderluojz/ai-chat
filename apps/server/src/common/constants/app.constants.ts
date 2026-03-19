/**
 * 应用程序常量
 */

export enum APP_STATUS {
  DISABLED = 0,
  ENABLED = 1,
}

export enum BUSINESS_ERROR_CODE {
  SUCCESS = 0,
  FAILED = 1,
  NOT_FOUND = 2,
  VALIDATION_ERROR = 3,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  INTERNAL_SERVER_ERROR = 500,
}

export enum BUSINESS_ERROR_MESSAGE {
  SUCCESS = "操作成功",
  FAILED = "操作失败",
  NOT_FOUND = "资源不存在",
  VALIDATION_ERROR = "参数验证失败",
  UNAUTHORIZED = "未授权访问",
  FORBIDDEN = "禁止访问",
  INTERNAL_SERVER_ERROR = "服务器内部错误",
}

export enum CHAT_ROLE {
  USER = "user",
  AI = "ai",
}

export enum MESSAGE_TYPE {
  TEXT = "text",
  IMAGE = "image",
  AUDIO = "audio",
  VIDEO = "video",
  FILE = "file",
}

export enum SESSION_STATUS {
  INITIAL = "initial",
  ACTIVE = "active",
  ARCHIVED = "archived",
}

export enum PROVIDER {
  LOCAL = "local",
  OPENAI = "openai",
}

export const JWT_CONSTANTS = {
  EXPIRES_IN: "15m",
  REFRESH_TOKEN_EXPIRES_IN: "7d",
  // 注意：SECRET 应从 ConfigService 获取，此处仅为类型定义
};
