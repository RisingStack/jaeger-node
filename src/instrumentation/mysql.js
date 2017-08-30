'use strict'

const opentracing = require('opentracing')
const shimmer = require('shimmer')
const cls = require('../cls')

const DB_TYPE = 'mysql'
const OPERATION_NAME = 'mysql'
let Connection

function patch (mysql, tracer) {
  // eslint-disable-next-line
  Connection = Connection || require('mysql/lib/Connection')

  function createQueryWrap (createQuery) {
    return function createQueryWrapped (sql, values, cb) {
      const span = cls.startChildSpan(tracer, `${OPERATION_NAME}_query`)
      const query = createQuery.call(this, sql, values, cb)

      span.setTag(opentracing.Tags.DB_TYPE, DB_TYPE)
      span.setTag(opentracing.Tags.DB_STATEMENT, query.sql)

      query.on('error', (err) => {
        span.log({
          event: 'error',
          'error.object': err,
          message: err.message,
          stack: err.stack
        })
        span.setTag(opentracing.Tags.ERROR, true)
      })

      query.on('end', () => {
        span.finish()
      })

      return query
    }
  }

  shimmer.wrap(Connection, 'createQuery', createQueryWrap)
}

function unpatch () {
  if (Connection) {
    shimmer.unwrap(Connection, 'createQuery')
  }
}

module.exports = {
  module: 'mysql',
  supportedVersions: ['2.x'],
  OPERATION_NAME,
  DB_TYPE,
  patch,
  unpatch
}
