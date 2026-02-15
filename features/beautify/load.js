const featureLocation = context.young.features.location;

const sortProxies = ({ proxies }) => {
  const emptyProviderKey = "_empty";
  const providerList = {};
  const finalProxies = [];
  for (const proxy of proxies) {
    let providerName = emptyProviderKey;
    if (
      proxy.properties !== undefined &&
      proxy.properties.provider !== undefined
    ) {
      providerName = proxy.properties.provider;
      proxy.name = [providerName, proxy.name].join("/");
    }
    if (!Array.isArray(providerList[providerName]))
      providerList[providerName] = [];
    providerList[providerName].push(proxy);
    proxy.name = proxy.name.trim();
  }
  Object.keys(providerList)
    .sort((a, b) => {
      return a.localeCompare(b);
    })
    .map((providerName) => {
      const providerSet = providerList[providerName];
      providerSet.sort((a, b) => {
        const locationDiff =
          featureLocation.func.getOrder({ name: a.name }) -
          featureLocation.func.getOrder({ name: b.name });
        if (locationDiff !== 0) return locationDiff;

        return a.name.localeCompare(b.name);
      });
      return providerSet;
    })
    .map((providerSet) => {
      finalProxies.push(...providerSet);
    });

  return finalProxies;
};

const beautifyObj = { load: true, func: {} };

beautifyObj.func.sortProxies = sortProxies;

context.young = {
  ...(context.young || {}),
  features: {
    ...(context.young?.features || {}),
    beautify: beautifyObj,
  },
};
