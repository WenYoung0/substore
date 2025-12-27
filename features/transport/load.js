if (!context?.young?.features?.properties?.load) {
  throw "feature properties required";
}

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
  const transportProxies = proxies.filter((p) =>
    featureProperties.func
      .getPropertiesFromProxy({ proxy: p })
      .includes(propertiesTransport)
  );

  const destinationProxies = proxies.filter((p) =>
    featureProperties.func
      .getPropertiesFromProxy({ proxy: p })
      .includes(propertiesDestination)
  );
  if (!(transportProxies.length > 0 && destinationProxies.length > 0)) {
    removeTransportSelectorInConfig();
    return proxies.filter(
      (p) =>
        !featureProperties.func
          .getPropertiesFromProxy({ proxy: p })
          .includes(propertiesDestination)
    );
  }

  if (transportProxies.length === 1) {
    removeTransportSelectorInConfig();
    destinationProxies.forEach((dp) => {
      dp.raw.detour = transportProxies[0].raw.tag;
    });
    return proxies;
  }
  
  const transportGroup = config.outbounds.find(
    (outbound) => outbound.tag === transportDetourSelector
  );

  transportGroup.outbounds.push(...proxies.map((p) => p.tag));
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

  const transportProxies = proxies.filter((p) =>
    featureProperties.func
      .getPropertiesFromProxy(p)
      .includes(propertiesTransport)
  );

  const destinationProxies = proxies.filter((p) =>
    featureProperties.func
      .getPropertiesFromProxy(p)
      .includes(propertiesDestination)
  );

  if (!(transportProxies.length > 0 && destinationProxies.length > 0)) {
    removeTransportSelectorInConfig();
    proxies = proxies.filter(
      (p) =>
        !featureProperties.func
          .getPropertiesFromProxy(p)
          .includes(propertiesDestination)
    );
    return proxies;
  }

  if (transportProxies.length === 1) {
    removeTransportSelectorInConfig();
    destinationProxies.forEach((dp) => {
      dp.raw["dialer-proxy"] = transportProxies[0].raw.name;
    });
    return proxies;
  }

  const transportGroup = config["proxy-groups"].find(
    (outbound) => outbound.name === transportDetourSelector
  );

  transportGroup.proxies.push(...proxies.map((p) => p.raw.name));
  destinationProxies.forEach((dp) => {
    dp.raw["dialer-proxy"] = transportDetourSelector;
  });

  return proxies;
};

const apply = ({ config, proxies, transportDetourSelector, platform }) => {
  if (platform === "sing-box") {
    return applyTransportSingBox({
      config: config,
      proxies: proxies,
      transportDetourSelector: transportDetourSelector,
    });
  }
  if (platform === "mihomo") {
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
