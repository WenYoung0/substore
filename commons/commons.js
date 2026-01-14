const platformSingbox = "sing-box";
const platformMihomo = "mihomo";

const getPlatform = () => {
  return context.productionPlatform;
};

const getPlatformNameKey = ({ platform }) => {
  if (!platform) {
    platform = getPlatform();
  }
  if (platform === platformMihomo) {
    return "name";
  }
  if (platform === platformSingbox) {
    return "tag";
  }
  throw "unknwon platform";
};

const getName = ({ proxy, platform }) => {
  return proxy[getPlatformNameKey({ platform: platform })];
};

const clearProxies = ({ proxies, platform }) => {
  const key = getPlatformNameKey({ platform: platform });

  return proxies.map((p) => (p[key] = p[key].trim()));
};

const commonObj = { load: true, func: {}, const: {} };

commonObj.func.getPlatform = getPlatform;
commonObj.func.getPlatformNameKey = getPlatformNameKey;
commonObj.func.getName = getName;
commonObj.func.clearProxies = clearProxies;

commonObj.const.platformSingbox = platformSingbox;
commonObj.const.platformMihomo = platformMihomo;

context.young = {
  ...(context.young || {}),
  commons: commonObj,
};
