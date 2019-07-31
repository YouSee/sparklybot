export const deepSearchMultiple = (shouldReturnMultiple: boolean = true, inputObject:Object, inputKey:string, inputPredicate:(value:any) => boolean) => {
  let result:Array<Object> = []
  if (!inputObject) return null
  const searchDeep = (multiple: boolean, object:any, key:string, predicate: (value:any) => boolean) => {
    if (!object) return
    if (object && typeof object === 'object' && object.hasOwnProperty(key) && predicate(object[key]) === true) {
      const match:any = Object.assign({}, object)
      // expose children length
      if (match.children) match.childrenLength = match.children.length
      // remove children on object
      delete match.children
      if (!multiple) return match
      result.push(match)
    }
  
    for (let i = 0; i < Object.keys(object).length; i++) {
      if (typeof object[Object.keys(object)[i]] === "object") {
        const search:Object = searchDeep(multiple, object[Object.keys(object)[i]], key, predicate)
        if (!multiple && search != null) return search
      }
    }
    if (!multiple) return null
    return result
  }
  return searchDeep(shouldReturnMultiple, inputObject, inputKey, inputPredicate)
}