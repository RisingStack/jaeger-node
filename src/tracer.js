'use strict'

const jaeger = require('jaeger-client')
const UDPSender = require('jaeger-client/dist/src/reporters/udp_sender').default

const SAMPLES_PER_SECOND = 1

function create (serviceName, tags) {
  const sender = new UDPSender()
  const reporter = new jaeger.RemoteReporter(sender)
  const sampler = new jaeger.RateLimitingSampler(SAMPLES_PER_SECOND)

  const tracer = new jaeger.Tracer(serviceName, reporter, sampler, {
    logger: console,
    tags
  })

  return tracer
}

module.exports = {
  create
}
