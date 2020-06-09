'use strict'

const Hapi = require('@hapi/hapi')
const Code = require('code')
const Lab = require('@hapi/lab')
const lab = (exports.lab = Lab.script())

const describe = lab.describe
const it = lab.it
const expect = Code.expect

describe('init', () => {
  it('register', async () => {
    const server = Hapi.Server({ port: 80 })
    const plugins = [require('@hapi/vision'), require('@hapi/inert'), require('../')]

    await expect(server.register(plugins)).not.to.reject()
  })
})
