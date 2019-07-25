export const deepSearch = (object, key, predicate) => {
  if (object.hasOwnProperty(key) && predicate(key, object[key]) === true) {
    // expose children length
    if (object.children) object.childrenLength = object.children.length
    // remove children on object
    delete object.children
    return object
  }

  for (let i = 0; i < Object.keys(object).length; i++) {
    if (typeof object[Object.keys(object)[i]] === "object") {
      let o = deepSearch(object[Object.keys(object)[i]], key, predicate)
      if (o != null) return o
    }
  }
  return null
}

export const deepSearchMultiple = (object, key, predicate) => {
  let result = []
  const searchDeep = (object, key, predicate) => {
    if (object.hasOwnProperty(key) && predicate(key, object[key]) === true) {
      const match = Object.assign({}, object)
      // expose children length
      if (match.children) match.childrenLength = match.children.length
      // remove children on object
      delete match.children
      result.push(match)
    }
  
    for (let i = 0; i < Object.keys(object).length; i++) {
      if (typeof object[Object.keys(object)[i]] === "object") {
        searchDeep(object[Object.keys(object)[i]], key, predicate)
      }
    }
    return result
  }
  return searchDeep(object, key, predicate)
}