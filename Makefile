.PHONY: dev dev-backend dev-frontend

dev-backend:
	ENVIRONMENT=development go run main.go

dev-frontend:
	cd frontend && npm run dev

dev:
	$(MAKE) dev-backend & $(MAKE) dev-frontend
