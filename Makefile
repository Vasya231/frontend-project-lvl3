all: install

install: 
	npm install

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