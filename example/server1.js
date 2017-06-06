'use strict'

// eslint-disable-next-line
const Tracer = require('../src')
// eslint-disable-next-line
const tracer = new Tracer({
  serviceName: 'my-server-1',
  tags: {
    gitTag: 'foobar'
  }
})

const http = require('http')
const express = require('express')

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
  // eslint-disable-next-line
  console.log(`Example app listening on port ${port}!`)
})
