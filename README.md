# hapi-swaggered-ui
Easy swagger-ui drop-in plugin for hapi to be used with [hapi-swaggered](https://github.com/z0mt3c/hapi-swaggered).

Supports hapi 7.x and 8.x

## Install
```bash
npm install hapi-swaggered-ui
```

## Configuration
* `title`: string, title of swagger ui
* `swaggerEndpoint`: Override the auto-detection of [hapi-swaggered](https://github.com/z0mt3c/hapi-swaggered) with a specific URL. (not recommended in use with hapi-swaggered; optional)
* `swaggerOptions`: object
  * `sorter`: Apply a sort to the API list. It can be 'alpha' (sort paths alphanumerically) or 'method' (sort operations by HTTP method). Default is the order returned by the server unchanged.
  * `docExpansion`: Controls how the API listing is displayed. It can be set to 'none' (default), 'list' (shows operations for each resource), or 'full' (fully expanded: shows operations and their details).
  * `supportedSubmitMethods`: Routes which differ will be listed as readonly - default: ['get', 'post', 'put', 'patch', 'delete']
* `authorization`: object
  * `scope`: string, 'query' or 'header'
  * `field`: string, name of the field
  * `valuePrefix`: string, prefix fields value (e.g. with 'bearer ')
  * `defaultValue`: string, default value of the api-key field
  * `placeholder`: string, placeholder of the api-key field


## Example
Since [hapi-swaggered](https://github.com/z0mt3c/hapi-swaggered) exposes its plugin configuration hapi-swaggered-ui should find it's swagger endpoint automatically. In case you want to use hapi-swaggered-ui without hapi-swaggered (or the auto-detection doesn't work) you can manually set the swagger endpoint by the swaggerEndpoint option. In addition the page title can be changed through the option title.

```js
var hapiSwaggeredUi = require('hapi-swaggered-ui');

server.register({
	register: hapiSwaggeredUi,
	options: {
		title: 'Example API',
		swaggerOptions: {}, // see above
		authorization: { // see above
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

May have a look at the example listed at https://github.com/z0mt3c/hapi-swaggered
