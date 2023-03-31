export function flattenNestedProperties(obj) {
  const flatObj = {}
  for (let key in obj) {
    if (obj[key].hasOwnProperty("allOf")) {
      const nestedObj = obj[key]["allOf"][0]["properties"]
      for (let innerKey in nestedObj) {
        flatObj[key + "." + innerKey] = nestedObj[innerKey]
      }
    } else {
      flatObj[key] = obj[key]
    }
  }
  return flatObj
}
