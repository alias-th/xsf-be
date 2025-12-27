.PHONY: compose-up compose-down

compose-up:
	docker compose up -d --build

compose-down:
	docker compose down

