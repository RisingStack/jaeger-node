'use strict'

const Instrument = require('@risingstack/opentracing-auto')
const jaeger = require('jaeger-client')
const UDPSender = require('jaeger-client/dist/src/reporters/udp_sender').default

/**
* @class Tracer
*/
class Tracer {
  constructor ({
    serviceName,
    sampler = new jaeger.RateLimitingSampler(1),
    reporter = new jaeger.RemoteReporter(new UDPSender()),
    options = {}
  }) {
    if (!serviceName) {
      throw new Error('serviceName is required')
    }

    this._tracer = new jaeger.Tracer(serviceName, reporter, sampler, options)
    this.instrument = new Instrument({
      tracers: [this._tracer]
    })
  }
}

module.exports = Tracer
