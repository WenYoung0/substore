const clearProxies = ({ proxies, platform }) => {
  if (platform === commons.builtin.platformNameSingbox) {
    proxies.forEach((element) => {
      element.tag = element.tag.trim();
    });
  }
  if (platform === commons.builtin.platformNameMihomo) {
    proxies.forEach((element) => {
      element.name = element.name.trim();
    });
  }

  return proxies;
};

const sortNodes = ({ nodes }) => {
  if (!Array.isArray(nodes)) {
    return nodes;
  }

  const orders = [
    "🇨🇳",
    "🇭🇰",
    "🇻🇳",
    "🇹🇭",
    "🇹🇼",
    "🇯🇵",
    "🇸🇬",
    "🇲🇾",
    "🇰🇷",
    "🇷🇺",
    "🇦🇺",
    "🇺🇸",
    "🇨🇦",
    "🇩🇪",
    "🇳🇱",
    "🇬🇧",
    "🇹🇷",
    "🇧🇷",
    "🇳🇬",
  ];

  function getOrder({ name }) {
    name = name.toLowerCase();
    for (let idx = 0; idx < orders.length; idx++) {
      const element = orders[idx];
      if (name.startsWith(element)) {
        return idx;
      }
    }
    return -1;
  }

  nodes.sort((a, b) => {
    const orderDiff = getOrder({ name: a }) - getOrder({ name: b });
    if (orderDiff !== 0) return orderDiff;

    return a.localeCompare(b);
  });

  return nodes;
};

let commonObj = { load: true, func: {}, builtin: {} };

commonObj.func.clearProxies = clearProxies;
commonObj.func.sortNodes = sortNodes;

commonObj.builtin.platformNameSingbox = "sing-box";
commonObj.builtin.platformNameMihomo = "mihomo";

context.young = {
  ...(context.young || {}),
  commons: commonObj,
};
