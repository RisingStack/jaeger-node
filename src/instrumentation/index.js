'use strict'

const expressInstrumentation = require('./express')
const expressErrorInstrumentation = require('./expressError')
const httpClientInstrumentation = require('./httpClient')

module.exports = [
  expressInstrumentation,
  expressErrorInstrumentation,
  httpClientInstrumentation
]
