const opentracing = require('opentracing')
const shimmer = require('shimmer')
const cls = require('../cls')


const DB_TYPE = 'redis'
const OPERATION_NAME = 'redis'
const restrictedCommands = [
    'ping',
    'flushall',
    'flushdb',
    'select',
    'auth',
    'info',
    'quit',
    'slaveof',
    'config',
    'sentinel'];
function patch (redis, tracer) {
  shimmer.wrap(redis && redis.RedisClient && redis.RedisClient.prototype,
  			   'internal_send_command',
    			wrapInternalSendCommand)


  function wrapInternalSendCommand (original) {
    return function wrappedInternalSendCommand (commandObj) {
      var command = commandObj && commandObj.command
      if (restrictedCommands.indexOf(command) > -1) {
      	return original.apply(this, arguments);
    	}
      const span = cls.startChildSpan(tracer, `${OPERATION_NAME}_query ${command}`)
      span.setTag(opentracing.Tags.DB_TYPE, DB_TYPE)
      span.setTag(opentracing.Tags.DB_STATEMENT, command + commandObj.args)
      span.log(commandObj);
      if (commandObj) {
        var originalCallback = commandObj.callback
       	commandObj.callback = (err, replies) => {
       		if (err) {
          		span.log({
            	event: 'error',
            	'error.object': err,
            	message: err.message,
            	stack: err.stack
          		})
          	span.setTag(opentracing.Tags.ERROR, true)
        	}
      		if (replies) {
          		span.log({
            	result: replies
          		})
        	}
      		span.finish()
      		if (originalCallback) {
          		originalCallback(err, replies)
        		}
      	}
      	return original.apply(this, arguments)
    }
  }}


}

function unpatch (redis) {
  shimmer.unwrap(redis && redis.RedisClient && redis.RedisClient.prototype,
  			   'internal_send_command')
}

module.exports = {
  module: 'redis',
  supportedVersions: ['2.x'],
  OPERATION_NAME,
  patch,
  unpatch
}

