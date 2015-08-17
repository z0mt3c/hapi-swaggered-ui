var Hapi = require('hapi')
var Code = require('code')
var Lab = require('lab')
var lab = exports.lab = Lab.script()
var inert = require('inert')
var vision = require('vision')

var describe = lab.describe
var it = lab.it
// var before = lab.before
// var after = lab.after
var expect = Code.expect

describe('index', function () {
  describe('without prefix', function () {
    var server

    lab.before(function (done) {
      server = new Hapi.Server()
      server.connection({port: 0})
      server.register([vision, inert, {
        register: require('../'),
        options: {
          swaggerEndpoint: 'http://test.url.tld/swagger'
        }
      }], function (err) {
        expect(err).to.not.exist()
        server.start(function () {
          done()
        })
      })
    })

    lab.after(function (done) {
      server.stop({}, function () {
        server = null
        done()
      })
    })

    it('Path /', function (done) {
      server.inject('/', function (res) {
        expect(res.statusCode).to.equal(200)
        expect(res.result).to.contain('swagger-ui.min.js')
        expect(res.result).to.contain('"url":"http://test.url.tld/swagger"')
        done()
      })
    })

    it('/index.html', function (done) {
      server.inject('/index.html', function (res) {
        expect(res.statusCode).to.equal(200)
        expect(res.result).to.contain('swagger-ui.min.js')
        expect(res.result).to.contain('"url":"http://test.url.tld/swagger"')
        done()
      })
    })
  })

  describe('with prefix', function () {
    var server

    lab.before(function (done) {
      server = new Hapi.Server()
      server.connection({port: 0})
      server.register([vision, inert, {
        register: require('../'),
        options: {
          swaggerEndpoint: 'http://test.url.tld/swagger'
        }
      }], {
        routes: {
          prefix: '/docs'
        }
      }, function (err) {
        expect(err).to.not.exist()
        server.start(function () {
          done()
        })
      })
    })

    lab.after(function (done) {
      server.stop({}, function () {
        server = null
        done()
      })
    })

    it('Path /docs', function (done) {
      server.inject('/docs', function (res) {
        expect(res.statusCode).to.equal(200)
        expect(res.result).to.contain('swagger-ui.min.js')
        expect(res.result).to.contain('"url":"http://test.url.tld/swagger"')
        done()
      })
    })

    it('Path /docs/', function (done) {
      server.inject('/docs/', function (res) {
        expect(res.statusCode).to.equal(404)
        done()
      })
    })

    it('/docs/index.html', function (done) {
      server.inject('/docs/index.html', function (res) {
        expect(res.statusCode).to.equal(200)
        expect(res.result).to.contain('swagger-ui.min.js')
        expect(res.result).to.contain('"url":"http://test.url.tld/swagger"')
        done()
      })
    })
  })

  describe('with prefix and stripTrailingSlash', function () {
    var server

    lab.before(function (done) {
      server = new Hapi.Server()
      server.connection({port: 0, router: { stripTrailingSlash: true }})
      server.register([vision, inert, {
        register: require('../'),
        options: {
          swaggerEndpoint: 'http://test.url.tld/swagger'
        }
      }], {
        routes: {
          prefix: '/docs'
        }
      }, function (err) {
        expect(err).to.not.exist()
        server.start(function () {
          done()
        })
      })
    })

    lab.after(function (done) {
      server.stop({}, function () {
        server = null
        done()
      })
    })

    it('Path /docs', function (done) {
      server.inject('/docs', function (res) {
        expect(res.statusCode).to.equal(200)
        expect(res.result).to.contain('swagger-ui.min.js')
        expect(res.result).to.contain('"url":"http://test.url.tld/swagger"')
        done()
      })
    })

    it('Path /docs/', function (done) {
      server.inject('/docs/', function (res) {
        expect(res.statusCode).to.equal(200)
        expect(res.result).to.contain('swagger-ui.min.js')
        expect(res.result).to.contain('"url":"http://test.url.tld/swagger"')
        done()
      })
    })

    it('/docs/index.html', function (done) {
      server.inject('/docs/index.html', function (res) {
        expect(res.statusCode).to.equal(200)
        expect(res.result).to.contain('swagger-ui.min.js')
        expect(res.result).to.contain('"url":"http://test.url.tld/swagger"')
        done()
      })
    })
  })
})
