'use strict'

const { ContinuationLocalStorage } = require('asyncctx')

const cls = new ContinuationLocalStorage()
cls.setRootContext({})

function assign (context) {
  const currentContext = cls.getContext() || {}
  const newContext = Object.assign(currentContext, context)
  cls.setContext(newContext)
}

function getRootSpan () {
  const context = cls.getContext() || cls.getRootContext()
  return context.currentSpan
}

function startRootSpan (tracer, operationName, spanContext) {
  const span = spanContext ?
    tracer.startSpan(operationName, {
      childOf: spanContext
    })
    : tracer.startSpan(operationName)

  cls.assign({
    currentSpan: span
  })

  return span
}

function startChildSpan (tracer, operationName) {
  const context = cls.getContext() || cls.getRootContext()

  const span = context.currentSpan ?
    tracer.startSpan(operationName, {
      childOf: context.currentSpan.context()
    })
    : tracer.startSpan(operationName)

  return span
}

module.exports = Object.assign(cls, {
  assign,
  getRootSpan,
  startRootSpan,
  startChildSpan
})
