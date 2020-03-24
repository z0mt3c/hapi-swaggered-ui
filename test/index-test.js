'use strict'

const Hapi = require('hapi')
const Code = require('code')
const Lab = require('lab')
const lab = exports.lab = Lab.script()
const inert = require('inert')
const vision = require('vision')
const plugin = require('../')

const describe = lab.describe
const it = lab.it
const expect = Code.expect

describe('index', () => {
  describe('without prefix', () => {
    let server

    lab.before(async () => {
      server = Hapi.Server({ port: 0 })

      await expect(server.register([vision, inert, {
        plugin,
        options: {
          swaggerEndpoint: 'http://test.url.tld/swagger'
        }
      }])).not.to.reject()
    })

    lab.after(async () => {
      await server.stop({})
      server = null
    })

    it('Path /', async () => {
      const res = await server.inject('/')

      expect(res.statusCode).to.equal(200)
      expect(res.result).to.contain('/swagger-ui-bundle.js')
      expect(res.result).to.contain('"url":"http://test.url.tld/swagger"')
    })

    it('/index.html', async () => {
      const res = await server.inject('/')

      expect(res.statusCode).to.equal(200)
      expect(res.result).to.contain('/swagger-ui-bundle.js')
      expect(res.result).to.contain('"url":"http://test.url.tld/swagger"')
    })
  })

  describe('with prefix', () => {
    let server

    lab.before(async () => {
      server = Hapi.Server({ port: 0 })

      await server.register([vision, inert, {
        plugin,
        options: {
          swaggerEndpoint: 'http://test.url.tld/swagger'
        }
      }], {
        routes: {
          prefix: '/docs'
        }
      })

      await server.start()
    })

    lab.after(async () => {
      await server.stop({})
      server = null
    })

    it('Path /docs', async () => {
      const res = await server.inject('/docs')

      expect(res.statusCode).to.equal(200)
      expect(res.result).to.contain('/swagger-ui-bundle.js')
      expect(res.result).to.contain('"url":"http://test.url.tld/swagger"')
    })

    it('Path /docs/', async () => {
      const res = await server.inject('/docs/')

      expect(res.statusCode).to.equal(404)
    })

    it('/docs/index.html', async () => {
      const res = await server.inject('/docs/index.html')

      expect(res.statusCode).to.equal(200)
      expect(res.result).to.contain('/swagger-ui-bundle.js')
      expect(res.result).to.contain('"url":"http://test.url.tld/swagger"')
    })
  })

  describe('with prefix and stripTrailingSlash', () => {
    let server

    lab.before(async () => {
      server = Hapi.Server({ port: 0, router: { stripTrailingSlash: true } })

      await server.register([vision, inert, {
        plugin,
        options: {
          swaggerEndpoint: 'http://test.url.tld/swagger'
        }
      }], {
        routes: {
          prefix: '/docs'
        }
      })

      await server.start()
    })

    lab.after(async () => {
      await server.stop({})
      server = null
    })

    it('Path /docs', async () => {
      const res = await server.inject('/docs')

      expect(res.statusCode).to.equal(200)
      expect(res.result).to.contain('/swagger-ui-bundle.js')
      expect(res.result).to.contain('"url":"http://test.url.tld/swagger"')
    })

    it('Path /docs/', async () => {
      const res = await server.inject('/docs/')

      expect(res.statusCode).to.equal(200)
      expect(res.result).to.contain('/swagger-ui-bundle.js')
      expect(res.result).to.contain('"url":"http://test.url.tld/swagger"')
    })

    it('/docs/index.html', async () => {
      const res = await server.inject('/docs/index.html')

      expect(res.statusCode).to.equal(200)
      expect(res.result).to.contain('/swagger-ui-bundle.js')
      expect(res.result).to.contain('"url":"http://test.url.tld/swagger"')
    })
  })
})
