'use strict'

const sinon = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')

// postgres
const pgUser = process.env.PG_USER || process.env.USER || 'root'
const pgPw = process.env.PG_PASSWORD || ''
const pgDB = process.env.PG_DATABASE || 'test_jaeger'
process.env.PG_URI = process.env.PG_URI || `postgres://${pgUser}:${pgPw}@localhost:5432/${pgDB}`

before(() => {
  chai.use(sinonChai)
})

beforeEach(function beforeEach () {
  this.sandbox = sinon.sandbox.create()
})

afterEach(function afterEach () {
  this.sandbox.restore()
})
