const propertiesRemove = "_remove_properties";

const keyFroProperties = "nodeProperties";

const commons = context.young.commons;

const lookupNameKeyPlatform = ({ platform }) => {
  if (platform == commons.builtin.platformNameSingbox) {
    return "tag";
  } else if (platform == commons.builtin.platformNameMihomo) {
    return "name";
  }
  return "";
};

const getPropertiesFromName = ({ name }) => {
  if (!(name.includes("(") && name.includes(")"))) {
    return [];
  }
  name = name.trim();
  const properties = name
    .substring(name.indexOf("(") + 1, name.indexOf(")"))
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p.length !== 0 && p !== "(" && p !== ")");

  return properties;
};

const getPropertiesFromProxy = ({ proxy, platform }) => {
  if (keyFroProperties in proxy) {
    return proxy[keyFroProperties];
  }
  return getPropertiesFromName({
    name: proxy[lookupNameKeyPlatform(platform)],
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
    properties.filter((p) => !p.startsWith("_")).join(",") +
    ")"
  );
};

const bindProxy = ({ proxy, platform }) => {
  const lookup = lookupNameKeyPlatform({ platform: platform });
  proxy[keyFroProperties] = getPropertiesFromName({ name: proxy[lookup] });
  proxy[lookup] = cleanNameByProperties({
    name: proxy[lookup],
    properties: proxy[keyFroProperties],
  });
  return proxy;
};

const unbindProxy = ({ proxy }) => {
  if (keyFroProperties in proxy) {
    delete proxy[keyFroProperties];
  }
  return proxy;
};

const propertiesObj = { load: true, func: {}, builtin: {} };

propertiesObj.func.getPropertiesFromName = getPropertiesFromName;
propertiesObj.func.getPropertiesFromProxy = getPropertiesFromProxy;
propertiesObj.func.cleanNameByProperties = cleanNameByProperties;
propertiesObj.func.bindProxy = bindProxy;
propertiesObj.func.unbindProxy = unbindProxy;

propertiesObj.builtin.propertiesRemove = propertiesRemove;
propertiesObj.builtin.keyFroProperties = keyFroProperties;

context.young = {
  ...(context.young || {}),
  features: {
    ...(context.young?.features || {}),
    properties: propertiesObj,
  },
};
