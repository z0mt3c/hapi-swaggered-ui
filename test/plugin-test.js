var Hapi = require('hapi')
var Code = require('code')
var Lab = require('lab')
var lab = exports.lab = Lab.script()

var describe = lab.describe
var it = lab.it
// var before = lab.before
// var after = lab.after
var expect = Code.expect

describe('init', function () {
  it('register', function (done) {
    var server = new Hapi.Server()
    server.connection({port: 80})

    server.register({
      register: require('../')
    }, function (err) {
      expect(err).to.not.exist()
      done()
    })
  })
})
