'use strict'

// eslint-disable-next-line
const Tracer = require('../src')
// eslint-disable-next-line
const tracer = new Tracer({
  serviceName: 'my-server-2',
  tags: {
    gitTag: 'foobar'
  }
})
const express = require('express')
const request = require('request-promise-native')

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
  // eslint-disable-next-line
  console.log(`Example app listening on port ${port}!`)
})
