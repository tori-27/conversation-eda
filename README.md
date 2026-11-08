# conversations-eda

A learning project for event-driven architecture. A NestJS **Conversations** service owns
the write side and publishes domain events reliably. It moves from naive CRUD through
aggregates with optimistic locking to a transactional outbox, relayed first by a polling
publisher and then by Debezium's outbox event router into Kafka. Downstream consumers are a
TypeScript agent dashboard and a Python analytics service. Both are idempotent and can
replay events. A final phase builds the same flow on RabbitMQ to compare a log with a queue.
Tools in `tools/` inject faults (`chaos`) and verify end-to-end invariants (`checker`).

## Layout

```
services/conversations/    NestJS service (domain / application / infrastructure / relay)
consumers/agent-dashboard/ TypeScript consumer
consumers/analytics/       Python consumer (uv + ruff)
tools/chaos/               fault injection
tools/checker/             invariant checker
connect/                   Kafka Connect / Debezium config (later)
```

## Getting started

Prerequisites: Node 22 (`nvm use`), pnpm 10 (`corepack enable`), [uv](https://docs.astral.sh/uv/),
Docker.

```bash
nvm use
make install          # pnpm + uv deps, creates .env from .env.example
make check            # lint + typecheck + test (TS) and ruff (Python)
make dev              # Nest in watch mode
curl localhost:3000/health   # -> {"status":"ok"}
```

Other packages:

```bash
pnpm --filter @conversations-eda/agent-dashboard start
pnpm --filter @conversations-eda/chaos start
pnpm --filter @conversations-eda/checker start
uv --directory consumers/analytics run --env-file ../../.env analytics
```

Run `make help` to see every target. `up`, `down`, `logs`, `psql` and `topic-create` wrap
`docker compose`. They need a `docker-compose.yml` with `postgres` and `kafka` services,
which is not written yet.

## Configuration

Every package reads the root `.env`. The service validates it with zod at startup and exits
with a readable error if anything is missing or invalid:

```
Invalid environment configuration:
  - DATABASE_URL: Invalid input: expected string, received undefined
```

## Architecture guard

ESLint forbids these imports in any `**/domain/**` file: `@nestjs/*`, `pg`, `kysely`,
`kafkajs`, `@confluentinc/*`, `amqplib`, and anything from `application/` or
`infrastructure/`.

<!--
Example violation — services/conversations/src/conversations/domain/conversation.ts:

  import { Injectable } from '@nestjs/common';
  import { PgConversationRepo } from '../infrastructure/pg-conversation.repo';

`make lint` output:

  1:1  error  '@nestjs/common' import is restricted from being used by a pattern.
              Domain must stay framework- and infrastructure-free. Move this dependency
              to application/ or infrastructure/                          no-restricted-imports
  2:1  error  '../infrastructure/pg-conversation.repo' import is restricted from being used
              by a pattern. Domain must not depend on outer layers (application/infrastructure).
              Invert the dependency with a port defined in domain/        no-restricted-imports
-->

## Roadmap

- [ ] 0. Infrastructure: Postgres, Kafka, Kafka Connect via docker compose
- [ ] 1. Naive CRUD, reproducing dual-write and race-condition bugs
- [ ] 2. Aggregate with optimistic locking
- [ ] 3. Transactional outbox and polling relay
- [ ] 4. Debezium outbox event router
- [ ] 5. Consumers with idempotency and replay
- [ ] 6. RabbitMQ contrast
