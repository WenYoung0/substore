if (!context?.young?.features?.properties?.load) {
  throw "feature properties required";
}

const commons = context.young.commons;

const featureProperties = context.young.features.properties;

const propertiesTransport = "T";
const propertiesDestination = "D";

const applyTransportSingBox = ({
  config,
  proxies,
  transportDetourSelector,
}) => {
  const removeTransportSelectorInConfig = () => {
    config.outbounds = config.outbounds.filter(
      (outbound) => outbound.tag !== transportDetourSelector
    );
  };

  const getProperties = (p) => {
    return featureProperties.func.getPropertiesFromProxy({
      proxy: p,
      platform: commons.builtin.platformNameSingbox,
    });
  };

  const transportProxies = proxies.filter((p) =>
    getProperties(p).includes(propertiesTransport)
  );

  const destinationProxies = proxies.filter((p) =>
    getProperties(p).includes(propertiesDestination)
  );

  if (!(transportProxies.length > 0 && destinationProxies.length > 0)) {
    removeTransportSelectorInConfig();
    return proxies.filter(
      (p) => !getProperties(p).includes(propertiesDestination)
    );
  }

  if (transportProxies.length === 1) {
    removeTransportSelectorInConfig();
    destinationProxies.forEach((dp) => {
      dp.detour = transportProxies[0].tag;
    });
    return proxies;
  }

  const transportGroup = config.outbounds.find(
    (outbound) => outbound.tag === transportDetourSelector
  );

  transportGroup.outbounds.push(...transportProxies.map(p => p.tag));
  destinationProxies.forEach((dp) => {
    dp["detour"] = transportDetourSelector;
  });

  return proxies;
};

const applyTransportMihomo = ({ config, proxies, transportDetourSelector }) => {
  const removeTransportSelectorInConfig = () => {
    config.outbounds = config["proxy-groups"].filter(
      (outbound) => outbound.name !== transportDetourSelector
    );
  };

  const getProperties = (p) => {
    return featureProperties.func.getPropertiesFromProxy({
      proxy: p,
      platform: commons.builtin.platformNameMihomo,
    });
  };

  const transportProxies = proxies.filter((p) =>
    getProperties(p).includes(propertiesTransport)
  );

  const destinationProxies = proxies.filter((p) =>
    getProperties(p).includes(propertiesDestination)
  );

  if (!(transportProxies.length > 0 && destinationProxies.length > 0)) {
    removeTransportSelectorInConfig();
    proxies = proxies.filter(
      (p) => !getProperties(p).includes(propertiesDestination)
    );
    return proxies;
  }

  if (transportProxies.length === 1) {
    removeTransportSelectorInConfig();
    destinationProxies.forEach((dp) => {
      dp["dialer-proxy"] = transportProxies[0].name;
    });
    return proxies;
  }

  const transportGroup = config["proxy-groups"].find(
    (outbound) => outbound.name === transportDetourSelector
  );
  if (!("proxies" in transportGroup)) {
    transportGroup.proxies = []
  }
  transportGroup.proxies.push(...transportProxies.map((p) => p.name));
  destinationProxies.forEach((dp) => {
    dp["dialer-proxy"] = transportDetourSelector;
  });

  return proxies;
};

const apply = ({ config, proxies, transportDetourSelector, platform }) => {
  if (platform === commons.builtin.platformNameSingbox) {
    return applyTransportSingBox({
      config: config,
      proxies: proxies,
      transportDetourSelector: transportDetourSelector,
    });
  }
  if (platform === commons.builtin.platformNameMihomo) {
    return applyTransportMihomo({
      config: config,
      proxies: proxies,
      transportDetourSelector: transportDetourSelector,
    });
  }

  return proxies;
};

let transportObj = { load: true, func: {} };

transportObj.func.apply = apply;

context.young = {
  ...(context.young || {}),
  features: {
    ...(context.young?.features || {}),
    transport: transportObj,
  },
};
