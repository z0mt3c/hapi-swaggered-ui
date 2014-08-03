var path = require('path');

module.exports.register = function (plugin, options, next) {
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
            handler: function (request, reply) {
                var hapiSwaggered = plugin.plugins['hapi-swaggered'].settings;

                var context = {
                    routePrefix: (plugin.config.route.prefix || ''),
                    swaggerEndpoint: (hapiSwaggered.pluginRoutePrefix || '') + hapiSwaggered.endpoint
                };

                reply.view('index', context);
            }
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
                        path.join(__dirname, '../node_modules/swagger-ui/dist')
                    ],
                    index: true,
                    listing: false
                }
            }
        }
    });

    next();
};

module.exports.register.attributes = {
    pkg: require('../package.json')
};