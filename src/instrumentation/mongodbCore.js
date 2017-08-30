'use strict'

const opentracing = require('opentracing')
const shimmer = require('shimmer')
const cls = require('../cls')

const DB_TYPE = 'mongodb'
const OPERATION_NAME = 'mongodb'

function nextWrapFactory (tracer) {
  return function nextWrap (next) {
    return function nextTrace (cb) {
      const span = cls.startChildSpan(tracer, `${OPERATION_NAME}_cursor`)

      span.setTag(opentracing.Tags.DB_TYPE, DB_TYPE)
      span.setTag(opentracing.Tags.DB_STATEMENT, JSON.stringify(this.cmd))

      return next.call(this, wrapCallback(tracer, span, cb))
    }
  }
}

function wrapCallback (tracer, span, done) {
  const fn = function (err, res) {
    if (err) {
      span.log({
        event: 'error',
        'error.object': err,
        message: err.message,
        stack: err.stack
      })
      span.setTag(opentracing.Tags.ERROR, true)
    }

    span.finish()

    if (done) {
      done(err, res)
    }
  }

  return fn
}

function wrapFactory (tracer, command) {
  return function (original) {
    return function mongoOperationTrace (ns, ops, options, callback) {
      const span = cls.startChildSpan(tracer, `${OPERATION_NAME}_${command}`)

      span.setTag(opentracing.Tags.DB_TYPE, DB_TYPE)
      span.setTag(opentracing.Tags.DB_STATEMENT, JSON.stringify(ops))
      span.setTag(opentracing.Tags.DB_INSTANCE, ns)

      if (typeof options === 'function') {
        return original.call(this, ns, ops, wrapCallback(tracer, span, options))
      }

      return original.call(this, ns, ops, options, wrapCallback(tracer, span, callback))
    }
  }
}

function patch (mongodb, tracer) {
  shimmer.wrap(mongodb.Server.prototype, 'command', wrapFactory(tracer, 'command'))
  shimmer.wrap(mongodb.Server.prototype, 'insert', wrapFactory(tracer, 'insert'))
  shimmer.wrap(mongodb.Server.prototype, 'update', wrapFactory(tracer, 'update'))
  shimmer.wrap(mongodb.Server.prototype, 'remove', wrapFactory(tracer, 'remove'))
  shimmer.wrap(mongodb.Cursor.prototype, 'next', nextWrapFactory(tracer))
}

function unpatch (mongodb) {
  shimmer.unwrap(mongodb.Server.prototype, 'command')
  shimmer.unwrap(mongodb.Server.prototype, 'insert')
  shimmer.unwrap(mongodb.Server.prototype, 'update')
  shimmer.unwrap(mongodb.Server.prototype, 'remove')
  shimmer.unwrap(mongodb.Cursor.prototype, 'next')
}

module.exports = {
  module: 'mongodb-core',
  supportedVersions: ['1.x', '2.x'],
  OPERATION_NAME,
  DB_TYPE,
  patch,
  unpatch
}
