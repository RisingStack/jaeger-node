<a name="2.5.0"></a>
## 2.5.0 (2017-09-01)


<a name="2.4.0"></a>
## 2.4.0 (2017-09-01)


#### Features

* **package:** use @risingstack/opentracing-auto for instrumentation ([76174858](git+https://github.com/RisingStack/jaeger-node.git/commit/76174858))


<a name="2.3.0"></a>
## 2.3.0 (2017-08-28)


<a name="2.2.0"></a>
## 2.2.0 (2017-08-26)


#### Features

* **mysql:** add instrumentation ([36fb2c5d](git+https://github.com/RisingStack/jaeger-node.git/commit/36fb2c5d))


<a name="2.1.3"></a>
## 2.1.3 (2017-08-23)

* test(mongo-core): cover with tests ([8374502](https://github.com/RisingStack/jaeger-node/commit/8374502))
* test(pg): cover with tests ([8a110ac](https://github.com/RisingStack/jaeger-node/commit/8a110ac))
* chore(pakage): update dependencies ([b142b94](https://github.com/RisingStack/jaeger-node/commit/b142b94))



<a name="2.1.2"></a>
## 2.1.2 (2017-07-12)

* fix(instrumentation/https): removed unnecessary instrumentation, https uses http in the background ([79ef8fb](https://github.com/RisingStack/jaeger-node/commit/79ef8fb))
* test(instrumentation/https): cover with tests ([7643a8f](https://github.com/RisingStack/jaeger-node/commit/7643a8f))
* chore(package): add coverage reporter ([d66acb1](https://github.com/RisingStack/jaeger-node/commit/d66acb1))



<a name="2.1.1"></a>
## 2.1.1 (2017-07-11)

* chore(package): update ([c52eabc](https://github.com/RisingStack/jaeger-node/commit/c52eabc))
* fix(instrumentation/https): add https instrumentation ([2a44c7c](https://github.com/RisingStack/jaeger-node/commit/2a44c7c))
* test(cls,tracer): cover with tests ([70c198e](https://github.com/RisingStack/jaeger-node/commit/70c198e))
* test(instrumentation/express): cover ([be1a4be](https://github.com/RisingStack/jaeger-node/commit/be1a4be))
* test(instrumentation/expressError): add tests ([8795641](https://github.com/RisingStack/jaeger-node/commit/8795641))
* test(instrumentation/http): cover with tests ([2a9bbbc](https://github.com/RisingStack/jaeger-node/commit/2a9bbbc))
* docs(readme): add travis badge ([ed39285](https://github.com/RisingStack/jaeger-node/commit/ed39285))



<a name="2.1.0"></a>
# 2.1.0 (2017-07-04)

* feat(opentracing): add RPC kind ([8eba518](https://github.com/RisingStack/jaeger-node/commit/8eba518))
* fix(cls): validate span context ([9f94cdf](https://github.com/RisingStack/jaeger-node/commit/9f94cdf))
* fix(jaeger): do not use built=in opentracing ([cfcc137](https://github.com/RisingStack/jaeger-node/commit/cfcc137))
* docs(readme): fix example ([e574dc2](https://github.com/RisingStack/jaeger-node/commit/e574dc2))
* docs(readme): fix reporter docs ([663b2aa](https://github.com/RisingStack/jaeger-node/commit/663b2aa))
* docs(readme): fix warning typo ([a57b853](https://github.com/RisingStack/jaeger-node/commit/a57b853))



<a name="2.0.0"></a>
# 2.0.0 (2017-07-04)

* feat(tracer): jaeger-client interface ([f153326](https://github.com/RisingStack/jaeger-node/commit/f153326))


### BREAKING CHANGE

* tracer constructor is now follows jaeger-client


<a name="1.3.0"></a>
# 1.3.0 (2017-07-03)

* chore(package): update dependencies ([87b23bc](https://github.com/RisingStack/jaeger-node/commit/87b23bc))
* chore(package): update package lock ([0c29447](https://github.com/RisingStack/jaeger-node/commit/0c29447))
* feat(span): use inject and extract for span context ([dd3bd14](https://github.com/RisingStack/jaeger-node/commit/dd3bd14))



<a name="1.2.0"></a>
# 1.2.0 (2017-06-21)

* feat(pg): add PostgreSQL support, version instrumentations ([0509958](https://github.com/RisingStack/jaeger-node/commit/0509958))



<a name="1.1.1"></a>
## 1.1.1 (2017-06-21)

* fix(example): fix ports ([262412a](https://github.com/RisingStack/jaeger-node/commit/262412a))
* docs(readme): replace image ([9bde7bc](https://github.com/RisingStack/jaeger-node/commit/9bde7bc))



