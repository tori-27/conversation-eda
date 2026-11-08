import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import {
  ConfigValidationError,
  loadConfig,
  type AppConfig,
} from './config/env.js';

function loadConfigOrExit(): AppConfig {
  try {
    return loadConfig();
  } catch (error) {
    if (error instanceof ConfigValidationError) {
      console.error(
        `\n${error.message}\n\nCheck your .env (see .env.example).\n`,
      );
      process.exit(1);
    }
    throw error;
  }
}

async function bootstrap(): Promise<void> {
  const config = loadConfigOrExit();
  const app = await NestFactory.create(AppModule.forRoot(config));
  app.enableShutdownHooks();
  await app.listen(config.PORT);
}

await bootstrap();
