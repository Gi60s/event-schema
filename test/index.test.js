'use strict'
const expect = require('chai').expect
const EventSchema = require('../index')

describe('event-schema', () => {
  let es

  beforeEach(() => {
    es = new EventSchema()
  })

  it('can emit to defined topic with a valid schema', done => {
    es.define('x', {
      type: 'string',
      maxLength: 5
    })
    es.on('x', function(payload) {
      expect(payload).to.equal('hello')
      done()
    })
    es.emit('x', 'hello')
  })

  it('throws an error when emitting to undefined topic', () => {
    expect(() => es.emit('x', 'hello')).to.throw(/Topic not defined: x/)
  })

  it('throws an error when emitting with an invalid payload', () => {
    es.define('x', {
      type: 'string',
      maxLength: 5
    })
    expect(() => es.emit('x', 1)).to.throw(/Invalid schema at #\/type: should be string/)
  })

  it('can unsubscribe', () => {
    es.define('x', {
      type: 'string',
      maxLength: 5
    })

    let called = 0
    function handler(payload) {
      called++
    }

    es.on('x', handler)
    es.emit('x', 'hello')
    es.emit('x', 'hello')
    es.off('x', handler)
    es.emit('x', 'hello')

    expect(called).to.equal(2)
  })

  it('can subscribe multiple', () => {
    es.define('x', {
      type: 'string',
      maxLength: 5
    })

    const called = []
    es.on('x', function() { called.push('1') })
    es.on('x', function() { called.push('2') })
    es.emit('x', 'hello')

    expect(called).to.deep.equal(['1', '2'])
  })

  it('can subscribe prior to topic being defined', () => {
    let called = false
    es.on('x', function() { called = true })

    es.define('x', {
      type: 'string',
      maxLength: 5
    })
    es.emit('x', 'hello')

    expect(called).to.equal(true)
  })

  it('can listen only once', () => {
    es.define('x', {
      type: 'string',
      maxLength: 5
    })

    let called = 0
    es.once('x', function (payload) {
      called++
    })

    es.emit('x', 'hello')
    es.emit('x', 'hello')

    expect(called).to.equal(1)
  })

})