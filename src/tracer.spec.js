'use strict'

const { expect } = require('chai')
const jaeger = require('jaeger-client')
const Tracer = require('./tracer')
const instrumentationExpress = require('./instrumentation/express')
const instrumentationHTTPClient = require('./instrumentation/httpClient')

describe('Tracer', () => {
  let tracer

  beforeEach(() => {
    if (tracer) {
      tracer.instrumentUnpatch()
    }
  })

  describe('constructor', () => {
    it('should initialize jager-client with service name', function () {
      this.sandbox.spy(jaeger, 'Tracer')

      tracer = new Tracer({
        serviceName: 'my-service'
      })

      expect(jaeger.Tracer).to.be.calledWithMatch('my-service')
    })

    it('should hook require and apply instrumentation', function () {
      this.sandbox.spy(instrumentationExpress, 'patch')
      this.sandbox.spy(instrumentationHTTPClient, 'patch')

      tracer = new Tracer({
        serviceName: 'my-service'
      })

      // eslint-disable-next-line
      const express = require('express')
      // eslint-disable-next-line
      const http = require('http')
      // eslint-disable-next-line
      const https = require('https')

      expect(instrumentationExpress.patch).to.be.calledWith(express, tracer._tracer)
      expect(instrumentationHTTPClient.patch).to.be.calledWith(http, tracer._tracer)
      expect(instrumentationHTTPClient.patch).to.be.calledWith(https, tracer._tracer)
    })

    it('should not apply instrumentation for not supported version', function () {
      this.sandbox.stub(instrumentationExpress, 'supportedVersions').value(['1.x'])
      this.sandbox.spy(instrumentationExpress, 'patch')

      tracer = new Tracer({
        serviceName: 'my-service'
      })

      // eslint-disable-next-line
      const express = require('express')

      expect(instrumentationExpress.patch).to.be.callCount(0)
    })
  })
})
