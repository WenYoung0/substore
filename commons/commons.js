const clearProxies = ({ proxies, platform }) => {
  if (platform === commons.const.platformNameSingbox) {
    proxies.forEach((element) => {
      element.tag = element.tag.trim();
    });
  }
  if (platform === commons.const.platformNameMihomo) {
    proxies.forEach((element) => {
      element.name = element.name.trim();
    });
  }

  return proxies;
};

let commonObj = { load: true, func: {}, const: {} };

commonObj.func.clearProxies = clearProxies;

commonObj.const.platformNameSingbox = "sing-box";
commonObj.const.platformNameMihomo = "mihomo";

context.young = {
  ...(context.young || {}),
  commons: commonObj,
};
