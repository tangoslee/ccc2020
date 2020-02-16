class Subscriber {
  constructor (subscriber, id) {
    this.subscriber = subscriber
    this.id = id
  }

  unsubscribe () {
    this.subscriber.delete(this.id)
  }
}

const GameStore = {
  state: {},
  subscriber: new Map(),
  initState (state) {
    this.state = Object.freeze({
      ...state
    })
  },
  subscribe (type, fn) {
    if (typeof type !== 'string' || type.trim().length === 0) {
      throw new Error('mutation.type should be a string')
    }
    if (typeof fn !== 'function') {
      throw new Error('fn should be a function')
    }

    if (!this.subscriber.has(type)) {
      this.subscriber.set(type, new Map())
    }

    const id = Math.random().toString(36).substr(2, 9)
    this.subscriber.get(type).set(id, fn)
    return new Subscriber(this.subscriber.get(type), id)
  },
  publish (type, payload = null, localState = null) {

    if (localState !== null) {
      this.state = Object.freeze({
        ...this.state,
        ...localState
      })
    }

    if (this.subscriber.has(type)) {
      // console.log('publish', { type, payload, localState, fn: this.subscriber.get(type) })
      this.subscriber.get(type).forEach(fn => fn(payload, { state: this.state }))
    }
  }
}

/**
 * @example
 *
 * 1. init
 *  GameStore.initState({
 *    name: 1
 *  })
 *
 * 2. subscribe
 *  GameStore.subscribe('mounted', (payload, { state }) => {
 *    console.log('Game subscribe', payload, state)
 *  })
 *
 * 3. publish
 *  GameStore.publish('mounted', { width: this.width, height: this.height }, { tim: 2 })
 */
export {
  GameStore
}
