import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import {SwaggerModule} from '@nestjs/swagger'
import { SocketIoAdapter } from './shared/Socket-io.adapter';
import * as cookieParser from 'cookie-parser'


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api')
  app.useGlobalPipes(new ValidationPipe({transform:true,disableErrorMessages:false}))
  app.enableCors({credentials:true,origin:["http://localhost:3000"],methods:['POST','GET','PUT']});
  app.useWebSocketAdapter(new SocketIoAdapter(app));
  app.use(cookieParser()) // to parse the cookie  in the request
  const config = new DocumentBuilder().setTitle('Contracts Management')
  .setDescription("description")
  .setVersion('v1')
  .addTag('Contracts Management')
  .addBearerAuth()
  .build();

  const document = SwaggerModule.createDocument(app, config);
 
  SwaggerModule.setup('docs', app, document); 
  await app.listen(8080);
}
bootstrap();
