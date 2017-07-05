'use strict'

const { expect } = require('chai')
const _ = require('lodash')
const cls = require('./cls')

describe('cls', () => {
  let tracer

  beforeEach(function () {
    tracer = {
      startSpan: this.sandbox.spy(() => 'mock-span')
    }
  })

  afterEach(() => {
    cls.setContext(_.clone(cls.DEFAULT_CONTEXT))
  })

  describe('#assign', () => {
    it('should assign to current context', () => {
      cls.assign({ foo: 'bar' })
      cls.assign({ such: 'wow' })
      cls.assign({ such: 'so' })

      expect(cls.getContext()).to.be.eql({
        foo: 'bar',
        such: 'so'
      })
    })
  })

  describe('#getRootSpan', () => {
    it('should return with root span', () => {
      cls.startRootSpan(tracer, 'http_request')

      expect(cls.getRootSpan()).to.be.equal('mock-span')
    })
  })

  describe('#startRootSpan', () => {
    it('should start root span', () => {
      const span = cls.startRootSpan(tracer, 'http_request')

      expect(tracer.startSpan).to.be.calledWithExactly('http_request', {
        childOf: undefined
      })

      expect(cls.getContext()).to.be.eql({
        currentSpan: 'mock-span'
      })

      expect(span).to.be.equal('mock-span')
    })

    it('should start root span that has a parent', () => {
      const parentSpanContext = { isValid: true }
      cls.startRootSpan(tracer, 'http_request', parentSpanContext)

      expect(tracer.startSpan).to.be.calledWithExactly('http_request', {
        childOf: parentSpanContext
      })
    })

    it('should skip invalid parent', () => {
      const parentSpanContext = { isValid: false }
      cls.startRootSpan(tracer, 'http_request', parentSpanContext)

      expect(tracer.startSpan).to.be.calledWithExactly('http_request', {
        childOf: undefined
      })
    })
  })

  describe('#startChildSpan', () => {
    it('should start child span', () => {
      const span = cls.startChildSpan(tracer, 'http_request')

      expect(tracer.startSpan).to.be.calledWithExactly('http_request', {
        childOf: undefined
      })

      expect(span).to.be.equal('mock-span')
    })

    it('should start child span that has a parent', () => {
      const parentSpanContext = { isValid: true }
      cls.setContext({
        currentSpan: {
          context: () => parentSpanContext
        }
      })
      cls.startChildSpan(tracer, 'http_request')

      expect(tracer.startSpan).to.be.calledWithExactly('http_request', {
        childOf: parentSpanContext
      })
    })

    it('should skip invalid parent', () => {
      const parentSpanContext = { isValid: false }
      cls.setContext({
        currentSpan: {
          context: () => parentSpanContext
        }
      })
      cls.startChildSpan(tracer, 'http_request', parentSpanContext)

      expect(tracer.startSpan).to.be.calledWithExactly('http_request', {
        childOf: undefined
      })
    })
  })
})
