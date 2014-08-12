# hapi-swaggered-ui
Easy swagger-ui drop-in plugin for hapi to be used with [hapi-swaggered](https://github.com/z0mt3c/hapi-swaggered). 

## Install
Through npm...

```bash
npm install hapi-swaggered-ui
```

## Example Configuration
Since [hapi-swaggered](https://github.com/z0mt3c/hapi-swaggered) exposes its plugin configuration hapi-swaggered-ui should find it's swagger endpoint automatically. So basically no configuration is required.

In case you want to use hapi-swaggered-ui without hapi-swaggered (or the auto-detection doesn't work) you can manually set the swagger endpoint by the swaggerEndpoint option. In addition the page title can be changed through the option title.

```js
'hapi-swaggered-ui': [
    {
        select: 'api',
        route: {
            prefix: '/docs'
        },
        options: {
            title: 'Page Title',
            // swaggerEndpoint is optional if hapi-swaggered-ui is used on the same server
            swaggerEndpoint: 'http://localhost:123/swagger/api-docs',
            // authorization is optional
            authorization: {
                field: 'Authorization',
                scope: 'header',
                valuePrefix: 'bearer '
            }
        }
    }
]
```
