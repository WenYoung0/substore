const clearProxies = ({ proxies, platform }) => {
  if (platform === "sing-box") {
    proxies.forEach((element) => {
      element.tag = element.tag.trim();
    });
  }
  if (platform === "mihomo") {
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

const filterLocation = ({ tags, loc, reverse }) => {
  if (reverse) {
    return tags.filter((tag) => loc.some((ll) => !tag.startsWith(ll)));
  }
  return tags.filter((tag) => loc.some((ll) => tag.startsWith(ll)));
};

let commonObj = { load: true, func: {} };

commonObj.func.clearProxies = clearProxies;
commonObj.func.sortNodes = sortNodes;
commonObj.func.filterLocation = filterLocation;

context.young = {
  ...(context.young || {}),
  common: commonObj,
};
