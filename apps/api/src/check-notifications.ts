import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UserNotificationService } from './user/application/user-notification.service';
import { UserService } from './user/application/user.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userService = app.get(UserService);
  const notificationService = app.get(UserNotificationService);
  
  const user = await userService.findByEmailOrUsername({ email: '', username: 'juridical.adala' });
  if (!user) {
    console.log('User juridical.adala not found');
  } else {
    const notifications = await notificationService.getUserNotifications(user.id);
    console.log(`Found ${notifications.length} notifications for juridical.adala:`);
    notifications.slice(-5).forEach(n => {
      console.log(`- [${n.createdAt}] ${n.message} (Read: ${n.isRead})`);
    });
  }
  
  await app.close();
}

bootstrap().catch(err => {
  console.error(err);
  process.exit(1);
});
