'use strict'

const httpClient = require('./httpClient')

module.exports = {
  module: 'https',
  OPERATION_NAME: httpClient.OPERATION_NAME,
  patch: (https, tracer) => httpClient.patch(https, tracer),
  unpatch: (https) => httpClient.unpatch(https)
}
