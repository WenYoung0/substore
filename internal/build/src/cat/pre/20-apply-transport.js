// @call = applyTransport
// @import = transport
const applyTransport = ({
  proxies = [],
  config = {},
  experimental = {},
  ...rest
}) => {
  const transportGroups = context.features.transport.completeTransport({
    proxies: proxies,
  });

  Object.keys(transportGroups).map((selectorName) => {
    const selected = transportGroups[selectorName];
    if (selected.use && selected.proxies.length > 1) {
      const transportGroup = {
        type: "select",
        name: selected.name,
        proxies: [...selected.proxies],
      };
      config["proxy-groups"] = [transportGroup, ...config["proxy-groups"]];
    }
  });
  return {
    proxies: proxies.filter(
      (proxy) =>
        !context.features.transport.isDestionation({ proxy }) ||
        "dialer-proxy" in proxy,
    ),
    config,
    ...rest,
  };
};
