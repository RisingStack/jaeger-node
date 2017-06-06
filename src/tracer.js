'use strict'

const _ = require('lodash')
const jaeger = require('jaeger-client')
const UDPSender = require('jaeger-client/dist/src/reporters/udp_sender').default
const hook = require('require-in-the-middle')
const instrumentations = require('./instrumentation')

class Tracer {
  constructor ({
    serviceName,
    tags = {},
    maxSamplesPerSecond = 10,
    sender = {},
    logger = undefined
  }) {
    const senderOptions = _.defaults(sender, {
      host: 'localhost',
      port: 6832,
      maxPacketSize: 65000
    })
    const udpSender = new UDPSender(senderOptions)
    const reporter = new jaeger.RemoteReporter(udpSender)
    const sampler = new jaeger.RateLimitingSampler(maxSamplesPerSecond)

    this._tracer = new jaeger.Tracer(serviceName, reporter, sampler, {
      logger,
      tags
    })

    const instrumentedModules = _.uniq(instrumentations.map((instrumentation) => instrumentation.module))

    hook(instrumentedModules, (moduleExports, moduleName) => {
      instrumentations
        .filter((instrumentation) => instrumentation.module === moduleName)
        .forEach((instrumentation) => {
          instrumentation.patch(moduleExports, this._tracer)
        })

      return moduleExports
    })
  }
}

module.exports = Tracer
