'use strict'
const Ajv = require('ajv')

const ajv = new Ajv()
const map = new WeakMap()

module.exports = EventSchema

function EventSchema() {
  if (!(this instanceof EventSchema)) return new EventSchema()
  map.set(this, {
    topics: {},
    handlers: {}
  })
}

EventSchema.prototype.define = function (topic, schema) {
  const topics = map.get(this).topics
  if (topics[topic]) throw Error('Topic already defined: ' + name)
  if (schema && typeof schema === 'object') {
    topics[topic] = ajv.compile(schema)
  } else {
    throw Error('Invalid schema supplied. Must be a non-null object. Received: ' + schema)
  }
}

EventSchema.prototype.emit = function (topic, payload) {
  const data = map.get(this)
  const handlers = data.handlers
  const topics = data.topics

  // get the validator
  const validate = topics[topic]
  if (!validate) throw Error('Topic not defined: ' + topic)

  // validate the payload against the schema
  if (!validate(payload)) {
    let message = 'Invalid schema '
    const multiple = validate.errors.length > 1
    validate.errors.forEach(error => {
      if (multiple) message += '\n  '
      message += 'at ' + error.schemaPath + ': ' + error.message
    })
    throw Error(message)
  }

  // execute the subscribed handlers
  if (handlers[topic]) handlers[topic].forEach(handler => handler(payload))
}

EventSchema.prototype.off = function (topic, handler) {
  const handlers = map.get(this).handlers
  if (handlers[topic]) {
    const index = handlers[topic].indexOf(handler)
    if (index !== -1) handlers[topic].splice(index, 1)
  }
}

EventSchema.prototype.on = function (topic, handler) {
  const handlers = map.get(this).handlers
  if (!handlers[topic]) handlers[topic] = []
  if (!handlers[topic].includes(handler)) {
    handlers[topic].push(handler)
  }
}

EventSchema.prototype.once = function (topic, handler) {
  const eventSchema = this
  function proxy(payload) {
    eventSchema.off(topic, proxy)
    handler(payload)
  }
  this.on(topic, proxy)
}