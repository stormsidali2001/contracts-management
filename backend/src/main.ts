import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import {SwaggerModule} from '@nestjs/swagger'
import { AuthModule } from './auth/auth.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api')
  app.useGlobalPipes(new ValidationPipe({transform:true,disableErrorMessages:false}))
  app.enableCors();
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
