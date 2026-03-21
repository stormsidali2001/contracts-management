import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed.module';
import { SeedService } from './seed.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeedModule, {
    logger: ['error', 'warn', 'log'],
  });

  const seed = app.get(SeedService);
  const command = process.argv[2];
  const count = parseInt(process.argv[3] ?? '1', 10);

  switch (command) {
    case 'directions':
      await seed.seedDirections();
      break;
    case 'vendors':
      await seed.seedVendors(count);
      break;
    case 'users':
      await seed.seedUsers(count);
      break;
    case 'agreements':
      await seed.seedAgreements(count);
      break;
    case 'accounts':
      await seed.seedAccounts();
      break;
    case 'all':
      await seed.seedDirections();
      await seed.seedAccounts();
      await seed.seedVendors(count);
      await seed.seedUsers(count);
      await seed.seedAgreements(count);
      break;
    default:
      console.error(`Unknown command: "${command}"`);
      console.log('Usage: seed <command> [count]');
      console.log(
        'Commands: directions | vendors | users | agreements | accounts',
      );
  }

  // Allow async event handlers (notifications, stats) to finish before teardown
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await app.close();
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
