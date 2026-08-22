const operator = (proxies, targetPlatform, context) => {
  // https://github.com/sub-store-org/Sub-Store/pull/607#issuecomment-4897776686
  const collectedMapping = {};
  for (const rawFile of context.raw ?? []) {
    const rawFileConfig = ProxyUtils.yaml.safeLoad(rawFile);
    Object.assign(collectedMapping, rawFileConfig.hosts);
  }

  return proxies.map((proxy) => {
    if (proxy.server) {
      server = collectedMapping[proxy.server] || proxy.server;
      return { ...proxy, server };
    }
    return proxy;
  });
};
