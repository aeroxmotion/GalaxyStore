import ProxyObserver from 'https://cdn.jsdelivr.net/gh/LosMaquios/ProxyObserver/index.js'

import GalaxyStoreError from './GalaxyStoreError.js'
import { getMap, getPathValue, eachKey } from './utils.js'

export default class GalaxyStore {
  constructor ({ state, mutations }) {
    this.state = ProxyObserver.observe(state, {}, this._detectCommitting.bind(this))
    this.mutations = mutations

    this._observer = ProxyObserver.get(state)
    this._committing = false
  }

  subscribe (subscriber) {
    this._observer.subscribe(subscriber)

    return () => {
      this._observer.unsubscribe(subscriber)
    }
  }

  commit (mutation, ...extra) {
    if (!(mutation in this.mutations)) {
      throw new GalaxyStoreError(`unknown mutation '${mutation}'`)
    }

    this._committing = true

    const result = this.mutations[mutation](this.state, ...extra)

    if (result instanceof Promise) {
      result.then(() => { this._committing = false })
    } else {
      this._committing = false
    }
  }

  _detectCommitting () {
    if (!this._committing) {
      throw new GalaxyStoreError('`state` can\'t be mutated directly')
    }
  }
}

export function bindState (store, proto, map) {
  eachKey(getMap(map), (prop, _map) => {
    Object.defineProperty(proto, prop, {
      get () {
        return getPathValue(store.state, _map[prop])
      }
    })
  })

  const { onCreated } = proto

  proto.onCreated = function (...args) {

    // Render on store changes
    store.subscribe(this.$render.bind(this))

    onCreated && onCreated.apply(this, args)
  }
}

export function bindMutations (store, proto, map) {
  eachKey(getMap(map), (method, _map) => {
    proto[method] = (...extra) => store.commit(_map[method]/* <- mutation */, ...extra)
  })
}
