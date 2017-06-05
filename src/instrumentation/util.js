'use strict'

function isExpressV4 (express) {
  const isVersion4 = !!express &&
    express.Router &&
    express.Router.process_params &&
    express.application &&
    express.application.del

  return isVersion4
}

module.exports = {
  isExpressV4
}
