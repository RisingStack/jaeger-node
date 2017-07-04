'use strict'

const { ContinuationLocalStorage } = require('asyncctx')

const cls = new ContinuationLocalStorage()
cls.setRootContext({})

/**
* @function assign
* @return {SpanContext} spanContext
*/
function assign (spanContext) {
  const currentContext = cls.getContext() || {}
  const newContext = Object.assign(currentContext, spanContext)

  cls.setContext(newContext)
}

/**
* @function getRootSpan
* @return {Span}
*/
function getRootSpan () {
  const context = cls.getContext() || cls.getRootContext()
  return context.currentSpan
}

/**
* @function startRootSpan
* @param {Tracer} tracer
* @param {String} operationName
* @param {SpanContext} [parentSpanContext]
* @return {Span}
*/
function startRootSpan (tracer, operationName, parentSpanContext) {
  const span = tracer.startSpan(operationName, {
    childOf: parentSpanContext && parentSpanContext.isValid
      ? parentSpanContext
      : undefined
  })

  cls.assign({
    currentSpan: span
  })

  return span
}

/**
* @function startChildSpan
* @param {Tracer} tracer
* @param {String} operationName
* @return {Span}
*/
function startChildSpan (tracer, operationName) {
  const parentSpan = getRootSpan()
  const parentSpanContext = parentSpan ? parentSpan.context() : undefined

  const span = tracer.startSpan(operationName, {
    childOf: parentSpanContext && parentSpanContext.isValid
      ? parentSpanContext
      : undefined
  })

  return span
}

module.exports = Object.assign(cls, {
  assign,
  getRootSpan,
  startRootSpan,
  startChildSpan
})
