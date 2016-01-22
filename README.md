# hapi-swaggered-ui
Easy swagger-ui drop-in plugin for hapi to be used with [hapi-swaggered](https://github.com/z0mt3c/hapi-swaggered).

Supports hapi 10.x and up

[![Build Status](https://img.shields.io/travis/z0mt3c/hapi-swaggered-ui/master.svg)](https://travis-ci.org/z0mt3c/hapi-swaggered-ui)
[![Dependency Status](https://img.shields.io/gemnasium/z0mt3c/hapi-swaggered-ui.svg)](https://gemnasium.com/z0mt3c/hapi-swaggered-ui)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)
[![npm downloads](https://img.shields.io/npm/dm/hapi-swaggered-ui.svg)](https://www.npmjs.com/package/hapi-swaggered-ui)

## Install
```bash
npm install hapi-swaggered-ui
```

## Configuration
* `title`: string, title of swagger ui
* `path`: string, optional path where the docs should be located at (e.g. '/docs', defaults to: null)
* `basePath`: string, optional url base path (e.g. used to fix reverse proxy routes)
* `swaggerEndpoint`: Override the auto-detection of [hapi-swaggered](https://github.com/z0mt3c/hapi-swaggered) with a specific URL. (not recommended in use with hapi-swaggered; optional)
* `swaggerOptions`: object (according to [swagger-ui](https://github.com/swagger-api/swagger-ui#parameters))
  * `apisSorter`: Apply a sort to the API list. It can be 'alpha' (sort paths alphanumerically) or null (server side sorting).
  * `operationsSorter`: Apply a sort to the operation list of each API. It can be 'alpha' (sort by paths alphanumerically), 'method' (sort by HTTP method) or null (server side sorting).
  * `docExpansion`: Controls how the API listing is displayed. It can be set to 'none' (default), 'list' (shows operations for each resource), or 'full' (fully expanded: shows operations and their details).
  * `supportedSubmitMethods`: Routes which differ will be listed as readonly - default: ['get', 'post', 'put', 'patch', 'delete', 'head']
  * `highlightSizeThreshold`: Any size response below this threshold will be highlighted syntactically, attempting to highlight large responses can lead to browser hangs, not including a threshold will default to highlight all returned responses.
  * `validatorUrl`: By default, Swagger-UI attempts to validate specs against swagger.io's online validator (disabled for localhost). You can use this parameter to set a different validator URL, for example for locally deployed validators (Validator Badge). Setting it to false will disable validation. This parameter is relevant for Swagger 2.0 specs only.
* `authorization`: object - can be null or false to disable authorization through swagger-ui (e.g. in case of public apis without auth)
  * `scope`: string, 'query' or 'header'
  * `field`: string, name of the field
  * `valuePrefix`: string, prefix fields value (e.g. with 'bearer ')
  * `defaultValue`: string, default value of the api-key field
  * `placeholder`: string, placeholder of the api-key field
* `auth`: object, auth options as specified in [route options (hapi docs)](https://github.com/hapijs/hapi/blob/master/API.md#route-options), will be applied to all registered plugin routes
* `defaultTags`:  array of strings, will be passed to the specs endpoint through the query param 'tags' ([hapi-swaggered feature: tag filtering](https://github.com/z0mt3c/hapi-swaggered#tag-filtering))

## Example
Since [hapi-swaggered](https://github.com/z0mt3c/hapi-swaggered) exposes its plugin configuration hapi-swaggered-ui should find it's swagger endpoint automatically. In case you want to use hapi-swaggered-ui without hapi-swaggered (or the auto-detection doesn't work) you can manually set the swagger endpoint by the swaggerEndpoint option. In addition the page title can be changed through the option title.

  Note: Hapi v8.x.x shipped with the `vision` and `inert` plugins already registered with the `server`, but have been removed in Hapi v9.x.x so require manual plugin registration before `hapi-swaggered-ui` as shown below.

```js
server.register([
  require('inert'),
  require('vision'),
  {
    register: require('hapi-swaggered-ui'),
    options: {
      title: 'Example API',
      path: '/docs',
      authorization: { // see above
        field: 'apiKey',
        scope: 'query', // header works as well
        // valuePrefix: 'bearer '// prefix incase
        defaultValue: 'demoKey',
        placeholder: 'Enter your apiKey here'
      },
      swaggerOptions: {} // see above
    }
  }], {
    select: 'api'
  }, function (err) {
  if (err) {
    throw err
  }
})
```

May have a look at the example listed at https://github.com/z0mt3c/hapi-swaggered
