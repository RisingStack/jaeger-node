'use strict'

const http = require('http')
const express = require('express')
const request = require('request-promise-native')
const expressInstrumentation = require('../src/instrumentation/express')
const expressErrorInstrumentation = require('../src/instrumentation/expressError')
const httpClientInstrumentation = require('../src/instrumentation/httpClient')
const Tracer = require('../src/tracer')

const tracer = new Tracer({
  serviceName: 'my-server-2',
  tags: {
    gitTag: 'foobar'
  }
})

// TODO: instrument automatically
httpClientInstrumentation.patch(http, tracer._tracer)
expressInstrumentation.patch(express, tracer._tracer)
expressErrorInstrumentation.patch(express, tracer._tracer)

const port = process.env.PORT || 3000

const app = express()

app.get('/site/:id', async (req, res, next) => {
  await request('https://risingstack.com')
  next(new Error('My Error'))
})

app.use((err, req, res, next) => {
  next(err)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
})
