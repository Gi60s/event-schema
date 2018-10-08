'use strict'
const Ajv = require('ajv')

const ajv = new Ajv()
const map = new WeakMap()

function EventSpec() {
  if (!(this instanceof EventSpec)) return new EventSpec()
  map.set(this, {
    topics: {},
    handlers: {}
  })
}

EventSpec.prototype.define = function (topic, schema) {
  const topics = map.get(this).topics
  if (topics[topic]) throw Error('Topic already defined: ' + name)
  if (typeof schema === 'boolean') {
    topics[topic] = schema
  } else if (schema && typeof schema === 'object') {
    topics[topic] = ajv.compile(schema)
  } else {
    throw Error('Invalid schema supplied. Must be true, false, or a non-null object. Received: ' + schema)
  }
}

EventSpec.prototype.publish = function (topic, payload) {
  const data = map.get(this)
  const handlers = data.handlers
  const topics = data.topics

  // validate that the topic exists
  const schema = topics[topic]
  if (!schema) throw Error('Topic not defined: ' + topic)

  // validate the payload against the schema
  if (!schema.validate(payload)) throw Error(schema.errors)

  // execute the subscribed handlers
  if (handlers[topic]) handlers[topic].forEach(handler => handler(event))
}

EventSpec.prototype.subscribe = function (topic, handler) {
  const handlers = map.get(this).handlers
  if (!handlers[topic]) handlers[topic] = []
  if (!handlers[topic].includes(handler)) {
    handlers[topic].push(handler)
  }
}