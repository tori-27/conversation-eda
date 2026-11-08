# Load .env (if present) so infra targets can use KAFKA_TOPIC, DATABASE_URL, ...
-include .env

KAFKA_TOPIC ?= conversations.events
DATABASE_URL ?= postgres://app:app@localhost:5432/conversations
COMPOSE ?= docker compose
ANALYTICS_DIR := consumers/analytics
UV := uv --directory $(ANALYTICS_DIR)

.DEFAULT_GOAL := help
.PHONY: help install dev lint format typecheck test check up down logs psql topic-create

help: ## List available targets
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z0-9_-]+:.*?## / {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

## --- Development -----------------------------------------------------------

install: ## Install Node (pnpm) and Python (uv) dependencies; create .env if missing
	pnpm install --frozen-lockfile
	$(UV) sync --frozen
	@test -f .env || (cp .env.example .env && echo "Created .env from .env.example")

dev: ## Run the conversations service (NestJS) in watch mode
	pnpm --filter @conversations-eda/conversations start:dev

lint: ## Lint TS (eslint + prettier --check) and Python (ruff)
	pnpm lint
	$(UV) run ruff check
	$(UV) run ruff format --check

format: ## Format TS (prettier) and Python (ruff)
	pnpm format
	$(UV) run ruff check --fix
	$(UV) run ruff format

typecheck: ## Type-check all TS packages
	pnpm typecheck

test: ## Run TS tests (jest)
	pnpm test

check: lint typecheck test ## Lint + typecheck + test (TS) and ruff (Python)

## --- Infrastructure (wraps docker compose; compose file not included yet) ---

up: ## Start infrastructure containers in the background
	$(COMPOSE) up -d

down: ## Stop and remove infrastructure containers
	$(COMPOSE) down

logs: ## Follow logs of infrastructure containers
	$(COMPOSE) logs -f

psql: ## Open psql inside the postgres container
	$(COMPOSE) exec postgres psql "$(DATABASE_URL)"

topic-create: ## Create the Kafka topic $(KAFKA_TOPIC) (6 partitions)
	$(COMPOSE) exec kafka kafka-topics.sh --bootstrap-server localhost:9092 \
		--create --topic $(KAFKA_TOPIC) --partitions 6 --replication-factor 1
