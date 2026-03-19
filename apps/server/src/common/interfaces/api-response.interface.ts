/**
 * 统一响应接口包装类
 * 用于标准化所有API返回格式
 */

import {
  BUSINESS_ERROR_CODE,
  BUSINESS_ERROR_MESSAGE,
} from "../constants/app.constants";

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

export class ResponseBuilder<T = unknown> {
  private response: ApiResponse<T>;

  constructor() {
    this.response = {
      code: BUSINESS_ERROR_CODE.SUCCESS,
      message: BUSINESS_ERROR_MESSAGE.SUCCESS,
      data: null as T,
      timestamp: new Date().toISOString(),
    };
  }

  success(data: T): ApiResponse<T> {
    this.response.data = data;
    this.response.message = BUSINESS_ERROR_MESSAGE.SUCCESS;
    this.response.code = BUSINESS_ERROR_CODE.SUCCESS;
    return this.response;
  }

  error(
    code: number = BUSINESS_ERROR_CODE.INTERNAL_SERVER_ERROR,
    message: string = BUSINESS_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
    data: T | null = null,
  ): ApiResponse<T> {
    this.response.code = code;
    this.response.message = message;
    this.response.data = data;
    return this.response;
  }

  notFound(message: string = "资源不存在"): ApiResponse<T> {
    return this.error(BUSINESS_ERROR_CODE.NOT_FOUND, message);
  }

  validationError(message: string = "参数验证失败"): ApiResponse<T> {
    return this.error(BUSINESS_ERROR_CODE.VALIDATION_ERROR, message);
  }

  unauthorized(message: string = "未授权访问"): ApiResponse<T> {
    return this.error(BUSINESS_ERROR_CODE.UNAUTHORIZED, message);
  }

  forbidden(message: string = "禁止访问"): ApiResponse<T> {
    return this.error(BUSINESS_ERROR_CODE.FORBIDDEN, message);
  }

  internalError(message: string = "服务器内部错误"): ApiResponse<T> {
    return this.error(BUSINESS_ERROR_CODE.INTERNAL_SERVER_ERROR, message);
  }
}
