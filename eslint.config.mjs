// @ts-check
import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

/**
 * Hexagonal guard: domain code must not depend on frameworks, drivers,
 * or outer layers. Applies to every file under any `domain/` folder.
 */
const domainBoundary = {
  files: ['**/domain/**/*.ts'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: [
              '@nestjs/*',
              '@confluentinc/*',
              'pg',
              'pg/*',
              'kysely',
              'kysely/*',
              'kafkajs',
              'kafkajs/*',
              'amqplib',
              'amqplib/*',
            ],
            message:
              'Domain must stay framework- and infrastructure-free. Move this dependency to application/ or infrastructure/.',
          },
          {
            group: [
              '**/infrastructure',
              '**/infrastructure/**',
              '**/application',
              '**/application/**',
            ],
            message:
              'Domain must not depend on outer layers (application/infrastructure). Invert the dependency with a port defined in domain/.',
          },
        ],
      },
    ],
  },
};

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      'consumers/analytics/**',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['eslint.config.mjs'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.mjs', '**/*.js'],
    ...tseslint.configs.disableTypeChecked,
  },
  domainBoundary,
  prettier,
);
