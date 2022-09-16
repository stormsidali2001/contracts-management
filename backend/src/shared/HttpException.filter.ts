import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { Request, Response } from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter{
    private logger = new Logger(HttpExceptionFilter.name);
    catch(exception: HttpException, host: ArgumentsHost) {
        const request = host.switchToHttp().getRequest<Request>();
        const response = host.switchToHttp().getResponse<Response>();

        const status = exception.getStatus();
        const {url ,method} = request;
     
        response.status(status).json({
            path:url,
            method,
            error:exception?.message,
            timestamp:new Date,
            statusCode:status
        })
        this.logger.error(`request: ${method} ${url} ${exception.message} `);
        
    }
    
}