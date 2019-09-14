test-ci:
	yarn --no-lockfile
	make test

local-all:
	make clean
	make bootstrap
	make build
	make lint
	make test

bootstrap:
	npm install --no-package-lock --no-audit
	./node_modules/.bin/lerna bootstrap

build:
	./node_modules/.bin/lerna run build

clean:
	./node_modules/.bin/lerna clean --yes

test:
	./node_modules/.bin/lerna run test

karma:
	./node_modules/.bin/lerna run karma --concurrency 1

lint:
	./node_modules/.bin/lerna run lint
