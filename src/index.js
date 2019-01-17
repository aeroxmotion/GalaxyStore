import { GalaxyPlugin } from 'https://cdn.jsdelivr.net/gh/LosMaquios/GalaxyJS/dist/galaxy.esm.js'

import GalaxyStore, { bindState, bindMutations } from './GalaxyStore.js'

/**
 * Export main class
 */
export { GalaxyStore }

/**
 * Export plugin
 */
export default class GalaxyStorePlugin extends GalaxyPlugin {
  static init () {
    this.$store = new GalaxyStore(this.$options)
  }

  static install (GalaxyElement) {
    const { $store } = this
    const proto = GalaxyElement.prototype

    proto.$store = $store

    if (GalaxyElement.withState) {
      bindState($store, proto, GalaxyElement.withState)
    }

    if (GalaxyElement.withMutations) {
      bindMutations($store, proto, GalaxyElement.withMutations)
    }
  }
}
