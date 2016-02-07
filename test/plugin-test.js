'use strict'

const Hapi = require('hapi')
const Code = require('code')
const Lab = require('lab')
let lab = exports.lab = Lab.script()

const describe = lab.describe
const it = lab.it
const expect = Code.expect

describe('init', () => {
  it('register', (done) => {
    const server = new Hapi.Server()
    server.connection({port: 80})

    server.register([require('vision'), require('inert'), {
      register: require('../')
    }], (err) => {
      expect(err).to.not.exist()
      done()
    })
  })
})
