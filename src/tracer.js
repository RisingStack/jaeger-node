'use strict'

const _ = require('lodash')
const jaeger = require('jaeger-client')
const UDPSender = require('jaeger-client/dist/src/reporters/udp_sender').default
const hook = require('require-in-the-middle')
const instrumentations = require('./instrumentation')

class Tracer {
  constructor ({ serviceName, tags = {}, samplesPerSecond = 1 }) {
    const sender = new UDPSender()
    const reporter = new jaeger.RemoteReporter(sender)
    const sampler = new jaeger.RateLimitingSampler(samplesPerSecond)

    this._tracer = new jaeger.Tracer(serviceName, reporter, sampler, {
      logger: console,
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
