# Use docker compose v2 command
DC := docker compose

.PHONY: help up build rebuild down clean reset logs ps backend-logs db-logs db-shell db-url

help:
	@echo "Targets:"
	@echo "  make up           Start services (build if needed)"
	@echo "  make build        Build images"
	@echo "  make rebuild      Force rebuild (no cache) + restart"
	@echo "  make down         Stop services"
	@echo "  make clean        Stop + remove containers (keep volume)"
	@echo "  make reset        Stop + remove containers + remove volumes (WIPES DB)"
	@echo "  make logs         Follow all logs"
	@echo "  make ps           List running services"
	@echo "  make backend-logs  Follow backend logs"
	@echo "  make db-logs       Follow db logs"
	@echo "  make db-shell      Open psql inside the db container"

up:
	$(DC) up -d --build

build:
	$(DC) build

rebuild:
	$(DC) down
	$(DC) build --no-cache
	$(DC) up -d

down:
	$(DC) down

clean:
	$(DC) down --remove-orphans

reset:
	$(DC) down -v --remove-orphans

logs:
	$(DC) logs -f --tail=200

ps:
	$(DC) ps

backend-logs:
	$(DC) logs -f --tail=200 backend

db-logs:
	$(DC) logs -f --tail=200 db

db-shell:
	docker exec -it pub-db psql -U $$POSTGRES_USER -d $$POSTGRES_DB