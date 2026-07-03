// @call = applyTransport
const applyTransport = ({
  proxies = [],
  config = {},
  experimental = {},
  ua = {},
  ...rest
}) => {
  const transportGroups = featureTransport.func.completeTransport({
    proxies: proxies,
    detourName: (cca2) => {
      let defaultTransportName = "🚀 Transport";
      const trnaslation = {
        zh_CN: "🚀 链式传输",
        en_US: defaultTransportName,
      };
      if (ua && ua.language in trnaslation) {
        defaultTransportName = trnaslation[ua.language];
      }
      if (!cca2) {
        return defaultTransportName;
      }
      return defaultTransportName + " (" + cca2 + ")";
    },
  });

  Object.keys(transportGroups).map((selectorName) => {
    const selected = transportGroups[selectorName];
    if (selected.use && selected.proxies.length > 1) {
      const transportGroup = {
        type: "selector",
        tag: selected.name,
        outbounds: [...selected.proxies],
      };
      config.outbounds = [transportGroup, ...config.outbounds];
    }
  });

  return {
    proxies: proxies.filter(
      (proxy) =>
        !featureTransport.func.isDestionation({ proxy }) ||
        "dialer-proxy" in proxy,
    ),
    experimental,
    config,
    ua,
    ...rest,
  };
};
