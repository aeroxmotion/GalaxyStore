import { GalaxyPlugin } from 'https://cdn.jsdelivr.net/gh/LosMaquios/GalaxyJS/dist/galaxy.esm.js'

import GalaxyStore from './GalaxyStore.js'

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
    GalaxyElement.prototype.$store = this.$store
  }
}
