all: install

install: 
	npm install

build:
	rm -rf dist
	NODE_ENV=production npx webpack

lint:
	npx eslint .

lintfix:
	npx eslint . --fix

test:
	npm test

coverage:
	npx jest --coverage

watch:
	npx jest --watch