import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UserService } from './user/application/user.service';
import { UserRole } from './core/types/UserRole.enum';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userService = app.get(UserService);
  
  const result = await userService.findAll(0, 100, undefined, undefined, undefined, undefined, undefined, UserRole.JURIDICAL);
  const juridicals = result.data;
  
  console.log(`Found ${juridicals.length} JURIDICAL users:`);
  juridicals.forEach(u => {
    console.log(`- ${u.username} (ID: ${u.id})`);
  });
  
  await app.close();
}

bootstrap().catch(err => {
  console.error(err);
  process.exit(1);
});
