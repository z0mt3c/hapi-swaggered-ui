'use strict'

const path = require('path')
const Hoek = require('hoek')
const swaggerUiPath = require('swagger-ui/index').dist
const Joi = require('joi')
const packageInfo = require('../package.json')

const optionsSchema = Joi.object({
  title: Joi.string().required(),
  defaultTags: Joi.array().items(Joi.string()).optional(),
  path: Joi.string().optional(),
  basePath: Joi.string().optional(),
  swaggerEndpoint: Joi.string().optional(),
  swaggerOptions: Joi.object({
    booleanValues: Joi.array().items(Joi.any()).optional(),
    validatorUrl: Joi.string().allow(null, false).optional(),
    docExpansion: Joi.string().allow(null).valid(['none', 'list', 'full']).optional(),
    defaultModelRendering: Joi.string().allow(null).valid(['model', 'schema']).optional(),
    apisSorter: Joi.string().allow(null).valid(['none', 'alpha']).optional(),
    operationsSorter: Joi.string().allow(null).valid(['none', 'alpha', 'method']).optional(),
    highlightSizeThreshold: Joi.number().optional(),
    supportedSubmitMethods: Joi.array().items(Joi.string()).optional(),
    oauth2RedirectUrl: Joi.string().optional(),
    showRequestHeaders: Joi.boolean().optional(),
    jsonEditor: Joi.boolean().optional()
  }).optional(),
  oauthOptions: Joi.any(),
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
  templates: Joi.string().optional()
})

const defaultOptions = {
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

exports.register = (plugin, options, next) => {
  const settings = Hoek.applyToDefaults(defaultOptions, options || {}, true)
  Joi.assert(settings, optionsSchema, 'Invalid options for hapi-swaggered-ui')

  const routeModifiers = plugin.config || Hoek.reach(plugin, 'realm.modifiers')
  let routePrefix = Hoek.reach(routeModifiers, 'route.prefix') || ''

  if (settings.basePath != null) {
    routePrefix = settings.basePath + routePrefix
  }

  if (settings.path != null) {
    routePrefix = routePrefix + settings.path
  }

  const internals = {
    handler (request, reply) {
      const hapiSwaggeredSettings = Hoek.reach(plugin, 'plugins.hapi-swaggered.settings')
      let swaggerEndpoint = null

      if (settings.swaggerEndpoint) {
        swaggerEndpoint = options.swaggerEndpoint
      } else if (hapiSwaggeredSettings && hapiSwaggeredSettings.endpoint) {
        swaggerEndpoint = (hapiSwaggeredSettings.pluginRoutePrefix || '') + hapiSwaggeredSettings.endpoint

        if (settings.basePath != null) {
          swaggerEndpoint = settings.basePath + swaggerEndpoint
        }
      }
      const context = {
        routePrefix: routePrefix,
        title: settings.title,
        authorization: settings.authorization,
        version: packageInfo.version
      }

      if (swaggerEndpoint) {
        let swaggerOptions = {
          url: swaggerEndpoint
        }

        let tags = null

        if (request.query.tags) {
          tags = request.query.tags
        } if (settings.defaultTags) {
          tags = Array.isArray(settings.defaultTags) ? settings.defaultTags.join(',') : settings.defaultTags
        }

        if (tags) {
          swaggerOptions.url = `${swaggerEndpoint}?tags=${encodeURIComponent(tags)}`
        }

        if (settings.basePath != null) {
          swaggerOptions.basePath = settings.basePath
        }

        Object.assign(swaggerOptions, settings.swaggerOptions)

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

  const routePath = settings.path || ''

  plugin.route([settings.path || '/', `${routePath}/index.html`].map((path) => {
    return {
      method: 'GET',
      path: path,
      config: {
        handler: internals.handler,
        auth: settings.auth
      }
    }
  }))

  plugin.route([`${routePath}/{path}`, `${routePath}/{path*2}`].map((path) => {
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

exports.register.attributes = {
  pkg: packageInfo,
  multiple: true,
  dependencies: ['vision', 'inert']
}
