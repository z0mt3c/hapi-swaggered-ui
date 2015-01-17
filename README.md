# hapi-swaggered-ui
Easy swagger-ui drop-in plugin for hapi to be used with [hapi-swaggered](https://github.com/z0mt3c/hapi-swaggered).

## Install
```bash
npm install hapi-swaggered-ui
```

## Configuration
* `title`: string, title of swagger ui
* `authorization`: object
  * `scope`: string, 'query' or 'header'
  * `field`: string, name of the field
  * `valuePrefix`: string, prefix fields value (e.g. with 'bearer ')

## Example
Since [hapi-swaggered](https://github.com/z0mt3c/hapi-swaggered) exposes its plugin configuration hapi-swaggered-ui should find it's swagger endpoint automatically. In case you want to use hapi-swaggered-ui without hapi-swaggered (or the auto-detection doesn't work) you can manually set the swagger endpoint by the swaggerEndpoint option. In addition the page title can be changed through the option title.

```js
var hapiSwaggeredUi = require('hapi-swaggered-ui');

server.register({
	register: hapiSwaggeredUi,
	options: {
		title: 'Example API',
		authorization: {
			field: 'apiKey',
			scope: 'query' // header works as well
			// valuePrefix: 'bearer '// prefix incase
		}
	}
}, {
	select: 'api',
	routes: {
		prefix: '/docs'
	}
}, function(err) {
	if (err) {
		throw err;
	}
});
```

May have a look at https://github.com/z0mt3c/hapi-swaggered-demo
