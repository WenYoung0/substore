function operator(proxies, targetPlatform, context) {
  return proxies.map((proxy) => {
    if (proxy.type === "anytls") proxy["min-idle-session"] = 32;
  });
}
