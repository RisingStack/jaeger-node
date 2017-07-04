'use strict'

// eslint-disable-next-line
const Tracer = require('../src')
// eslint-disable-next-line
const tracer = new Tracer({
  serviceName: 'my-server-1',
  options: {
    tags: {
      gitTag: 'foo'
    }
  }
})

const http = require('http')
const express = require('express')

const port = 3000

const app = express()

app.get('/', (req, res, next) => {
  http
    .get('http://localhost:3001/site/risingstack', (getRes) => {
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
  // eslint-disable-next-line
  console.log(`Example server 1 listening on port ${port}!`)
})
