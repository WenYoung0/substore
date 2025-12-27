const propertiesRemove = "_remove_properties"

const getPropertiesFromName = ({ name }) => {
  if (!(name.includes("(") && name.includes(")"))) {
    return []
  }

  name = name.trim()
  const properties = name
    .substring(name.indexOf("(") + 1, name.indexOf(")"))
    .split(",")
    .map(p => p.trim())
    .filter(p => p.length !== 0 && p !== "(" && p !== ")")

  return properties
}

const cleanNameByProperties = ({ name, properties }) => {
  if (!(name.includes("(") && name.includes(")"))) {
    return name
  }

  const noPropertiesName = name.substring(0, name.indexOf("(")).trim()
  if (properties.includes(propertiesRemove)) {
    return noPropertiesName
  }

  return noPropertiesName + " " + "(" + properties.filter(p => !p.startsWith("_")).join(",") + ")"
}

const castProxy = ({ proxy, lookup }) => {
  const ret = { nodeProperties: getPropertiesFromName(proxy[lookup]), raw: proxy }
  proxy[lookup] = cleanNameByProperties(proxy[lookup], ret.nodeProperties)
  return ret
}

let propertiesObj = { load: true }

propertiesObj.func.getPropertiesFromName = getPropertiesFromName
propertiesObj.func.cleanNameByProperties = cleanNameByProperties
propertiesObj.func.castProxy = castProxy
propertiesObj.builtin.propertiesRemove = propertiesRemove

context.young = {
  ...(context.young || {}),
  features: {
    ...(context.young?.features || {}),
    properties: propertiesObj
  }
};