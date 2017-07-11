'use strict'

const https = require('https')
const { expect } = require('chai')
const { Tracer } = require('opentracing')
const instrumentation = require('./httpsClient')
const httpClient = require('./httpClient')

describe('instrumentation: httpsClient', () => {
  let tracer

  beforeEach(() => {
    tracer = new Tracer()
  })

  describe('#patch', () => {
    it('should call httpClient\'s patch', function () {
      this.sandbox.stub(httpClient, 'patch')

      instrumentation.patch(https, tracer)

      expect(httpClient.patch).to.be.calledWith(https, tracer)
    })
  })

  describe('#unpatch', () => {
    it('should call httpClient\'s unpatch', function () {
      this.sandbox.stub(httpClient, 'unpatch')

      instrumentation.unpatch(https, tracer)

      expect(httpClient.unpatch).to.be.calledWith(https)
    })
  })
})
