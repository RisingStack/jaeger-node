'use strict'

const shimmer = require('shimmer')
const opentracing = require('opentracing')
const { isExpressV4 } = require('./util')

const OPERATION_NAME = 'express_error_handler'

function patch (express, tracer) {
  // support only express@4
  if (!isExpressV4(express)) {
    return
  }

  let errorHandlerLayer

  function expressErrorHandler (err, req, res, next) {
    const span = tracer.startSpan(OPERATION_NAME, {
      childOf: req._span
    })

    span.log({
      event: 'error',
      'error.object': err,
      message: err.message,
      stack: err.stack
    })

    span.setTag(opentracing.Tags.ERROR, true)
    span.setTag(opentracing.Tags.COMPONENT, true)

    span.finish()

    next(err)
  }

  // in express errorhandlers have 4 arguments
  function isErrorHandler (middleware) {
    return middleware && middleware.handle && middleware.handle.length === 4
  }

  // it will be called every time a middleware is added to express
  // in these cases we remove our expressErrorHandler and add it later with addErrorHandler
  function removeErrorHandler (app) {
    if (app.stack && app.stack.length) {
      for (let i = app.stack.length - 1; i >= 0; i -= 1) {
        if (app.stack[i] === errorHandlerLayer) {
          app.stack.splice(i, 1)
          break
        }
      }
    }
  }

  // look for the error handler provided by user, if found insert right before
  // if not found insert to the end
  function addErrorHandler (app) {
    let errorMiddlewareFound = false

    app.stack.forEach((middleware, i) => {
      if (isErrorHandler(middleware)) {
        app.stack.splice(i, 0, errorHandlerLayer)
        errorMiddlewareFound = true
      }
    })

    if (!errorMiddlewareFound) {
      app.stack.push(errorHandlerLayer)
    }
  }

  shimmer.wrap(express.Router, 'use', (original) =>
    function errorHandler (...args) {
      // magic to create an express layer from the error handler function
      if (!errorHandlerLayer) {
        errorHandlerLayer = original
          .call(this, '/', expressErrorHandler)
          .stack.pop()
      }
      removeErrorHandler(this)
      const app = original.call(this, ...args)
      addErrorHandler(this)
      return app
    }
  )
}

// TODO
function unpatch () {}

module.exports = {
  OPERATION_NAME,
  patch,
  unpatch
}
