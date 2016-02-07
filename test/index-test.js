'use strict'

const Hapi = require('hapi')
const Code = require('code')
const Lab = require('lab')
let lab = exports.lab = Lab.script()
const inert = require('inert')
const vision = require('vision')

const describe = lab.describe
const it = lab.it
const expect = Code.expect

describe('index', () => {
  describe('without prefix', () => {
    let server

    lab.before((done) => {
      server = new Hapi.Server()
      server.connection({port: 0})
      server.register([vision, inert, {
        register: require('../'),
        options: {
          swaggerEndpoint: 'http://test.url.tld/swagger'
        }
      }], (err) => {
        expect(err).to.not.exist()
        server.start(() => {
          done()
        })
      })
    })

    lab.after((done) => {
      server.stop({}, () => {
        server = null
        done()
      })
    })

    it('Path /', (done) => {
      server.inject('/', (res) => {
        expect(res.statusCode).to.equal(200)
        expect(res.result).to.contain('swagger-ui.min.js')
        expect(res.result).to.contain('"url":"http://test.url.tld/swagger"')
        done()
      })
    })

    it('/index.html', (done) => {
      server.inject('/index.html', (res) => {
        expect(res.statusCode).to.equal(200)
        expect(res.result).to.contain('swagger-ui.min.js')
        expect(res.result).to.contain('"url":"http://test.url.tld/swagger"')
        done()
      })
    })
  })

  describe('with prefix', () => {
    let server

    lab.before((done) => {
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
      }, (err) => {
        expect(err).to.not.exist()
        server.start(() => {
          done()
        })
      })
    })

    lab.after((done) => {
      server.stop({}, () => {
        server = null
        done()
      })
    })

    it('Path /docs', (done) => {
      server.inject('/docs', (res) => {
        expect(res.statusCode).to.equal(200)
        expect(res.result).to.contain('swagger-ui.min.js')
        expect(res.result).to.contain('"url":"http://test.url.tld/swagger"')
        done()
      })
    })

    it('Path /docs/', (done) => {
      server.inject('/docs/', (res) => {
        expect(res.statusCode).to.equal(404)
        done()
      })
    })

    it('/docs/index.html', (done) => {
      server.inject('/docs/index.html', (res) => {
        expect(res.statusCode).to.equal(200)
        expect(res.result).to.contain('swagger-ui.min.js')
        expect(res.result).to.contain('"url":"http://test.url.tld/swagger"')
        done()
      })
    })
  })

  describe('with prefix and stripTrailingSlash', () => {
    let server

    lab.before((done) => {
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
      }, (err) => {
        expect(err).to.not.exist()
        server.start(() => {
          done()
        })
      })
    })

    lab.after((done) => {
      server.stop({}, () => {
        server = null
        done()
      })
    })

    it('Path /docs', (done) => {
      server.inject('/docs', (res) => {
        expect(res.statusCode).to.equal(200)
        expect(res.result).to.contain('swagger-ui.min.js')
        expect(res.result).to.contain('"url":"http://test.url.tld/swagger"')
        done()
      })
    })

    it('Path /docs/', (done) => {
      server.inject('/docs/', (res) => {
        expect(res.statusCode).to.equal(200)
        expect(res.result).to.contain('swagger-ui.min.js')
        expect(res.result).to.contain('"url":"http://test.url.tld/swagger"')
        done()
      })
    })

    it('/docs/index.html', (done) => {
      server.inject('/docs/index.html', (res) => {
        expect(res.statusCode).to.equal(200)
        expect(res.result).to.contain('swagger-ui.min.js')
        expect(res.result).to.contain('"url":"http://test.url.tld/swagger"')
        done()
      })
    })
  })
})
