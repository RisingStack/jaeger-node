'use strict'

const express = require('express')
const expressInstrumentation = require('../src/instrumentation/express')
const expressErrorInstrumentation = require('../src/instrumentation/expressError')
const Tracer = require('../src/tracer')

const tracer = new Tracer({
  serviceName: 'my-server-2',
  tags: {
    gitTag: 'foobar'
  }
})

// TODO: instrument automatically
expressInstrumentation.patch(express, tracer._tracer)
expressErrorInstrumentation.patch(express, tracer._tracer)

const port = process.env.PORT || 3000

const app = express()

function myError () {
  throw new Error('My Error')
}

app.get('/hello', (req, res) => {
  myError()
  res.send('Hello World!')
})

app.use((err, req, res, next) => {
  next(err)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
})
