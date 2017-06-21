'use strict'

const path = require('path')
const semver = require('semver')
const _ = require('lodash')
const jaeger = require('jaeger-client')
const UDPSender = require('jaeger-client/dist/src/reporters/udp_sender').default
const hook = require('require-in-the-middle')
const instrumentations = require('./instrumentation')

class Tracer {
  constructor ({
    serviceName,
    tags = {},
    maxSamplesPerSecond = 1,
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

    hook(instrumentedModules, (moduleExports, moduleName, moduleBaseDir) => {
      let moduleVersion

      if (moduleBaseDir) {
        const packageJSON = path.join(moduleBaseDir, 'package.json')
        // eslint-disable-next-line
        moduleVersion = require(packageJSON).version
      }

      instrumentations
        .filter((instrumentation) => instrumentation.module === moduleName)
        .filter((instrumentation) => {
          if (_.isUndefined(moduleVersion) || !_.isArray(instrumentation.supportedVersions)) {
            return true
          }

          return instrumentation.supportedVersions.some((supportedVersion) =>
            semver.satisfies(moduleVersion, supportedVersion)
          )
        })
        .forEach((instrumentation) => {
          instrumentation.patch(moduleExports, this._tracer, moduleBaseDir)
        })

      return moduleExports
    })
  }
}

module.exports = Tracer
