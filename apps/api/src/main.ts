import 'tsconfig-paths/register';
import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { SocketIoAdapter } from './shared/infrastructure/Socket-io.adapter';
import * as cookieParser from 'cookie-parser';
import { SocketStateService } from './socket/infrastructure/SocketState.service';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      disableErrorMessages: false,
      whitelist: true,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.enableCors({
    credentials: true,
    origin: ['http://localhost:3000'],
    methods: ['POST', 'GET', 'PUT', 'PATCH', 'DELETE'],
  });
  app.use(cookieParser()); // to parse the cookie  in the request
  const config = new DocumentBuilder()
    .setTitle('Contracts Management')
    .setDescription('description')
    .setVersion('v1')
    .addTag('Contracts Management')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document);
  app.useWebSocketAdapter(new SocketIoAdapter(app));

  await app.listen(8080);

  const logger = new Logger('Bootstrap');
  const mode =
    process.env.NODE_ENV === 'production' ? 'production' : 'development';

  const dataSource = app.get(DataSource);
  const [{ count }] = await dataSource.query<[{ count: string }]>(
    'SELECT COUNT(*) AS count FROM users',
  );
  const seeded = parseInt(count, 10) > 0;

  logger.log(`Mode          : ${mode}`);
  logger.log(`Data seeded   : ${seeded ? 'yes' : 'no'}`);
  logger.log(`Server        : http://localhost:8080`);
}
bootstrap();
