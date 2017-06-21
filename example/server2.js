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
const monk = require('monk')

const db = monk('localhost/mydb', (err) => {
  if (err) {
    // eslint-disable-next-line
    console.error(err)
  }
})
const sites = db.get('sites')
const port = 3001
const app = express()

sites.createIndex('name')

app.get('/site/:id', async (req, res, next) => {
  await sites.insert({ name: 'risingstack', url: 'https://risingstack.com' })
  const site = await sites.findOne({ name: 'risingstack' })
  await request(site.url)
  next(new Error('My Error'))
})

app.use((err, req, res, next) => {
  next(err)
})

app.listen(port, () => {
  // eslint-disable-next-line
  console.log(`Example server 2 listening on port ${port}!`)
})
