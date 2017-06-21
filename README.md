# jaeger-node

Out of the box distributed tracing for Node.js applications.

**WARNING: do not use in production yet**

## Technologies

- [async_hooks](https://github.com/nodejs/node/blob/master/doc/api/async_hooks.md)
- [Jaeger](https://uber.github.io/jaeger/)
- [OpenTracing](http://opentracing.io/)

**Requirements**

- Node.js, >= v8
- Jaeger

## Getting started

```sh
npm install @risingstack/jaeger
```

```js
// must be in the first two lines of your application
const Tracer = require('@risingstack/jaeger')
const tracer = new Tracer({
  serviceName: 'my-server-2',
  tags: {
    gitTag: 'foobar'
  }
})

// rest of your code
const express = require('express')
// ...
```

**To start Jaeger and visit it's dashboard:**

```sh
docker run -d -p5775:5775/udp -p6831:6831/udp -p6832:6832/udp -p5778:5778 -p16686:16686 -p14268:14268 jaegertracing/all-in-one:latest && open http://localhost:16686
```

## Example

The example require a running MongoDB.  

```sh
npm run example
curl http://localhost:3000
open http://localhost:16686
```

![Jaeger Node.js tracing](https://user-images.githubusercontent.com/1764512/26843812-c3198758-4af1-11e7-8aa3-1da55d9e58b6.png)

## API

### new Tracer(options)

Create a new Tracer and instrument modules.

- `options.serviceName`: Name of your service
  - **required**
  - example: `'my-service-1'`
- `options.tags`: Meta tags
  - *optional*
  - example: `{ gitHash: 'foobar' }`
- `options.maxSamplesPerSecond`: maximum number of samples per second
  - *optional*
  - default: `1`
- `options.sender`: sender configuration *(Your Jaeger backend)*
  - *optional*
  - default: `{ host: 'localhost', port: 6832, maxPacketSize: 65000 }`

## Instrumentations

- [http](https://nodejs.org/api/http.html)
- [express](https://expressjs.com/)
- [MongoDB](https://www.npmjs.com/package/mongodb-core)

## Known issues

- `EMSGSIZE` can be reached easily: [related issue](https://github.com/uber/jaeger-client-node/issues/124)

## TODO

- more database instrumentation: PG, MySQL, Redis etc.
- messaging broker instrumentation: RabbitMQ, Kafka etc.
- test coverage
- multiple sampling algorithms
