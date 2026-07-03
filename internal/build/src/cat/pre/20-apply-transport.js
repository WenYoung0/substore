// @call = applyTransport
const applyTransport = ({
  proxies = [],
  config = {},
  experimental = {},
  ...rest
}) => {
  const transportGroups = featureTransport.func.completeTransport({
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
        !featureTransport.func.isDestionation({ proxy }) ||
        "dialer-proxy" in proxy,
    ),
    config,
    ...rest,
  };
};
