'use strict'

const Hapi = require('hapi')
const Code = require('code')
const Lab = require('lab')
const lab = exports.lab = Lab.script()

const describe = lab.describe
const it = lab.it
const expect = Code.expect

describe('init', () => {
  it('register', async () => {
    const server = Hapi.Server({ port: 80 })
    const plugins = [require('vision'), require('inert'), require('../')]

    await expect(server.register(plugins)).not.to.reject()
  })
})
