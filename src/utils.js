export function eachKey (object, iterator) {
  Object.keys(object).forEach(key => {
    iterator(object[key], object)
  })
}

export function getPathValue (source, path) {
  // TODO: Throw error on `undefined` value
  return path.split('.').reduce((value, key) => value[key], source)
}

export function getMap (props) {
  if (!Array.isArray(props)) return props

  return props.reduce((map, prop) => {
    map[prop] = prop
    return map
  }, {})
}
