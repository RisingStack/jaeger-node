'use strict'

const { opentracing } = require('jaeger-client')
const shimmer = require('shimmer')
const cls = require('../cls')

const DB_TYPE = 'postgresql'
const OPERATION_NAME = 'pg'

function patch (pg, tracer) {
  function queryWrap (query) {
    return function queryTrace (...args) {
      const span = cls.startChildSpan(tracer, `${OPERATION_NAME}_query`)
      const pgQuery = query.call(this, ...args)
      const originalCallback = pgQuery.callback

      span.setTag(opentracing.Tags.DB_TYPE, DB_TYPE)
      span.setTag(opentracing.Tags.DB_STATEMENT, pgQuery.text)

      pgQuery.callback = (err, res) => {
        if (err) {
          span.log({
            event: 'error',
            'error.object': err,
            message: err.message,
            stack: err.stack
          })
          span.setTag(opentracing.Tags.ERROR, true)
        }

        if (res) {
          span.log({
            row_count: res.rowCount
          })
        }

        span.finish()

        if (originalCallback) {
          originalCallback(err, res)
        }
      }
      return pgQuery
    }
  }

  shimmer.wrap(pg.Client.prototype, 'query', queryWrap)
}

function unpatch (pg) {
  shimmer.unwrap(pg.Client.prototype, 'query')
}

module.exports = {
  module: 'pg',
  supportedVersions: ['6.x'],
  OPERATION_NAME,
  patch,
  unpatch
}
