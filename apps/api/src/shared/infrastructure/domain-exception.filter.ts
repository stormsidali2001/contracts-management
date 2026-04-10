import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  ConflictError,
  DomainError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from './domain/errors';

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: DomainError, host: ArgumentsHost): void {
    const { url, method } = host.switchToHttp().getRequest<Request>();
    const response = host.switchToHttp().getResponse<Response>();

    const status = this.#resolveStatus(exception);

    response.status(status).json({
      path: url,
      method,
      error: exception.message,
      timestamp: new Date(),
      statusCode: status,
    });

    this.logger.error(`request: ${method} ${url} ${exception.message}`);
  }

  #resolveStatus(exception: DomainError): HttpStatus {
    if (exception instanceof ValidationError) return HttpStatus.BAD_REQUEST;
    if (exception instanceof NotFoundError) return HttpStatus.NOT_FOUND;
    if (exception instanceof ConflictError) return HttpStatus.CONFLICT;
    if (exception instanceof ForbiddenError) return HttpStatus.FORBIDDEN;
    if (exception instanceof UnauthorizedError) return HttpStatus.UNAUTHORIZED;
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
