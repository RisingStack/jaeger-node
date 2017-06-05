# jaeger-node

Out of the box distributed tracing for Node.js applications.

## Technologies

- [async_hooks](https://github.com/nodejs/node/blob/master/doc/api/async_hooks.md)
- [Jaeger](https://uber.github.io/jaeger/)
- [OpenTracing](http://opentracing.io/)

**Requirements**

- Node.js, >= v8
- Jaeger

## Getting started

```js
const Tracer = require('@risingstack/jaeger')

const tracer = new Tracer({
  serviceName: 'my-server-2',
  tags: {
    gitTag: 'foobar'
  }
})
```

**To start Jaeger and visit it's dashboard:**

```sh
docker run -d -p5775:5775/udp -p6831:6831/udp -p6832:6832/udp -p5778:5778 -p16686:16686 -p14268:14268 jaegertracing/all-in-one:latest && open http://localhost:16686
```

## Example

```sh
node example/server1.js
node example/server2.js
```

![Jaeger Node.js tracing](https://cloud.githubusercontent.com/assets/1764512/26798299/38b54ff0-4a30-11e7-8cff-2b04096f6ef3.png)

## TODO

- automatic instrumentation for `require`
- database instrumentation
- test coverage
- multiple sampling algorithms
