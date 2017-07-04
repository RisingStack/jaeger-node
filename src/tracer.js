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
    sampler = new jaeger.RateLimitingSampler(1),
    reporter = new jaeger.RemoteReporter(new UDPSender()),
    options = {}
  }) {
    if (!serviceName) {
      throw new Error('serviceName is required')
    }

    this._tracer = new jaeger.Tracer(serviceName, reporter, sampler, options)

    const instrumentedModules = _.uniq(instrumentations.map((instrumentation) => instrumentation.module))

    // Instrunent modules: hook require
    hook(instrumentedModules, (moduleExports, moduleName, moduleBaseDir) => {
      let moduleVersion

      // Look for version in package.json
      if (moduleBaseDir) {
        const packageJSON = path.join(moduleBaseDir, 'package.json')
        // eslint-disable-next-line
        moduleVersion = require(packageJSON).version
      }

      // Apply instrumentations
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
