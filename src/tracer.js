'use strict'

const jaeger = require('jaeger-client')
const UDPSender = require('jaeger-client/dist/src/reporters/udp_sender').default

class Tracer {
  constructor ({ serviceName, tags = {}, samplesPerSecond = 1 }) {
    const sender = new UDPSender()
    const reporter = new jaeger.RemoteReporter(sender)
    const sampler = new jaeger.RateLimitingSampler(samplesPerSecond)

    this._tracer = new jaeger.Tracer(serviceName, reporter, sampler, {
      logger: console,
      tags
    })
  }
}

module.exports = Tracer
