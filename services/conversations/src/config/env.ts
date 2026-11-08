import { z } from 'zod';

const nonNegativeNumber = z.coerce.number().nonnegative().default(0);

const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.url(),
  KAFKA_BROKERS: z.string().min(1),
  KAFKA_TOPIC: z.string().min(1),
  RACE_DELAY_MS: nonNegativeNumber,
  FAIL_RATE: nonNegativeNumber.pipe(z.number().max(1)),
  PUBLISH_JITTER_MS: nonNegativeNumber,
});

export type AppConfig = z.infer<typeof envSchema>;

export class ConfigValidationError extends Error {
  override readonly name = 'ConfigValidationError';
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    const lines = result.error.issues.map(
      (issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`,
    );
    throw new ConfigValidationError(
      `Invalid environment configuration:\n${lines.join('\n')}`,
    );
  }
  return result.data;
}
