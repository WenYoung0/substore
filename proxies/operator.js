function operator(proxies, targetPlatform, context) {
  return proxies.map((proxy) => {
    if (proxy.type === "anytls") proxy["min-idle-session"] = 32;
    if (!proxy.udp) proxy.udp = true; // enable udp for all proxy
    return proxy;
  });
}
