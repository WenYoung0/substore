const propertiesRemove = "_remove_properties";

const KeyProperties = "nodeProperties";

const commons = context.young.commons;

const getPropertiesFromName = ({ name }) => {
  if (!(name.includes("(") && name.includes(")"))) {
    return [];
  }
  const properties = name
    .trim()
    .substring(name.indexOf("(") + 1, name.indexOf(")"))
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p.length !== 0 && p !== "(" && p !== ")");

  return properties;
};

const getPropertiesFromProxy = ({ proxy, platform }) => {
  if (KeyProperties in proxy) {
    return proxy[KeyProperties];
  }
  return getPropertiesFromName({
    name: commons.func.getName({ proxy: proxy, platform: platform }),
  });
};

const cleanNameByProperties = ({ name, properties }) => {
  if (!(name.includes("(") && name.includes(")"))) {
    return name;
  }

  const noPropertiesName = name.substring(0, name.indexOf("(")).trim();
  if (properties.includes(propertiesRemove)) {
    return noPropertiesName;
  }

  return (
    noPropertiesName +
    " " +
    "(" +
    properties
      .filter((p) => !p.startsWith("_"))
      .map((p) => p.split(":")[0])
      .join(",") +
    ")"
  );
};

const hasProperties = ({ properties, target }) => {
  if (!Array.isArray(properties) || properties.length === 0) {
    return false;
  }

  for (let i = 0; i < properties.length; i++) {
    const p = properties[i]
    if (!p.includes(":") && p === target) {
      return true
    }
    if (p.split(":")[0] === target) {
      return true;
    }
  }
  return false;
};

const getPropertiesArgs = ({ properties, target }) => {
  if (!Array.isArray(properties) || properties.length === 0) {
    return [];
  }
  for (const p in properties) {
    const sp = p.split(":");
    if (sp[0] === target) {
      sp.shift();
      return sp;
    }
  }
  return [];
};

const bindProxy = ({ proxy, platform }) => {
  const nameKey = commons.func.getPlatformNameKey({ platform: platform });
  proxy[KeyProperties] = getPropertiesFromName({ name: proxy[nameKey] });
  proxy[nameKey] = cleanNameByProperties({
    name: proxy[nameKey],
    properties: proxy[KeyProperties],
  });
  return proxy;
};

const unbindProxy = ({ proxy }) => {
  if (KeyProperties in proxy) {
    delete proxy[KeyProperties];
  }
  return proxy;
};

const propertiesObj = { load: true, func: {}, const: {} };

propertiesObj.func.getPropertiesFromName = getPropertiesFromName;
propertiesObj.func.getPropertiesFromProxy = getPropertiesFromProxy;
propertiesObj.func.cleanNameByProperties = cleanNameByProperties;
propertiesObj.func.hasProperties = hasProperties;
propertiesObj.func.getPropertiesArgs = getPropertiesArgs;

propertiesObj.func.bindProxy = bindProxy;
propertiesObj.func.unbindProxy = unbindProxy;

propertiesObj.const.propertiesRemove = propertiesRemove;
propertiesObj.const.KeyProperties = KeyProperties;

context.young = {
  ...(context.young || {}),
  features: {
    ...(context.young?.features || {}),
    properties: propertiesObj,
  },
};
