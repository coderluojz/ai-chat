import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import { BUSINESS_ERROR_CODE } from "../constants/app.constants";

interface ErrorResponse {
  code: number;
  message: string;
  data: null;
  timestamp: string;
  path: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let code: number;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === "string") {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === "object" &&
        exceptionResponse !== null
      ) {
        const responseObj = exceptionResponse as Record<string, unknown>;
        message = (responseObj.message as string) || exception.message;
        if (Array.isArray(responseObj.message)) {
          message = responseObj.message.join("; ");
        }
      } else {
        message = exception.message;
      }

      code = this.mapHttpStatusToBusinessCode(status);
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = "服务器内部错误";
      code = BUSINESS_ERROR_CODE.INTERNAL_SERVER_ERROR;
    }

    // Log error for debugging
    if (status >= 500) {
      const errorStack =
        exception instanceof Error
          ? exception.stack
          : typeof exception === "object" && exception !== null
            ? JSON.stringify(exception)
            : // eslint-disable-next-line @typescript-eslint/no-base-to-string
              String(exception);
      this.logger.error(
        `${request.method} ${request.url} ${status}`,
        errorStack,
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} ${status} - ${message}`,
      );
    }

    const errorResponse: ErrorResponse = {
      code,
      message,
      data: null,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }

  private mapHttpStatusToBusinessCode(status: number): number {
    const statusMap: Record<number, number> = {
      400: BUSINESS_ERROR_CODE.VALIDATION_ERROR,
      401: BUSINESS_ERROR_CODE.UNAUTHORIZED,
      403: BUSINESS_ERROR_CODE.FORBIDDEN,
      404: BUSINESS_ERROR_CODE.NOT_FOUND,
      500: BUSINESS_ERROR_CODE.INTERNAL_SERVER_ERROR,
    };
    return statusMap[status] || BUSINESS_ERROR_CODE.FAILED;
  }
}
