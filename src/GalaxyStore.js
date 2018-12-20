import ProxyObserver from 'https://cdn.jsdelivr.net/gh/LosMaquios/ProxyObserver/index.js'

import GalaxyStoreError from './GalaxyStoreError.js'
import { getMap, getPathValue, eachKey } from './utils.js'

export default class GalaxyStore extends EventTarget {
  constructor ({ state, mutations }) {
    super()

    this.state = ProxyObserver.observe(state, {}, this._detectCommitting.bind(this))
    this.mutations = mutations

    this._observer = ProxyObserver.get(state)
    this._committing = false
  }

  commit (mutation, ...extra) {
    if (!(mutation in this.mutations)) {
      throw new GalaxyStoreError(`Unknown mutator '${mutation}'`)
    }

    this._committing = true

    const result = this.mutations[mutation](this.state, ...extra)

    if (result instanceof Promise) {
      result.then(() => { this._committing = false })
    } else {
      this._committing = false
    }
  }

  mapState (target, map) {
    eachKey(getMap(map), (prop, _map) => {
      Object.defineProperty(target, prop, {
        get: getPathValue.bind(null, this.state, _map[prop])
      })
    })

    // In galaxy instances perform render
    if (target.$render) {
      this._observer.subscribe(() => {
        target.$render()
      })
    }
  }

  mapMutations (target, map) {
    eachKey(getMap(map), (method, _map) => {
      target[method] = (...extra) => {
        this.commit(_map[method]/* <- mutation */, ...extra)
      }
    })
  }

  _detectCommitting () {
    if (!this._committing) {
      throw new GalaxyStoreError('`state` can\'t be mutated directly')
    }
  }
}
