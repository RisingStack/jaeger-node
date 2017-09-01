'use strict'

const redis = require('redis')
const { expect } = require('chai')
const { Tracer, Tags } = require('opentracing')
const cls = require('../cls')
const instrumentation = require('./redis')

describe('instrumentation: redis', () => {
  let tracer
  let mockChildSpan
  let db

  beforeEach(function () {
    tracer = new Tracer()
    mockChildSpan = {
      setTag: this.sandbox.spy(),
      log: this.sandbox.spy(),
      finish: this.sandbox.spy()
    }

    this.sandbox.stub(cls, 'startChildSpan').callsFake(() => mockChildSpan)

    instrumentation.patch(redis, tracer)

    db = redis.createClient();
    })
  afterEach(() => {
    instrumentation.unpatch(redis)
  })

  describe('#patch', () => {
    it('should start and finish span', async () => {
      const result = db.set("string key", "string val",
        function(err, replies) {expect(replies).to.be.eql("OK")
        expect(cls.startChildSpan).to.be.calledWith(tracer, `${instrumentation.OPERATION_NAME}_query set`)
        expect(mockChildSpan.setTag).to.have.calledWith(Tags.DB_TYPE, 'redis')
        expect(mockChildSpan.setTag).to.have.calledWith(Tags.DB_STATEMENT, "setstring key,string val")

        })
    })

    it('should flag error', async () => {
      const query = "string key"
        db.set("query")
        db.on("error", function (err) {
          expect(mockChildSpan.setTag).to.be.calledWith(Tags.ERROR, true)
          expect(mockChildSpan.log).to.be.calledWith({
          event: 'error',
          'error.object': err,
          message: 'ERR wrong number of arguments for \'set\' command',
          stack: err.stack
        })
        })
        return
    })
  })
})
