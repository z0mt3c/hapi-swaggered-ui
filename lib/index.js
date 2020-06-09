'use strict'
const path = require('path')
const Hoek = require('@hapi/hoek')
const swaggerUiPath = require('swagger-ui-dist').getAbsoluteFSPath()
const Joi = require('@hapi/joi')
const packageInfo = require('../package.json')
const _ = require('lodash')

const optionsSchema = Joi.object({
  title: Joi.string().required(),
  defaultTags: Joi.array().items(Joi.string()).optional(),
  path: Joi.string().optional(),
  basePath: Joi.string().optional(),
  swaggerEndpoint: Joi.string().optional(),
  swaggerOptions: Joi.object({
    validatorUrl: Joi.string().allow(null, false).optional(),
    docExpansion: Joi.string().allow(null).valid('none', 'list', 'full').optional(),
    oauth2RedirectUrl: Joi.string().optional(),
    configUrl: Joi.string().optional(),
    displayOperationId: Joi.boolean().optional(),
    displayRequestDuration: Joi.boolean().optional(),
    filter: Joi.string().allow(null, true, false).optional(),
    deepLinking: Joi.boolean().optional(),
    maxDisplayedTags: Joi.number().integer().positive().optional(),
    // the following can be functions
    tagsSorter: Joi.alternatives(Joi.func(), Joi.string().allow(null).valid('none', 'alpha')).optional(),
    operationsSorter: Joi.alternatives(Joi.func(), Joi.string().allow(null).valid('none', 'alpha', 'method')).optional(),
    // the following must be functions
    parameterMacro: Joi.func().optional(),
    modelPropertyMacro: Joi.func().optional()
  }).optional(),
  oauthOptions: Joi.any(),
  authorization: Joi.alternatives(
    Joi.any().valid(null, false),
    Joi.object({
      field: Joi.string().required(),
      scope: Joi.string().valid('query', 'header').required(),
      valuePrefix: Joi.string().optional(),
      defaultValue: Joi.string().optional(),
      placeholder: Joi.string().optional()
    }).optional()
  ),
  auth: Joi.alternatives([
    Joi.string(),
    Joi.object({
      mode: Joi.string().valid('required', 'optional', 'try'),
      scope: Joi.alternatives(Joi.string(), Joi.array()).allow(false),
      entity: Joi.string().valid('user', 'app', 'any'),
      strategy: Joi.string(),
      strategies: Joi.array().min(1),
      payload: [Joi.string().valid('required', 'optional'), Joi.boolean()]
    })
  ]).allow(false),
  templates: Joi.string().optional()
})

const defaultOptions = {
  title: 'swagger',
  swaggerOptions: {
    tagsSorter: 'alpha',
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

module.exports = {
  register,
  pkg: packageInfo,
  multiple: true,
  dependencies: ['@hapi/vision', '@hapi/inert']
}

function register (plugin, options) {
  const settings = Hoek.applyToDefaults(defaultOptions, options || {}, { nullOverride: true })
  Joi.assert(settings, optionsSchema, 'Invalid options for hapi-swaggered-ui')

  const routeModifiers = plugin.config || _.get(plugin, 'realm.modifiers')
  let routePrefix = _.get(routeModifiers, 'route.prefix') || ''

  if (settings.basePath != null) {
    routePrefix = settings.basePath + routePrefix
  }

  if (settings.path != null) {
    routePrefix = routePrefix + settings.path
  }

  const internals = {
    handler (request, h) {
      const hapiSwaggeredSettings = _.get(plugin, 'plugins.hapi-swaggered.settings')
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
        const swaggerOptions = {
          url: swaggerEndpoint
        }

        let tags = null

        if (request.query.tags) {
          tags = request.query.tags
        }

        if (settings.defaultTags) {
          tags = Array.isArray(settings.defaultTags) ? settings.defaultTags.join(',') : settings.defaultTags
        }

        if (tags) {
          swaggerOptions.url = `${swaggerEndpoint}?tags=${encodeURIComponent(tags)}`
        }

        if (settings.basePath != null) {
          swaggerOptions.basePath = settings.basePath
        }

        Object.assign(swaggerOptions, settings.swaggerOptions)

        var swaggerFunctions =
          '{' +
          _.reduce(
            swaggerOptions,
            function (memo, value, key) {
              if (_.isFunction(value)) {
                delete swaggerOptions[key]
                memo.push('\n' + JSON.stringify(key) + ':' + value.toString())
              }

              return memo
            },
            []
          ).join(',\n') +
          '}'

        context.swaggerOptions = JSON.stringify(swaggerOptions) + ',' + swaggerFunctions
        context.oauthOptions = JSON.stringify(settings.oauthOptions || false)
        return h.view('index', context)
      }

      return h.view('error', context)
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

  plugin.route(
    [settings.path || '/', `${routePath}/index.html`].map((path) => {
      return {
        method: 'GET',
        path: path,
        options: {
          handler: internals.handler,
          auth: settings.auth
        }
      }
    })
  )

  plugin.route(
    [`${routePath}/{path}`, `${routePath}/{path*2}`].map((path) => {
      return {
        method: 'GET',
        path: path,
        options: {
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
    })
  )
}
