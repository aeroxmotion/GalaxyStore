import ProxyObserver from 'https://cdn.jsdelivr.net/gh/LosMaquios/ProxyObserver/index.js'

import GalaxyStoreError from './GalaxyStoreError.js'
import { getMap, getPathValue, eachKey } from './utils.js'

export default class GalaxyStore extends EventTarget {
  constructor ({ state, mutations }) {
    super()

    this.state = ProxyObserver.observe(state, {}, this._detectCommiting.bind(this))
    this.mutations = mutations

    this._observer = ProxyObserver.get(state)
    this._commiting = false
  }

  commit (mutation, ...extra) {
    if (!(mutation in this.mutations)) {
      throw new GalaxyStoreError(`Unknown mutator '${mutation}'`)
    }

    this._commiting = true

    const result = this.mutations[mutation](this.state, ...extra)

    if (result instanceof Promise) {
      result.then(() => { this._commiting = false })
    } else {
      this._commiting = false
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

  _detectCommiting () {
    if (!this._commiting) {
      throw new GalaxyStoreError('`state` can\'t be mutated directly')
    }
  }
}
