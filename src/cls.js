'use strict'

const { ContinuationLocalStorage } = require('asyncctx')

const cls = new ContinuationLocalStorage()
cls.setRootContext({})

function assign (context) {
  const currentContext = cls.getContext()
  const newContext = Object.assign(currentContext, context)
  cls.setContext(newContext)
}

function startSpan (tracer, operationName) {
  const context = cls.getContext()

  const span = context.currentSpan ?
    tracer.startSpan(operationName, {
      childOf: context.currentSpan.context()
    })
    : tracer.startSpan(operationName)

  cls.assign({
    currentSpan: span
  })

  return span
}

module.exports = Object.assign(cls, {
  assign,
  startSpan
})
