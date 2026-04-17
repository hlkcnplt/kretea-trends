.PHONY: dev api worker build-api

dev:
	$(MAKE) api & $(MAKE) worker

api:
	cd api && mvn spring-boot:run

worker:
	cd worker && npm run dev

build-api:
	cd api && mvn clean package -DskipTests
