'use strict'

const opentracing = require('opentracing')
const shimmer = require('shimmer')
const SpanContext = require('jaeger-client').SpanContext
const methods = require('methods').concat('use', 'route', 'param', 'all')
const { isExpressV4 } = require('./util')

const OPERATION_NAME = 'http_server'

function patchModuleRoot (express, tracer) {
  // support only express@4
  if (!isExpressV4(express)) {
    return
  }

  function applicationActionWrap (method) {
    return function expressActionTrace (...args) {
      if (!this._jaeger_trace_patched && !this._router) {
        this._jaeger_trace_patched = true
        this.use(middleware)
      }
      return method.call(this, ...args)
    }
  }

  function middleware (req, res, next) {
    // start
    const url = `${req.protocol}://${req.hostname}${req.originalUrl}`
    const parentSpanOperationType = req.headers['trace-span-operation']
    const parentSpanContextStr = req.headers['trace-span-context']
    const span = parentSpanContextStr ?
      tracer.startSpan(OPERATION_NAME, {
        childOf: SpanContext.fromString(parentSpanContextStr)
      })
      : tracer.startSpan(OPERATION_NAME)

    span.setTag(opentracing.Tags.HTTP_URL, url)
    span.setTag(opentracing.Tags.HTTP_METHOD, req.method)

    req._span = span

    if (req.connection.remoteAddress) {
      span.log({ peerRemoteAddress: req.connection.remoteAddress })
    }

    if (parentSpanOperationType) {
      span.log({ parentSpanOperationType })
    }

    // end
    const originalEnd = res.end

    res.end = (chunk, encoding) => {
      res.end = originalEnd
      const returned = res.end(chunk, encoding)

      if (req.route && req.route.path) {
        span.log({ expressRoute: req.route.path })
      }

      span.setTag(opentracing.Tags.HTTP_STATUS_CODE, res.statusCode)

      if (res.statusCode >= 400) {
        span.setTag(opentracing.Tags.ERROR, true)
      }

      span.finish()

      return returned
    }

    next()
  }

  methods.forEach((method) => {
    shimmer.wrap(express.application, method, applicationActionWrap)
  })
}

function unpatchModuleRoot (express) {
  methods.forEach((method) => {
    shimmer.unwrap(express.application, method)
  })
}

module.exports = {
  OPERATION_NAME,
  patch: patchModuleRoot,
  unpatch: unpatchModuleRoot
}
