'use strict'

const http = require('http')
const express = require('express')
const expressInstrumentation = require('../src/instrumentation/express')
const expressErrorInstrumentation = require('../src/instrumentation/expressError')
const httpClientInstrumentation = require('../src/instrumentation/httpClient')
const Tracer = require('../src/tracer')

const tracer = new Tracer({
  serviceName: 'my-server-1',
  tags: {
    gitTag: 'foobar'
  }
})

// TODO: instrument automatically
httpClientInstrumentation.patch(http, tracer._tracer)
expressInstrumentation.patch(express, tracer._tracer)
expressErrorInstrumentation.patch(express, tracer._tracer)

const port = process.env.PORT || 3001

const app = express()

app.get('/hello', (req, res, next) => {
  http
    .get('http://localhost:3000/site/risingstack', (getRes) => {
      if (getRes.statusCode > 399) {
        res.statusCode = getRes.statusCode
        res.json({ status: 'upstream error' })
        return
      }

      res.send('Hello World!')
    })
    .on('error', (err) => {
      next(err)
    })
})

app.use((err, req, res, next) => {
  next(err)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
})
