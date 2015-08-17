var path = require('path')
var Hoek = require('hoek')
var _ = require('lodash')
var swaggerUiPath = require('swagger-ui/index').dist
var Joi = require('joi')
var packageInfo = require('../package.json')

var optionsSchema = Joi.object({
  title: Joi.string().required(),
  path: Joi.string().optional(),
  basePath: Joi.string().optional(),
  swaggerEndpoint: Joi.string().optional(),
  swaggerOptions: Joi.object({
    booleanValues: Joi.array().items(Joi.any()).optional(),
    validatorUrl: Joi.string().allow(null, false).optional(),
    docExpansion: Joi.string().allow(null).valid(['none', 'list', 'full']).optional(),
    apisSorter: Joi.string().allow(null).valid(['none', 'alpha']).optional(),
    operationsSorter: Joi.string().allow(null).valid(['none', 'alpha', 'method']).optional(),
    highlightSizeThreshold: Joi.number().optional(),
    supportedSubmitMethods: Joi.array().items(Joi.string()).optional(),
    oauth2RedirectUrl: Joi.string().optional(),
    showRequestHeaders: Joi.boolean().optional()
  }).optional(),
  oauthOptions: Joi.any({}),
  authorization: Joi.alternatives([Joi.any().valid([null, false]), Joi.object({
    field: Joi.string().required(),
    scope: Joi.string().valid(['query', 'header']).required(),
    valuePrefix: Joi.string().optional(),
    defaultValue: Joi.string().optional(),
    placeholder: Joi.string().optional()
  }).optional()]),
  auth: Joi.alternatives([
    Joi.string(),
    Joi.object({
      mode: Joi.string().valid('required', 'optional', 'try'),
      scope: Joi.alternatives([
        Joi.string(),
        Joi.array()
      ]).allow(false),
      entity: Joi.string().valid('user', 'app', 'any'),
      strategy: Joi.string(),
      strategies: Joi.array().min(1),
      payload: [
        Joi.string().valid('required', 'optional'),
        Joi.boolean()
      ]
    })
  ]).allow(false),
  templates: Joi.string().optional(),
  skipDependencies: Joi.boolean().optional()
})

var defaultOptions = {
  title: 'swagger',
  swaggerOptions: {
    supportedSubmitMethods: ['head', 'get', 'post', 'put', 'patch', 'delete'],
    apisSorter: 'alpha',
    operationsSorter: 'alpha',
    docExpansion: 'none'
  },
  templates: path.join(__dirname, '../templates'),
  authorization: {
    field: 'api_key',
    scope: 'query',
    valuePrefix: undefined,
    defaultValue: undefined,
    placeholder: undefined
  }
}

var doRegister = function (plugin, options, next) {
  var settings = Hoek.applyToDefaults(defaultOptions, options || {}, true)
  Joi.assert(settings, optionsSchema, 'Invalid options for hapi-swaggered-ui')

  var routeModifiers = plugin.config || Hoek.reach(plugin, 'realm.modifiers')
  var routePrefix = Hoek.reach(routeModifiers, 'route.prefix') || ''

  if (settings.basePath != null) {
    routePrefix = settings.basePath + routePrefix
  }

  if (settings.path != null) {
    routePrefix = routePrefix + settings.path
  }

  var internals = {
    handler: function (request, reply) {
      var hapiSwaggeredSettings = Hoek.reach(plugin, 'plugins.hapi-swaggered.settings')
      var swaggerEndpoint = null

      if (settings.swaggerEndpoint) {
        swaggerEndpoint = options.swaggerEndpoint
      } else if (hapiSwaggeredSettings && hapiSwaggeredSettings.endpoint) {
        swaggerEndpoint = (hapiSwaggeredSettings.pluginRoutePrefix || '') + hapiSwaggeredSettings.endpoint

        if (settings.basePath != null) {
          swaggerEndpoint = settings.basePath + swaggerEndpoint
        }
      }
      var context = {
        routePrefix: routePrefix,
        title: settings.title,
        authorization: settings.authorization,
        version: packageInfo.version
      }

      if (swaggerEndpoint) {
        var swaggerOptions = {
          url: swaggerEndpoint
        }

        var tags = null

        if (request.query.tags) {
          tags = request.query.tags
        } if (settings.defaultTags) {
          tags = _.isArray(settings.defaultTags) ? settings.defaultTags.join(',') : settings.defaultTags
        }

        if (tags) {
          swaggerOptions.url = swaggerEndpoint + '?tags=' + encodeURIComponent(tags)
        }

        if (settings.basePath != null) {
          swaggerOptions.basePath = settings.basePath
        }

        _.extend(swaggerOptions, settings.swaggerOptions)

        context.swaggerOptions = JSON.stringify(swaggerOptions)
        context.oauthOptions = JSON.stringify(settings.oauthOptions || false)
        return reply.view('index', context)
      } else {
        return reply.view('error', context)
      }
    }
  }

  plugin.views({
    engines: {
      hbs: {
        module: require('handlebars')
      }
    },
    relativeTo: __dirname,
    path: settings.templates
  })

  var routePath = settings.path || ''

  plugin.route(_.map([settings.path || '/', routePath + '/index.html'], function (path) {
    return {
      method: 'GET',
      path: path,
      config: {
        handler: internals.handler,
        auth: settings.auth
      }
    }
  }))

  plugin.route(_.map([routePath + '/{path}', routePath + '/{path*2}'], function (path) {
    return {
      method: 'GET',
      path: path,
      config: {
        handler: {
          directory: {
            path: swaggerUiPath,
            index: false,
            listing: false
          }
        },
        auth: settings.auth
      }
    }
  }))

  next()
}

exports.register = function (server, options, next) {
  var hapi8 = /^8\./.test(server.version)

  if (hapi8 || options.skipDependencies === true) {
    return doRegister(server, options, next)
  }

  server.dependency(['vision', 'inert'], function (server, next) {
    doRegister(server, options, next)
  })

  return next()
}

exports.register.attributes = {
  pkg: packageInfo,
  multiple: true
}
