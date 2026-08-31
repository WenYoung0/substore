// @call = applyTransport
// @import = transport
const applyTransport = ({
  proxies = [],
  config = {},
  experimental = {},
  ua = {},
  ...rest
}) => {
  const transportGroups = context.features.transport.completeTransport({
    proxies: proxies,
    detourName: (cca2) => {
      let defaultTransportName = "🚀 Transport";
      if (ua?.isZhCN) {
        defaultTransportName = "🚀 链式传输";
      } else if (ua?.isZhTW) {
        defaultTransportName = "🚀 鏈式傳輸";
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
        !context.features.transport.isDestionation({ proxy }) ||
        "dialer-proxy" in proxy,
    ),
    experimental,
    config,
    ua,
    ...rest,
  };
};
