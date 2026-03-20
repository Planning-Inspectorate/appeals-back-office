serve:
	docker compose --profile all up
.PHONY: serve

database:
	docker compose --profile initial-setup up
.PHONY: database
