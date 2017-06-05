'use strict'

const http = require('http')
const httpClientInstrumentation = require('../src/instrumentation/httpClient')
const Tracer = require('../src/tracer')

const tracer = Tracer.create('my-client', {
  gitTag: 'foobar'
})

httpClientInstrumentation.patch(http, tracer)

http
  .get('http://localhost:3000/hello', () => {
    console.log('success')
  })
  .on('error', (err) => {
    console.error(err)
  })
