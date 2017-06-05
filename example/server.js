'use strict'

const express = require('express')
const expressInstrumentation = require('../src/instrumentation/express')
const expressErrorInstrumentation = require('../src/instrumentation/expressError')
const Tracer = require('../src/tracer')

const tracer = Tracer.create('my-server', {
  gitTag: 'foobar'
})

expressInstrumentation.patch(express, tracer)
expressErrorInstrumentation.patch(express, tracer)

const port = process.env.PORT || 3000

const app = express()

app.get('/hello', (req, res) => {
  throw new Error('My Error')
  res.send('Hello World!')
})

app.use((err, req, res, next) => {
  next(err)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
})
