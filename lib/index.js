var path = require('path');
var Hoek = require('hoek');
var path = require('path');
var swaggerUiPath = path.dirname(require.resolve('swagger-ui'));

var defaultOptions = {
    title: 'swagger'
};

exports.register = function (plugin, options, next) {
    var settings = Hoek.applyToDefaults(defaultOptions, options || {});
    var routePrefix = Hoek.reach(plugin, 'config.route.prefix');

    var internals = {
        extractBaseHost: function (settings, request) {
            var protocol = settings.protocol || Hoek.reach(request, 'server.info.protocol') || 'http';
            var hostname = protocol + '://' + (settings.host || request.headers.host || 'localhost');
            return hostname;
        },
        handler: function (request, reply) {
            var hapiSwaggeredSettings = Hoek.reach(plugin, 'plugins.hapi-swaggered.settings');
            var swaggerEndpoint = null;

            if (settings.swaggerEndpoint) {
                swaggerEndpoint = options.swaggerEndpoint;
            } else if (hapiSwaggeredSettings && hapiSwaggeredSettings.endpoint) {
                swaggerEndpoint = internals.extractBaseHost(settings, request) + (hapiSwaggeredSettings.pluginRoutePrefix || '') + hapiSwaggeredSettings.endpoint;
            }

            var context = {
                routePrefix: routePrefix,
                title: settings.title
            };

            if (swaggerEndpoint) {
                context.swaggerEndpoint = swaggerEndpoint;
                return reply.view('index', context);
            } else {
                return reply.view('error', context);
            }
        }
    };

    plugin.views({
        engines: {
            hbs: {
                module: require('handlebars')
            }
        },
        path: path.join(__dirname, '../templates')
    });

    plugin.route({
        method: 'GET',
        path: '/',
        config: {
            handler: internals.handler
        }
    });

    plugin.route({
        method: 'GET',
        path: '/index.html',
        config: {
            handler: internals.handler
        }
    });

    plugin.route({
        method: 'GET',
        path: '/{path*}',
        config: {
            handler: {
                directory: {
                    path: [
                        path.join(__dirname, '../public'),
                        path.join(swaggerUiPath, 'dist')
                    ],
                    index: true,
                    listing: false
                }
            }
        }
    });

    next();
};

exports.register.attributes = {
    pkg: require('../package.json')
};