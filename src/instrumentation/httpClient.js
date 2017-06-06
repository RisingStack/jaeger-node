'use strict'

const url = require('url')
const opentracing = require('opentracing')
const shimmer = require('shimmer')
const _ = require('lodash')
// eslint-disable-next-line
const httpAgent = require('_http_agent')
const semver = require('semver')
const cls = require('../cls')

const OPERATION_NAME = 'http_request'

function extractUrl (options) {
  const uri = options
  const agent = options._defaultAgent || httpAgent.globalAgent

  return _.isString(uri) ? uri : url.format({
    protocol: options.protocol || agent.protocol,
    hostname: options.hostname || options.host || 'localhost',
    port: options.port,
    path: options.path || options.pathName || '/'
  })
}

function unpatchHttp (http) {
  shimmer.unwrap(http, 'request')

  if (semver.satisfies(process.version, '>=8.0.0')) {
    shimmer.unwrap(http, 'get')
  }
}

function patchHttp (http, tracer) {
  shimmer.wrap(http, 'request', (request) => makeRequestTrace(request))

  if (semver.satisfies(process.version, '>=8.0.0')) {
    // http.get in Node 8 calls the private copy of request rather than the one
    // we have patched on module.export. We need to patch get as well. Luckily,
    // the request patch we have does work for get as well.
    shimmer.wrap(http, 'get', (get) => makeRequestTrace(get))
  }

  function makeRequestTrace (request) {
    // On Node 8+ we use the following function to patch both request and get.
    // Here `request` may also happen to be `get`.
    return function requestTrace (options, callback) {
      if (!options) {
        return request.apply(this, [options, callback])
      }

      const span = cls.startSpan(tracer, OPERATION_NAME)

      options = _.isString(options) ? url.parse(options) : _.merge({}, options)
      options.headers = options.headers || {}

      options.headers['trace-span-context'] = span.context().toString()

      const uri = extractUrl(options)
      span.setTag(opentracing.Tags.HTTP_URL, uri)
      span.setTag(opentracing.Tags.HTTP_METHOD, options.method || 'GET')

      const req = request.call(this, options, (res) => {
        const headers = _.omitBy(
          _.pick(res.headers, ['server', 'content-type', 'cache-control']),
          _.isUndefined
        )

        if (res.statusCode >= 400) {
          span.setTag(opentracing.Tags.ERROR, true)
        }

        span.setTag(opentracing.Tags.HTTP_STATUS_CODE, res.statusCode)
        span.log({ headers })
        span.finish()

        if (callback) {
          callback(res)
        }
      })

      req.on('error', (err) => {
        span.setTag(opentracing.Tags.ERROR, true)

        if (err) {
          span.log({
            event: 'error',
            'error.object': err,
            message: err.message,
            stack: err.stack
          })
        }

        span.finish()
      })
      return req
    }
  }
}

module.exports = {
  module: 'http',
  OPERATION_NAME,
  patch: patchHttp,
  unpatch: unpatchHttp
}
