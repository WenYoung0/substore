const operator = (proxies, targetPlatform, context) => {
  // https://github.com/sub-store-org/Sub-Store/pull/607#issuecomment-4897776686
  const policy = {};

  for (const rawFile of context.raw ?? []) {
    const rawFileConfig = ProxyUtils.yaml.safeLoad(rawFile);
    Object.assign(policy, rawFileConfig?.dns?.["nameserver-policy"] || {});
  }
  const domainRules = Object.entries(policy).filter(
    ([key]) => !key.includes(":"),
  );

  return proxies.map((proxy) => {
    const serverHost = proxy?.server;
    const hit = serverHost
      ? domainRules.find(([pattern]) => domainMatch(serverHost, pattern))
      : undefined;

    const dnsServer = parseStringAsDNS(hit ? hit[1] : undefined);
    if (dnsServer) {
      return {
        ...proxy,
        properties: {
          ...(proxy.properties ?? {}),
          dns: dnsServer,
        },
      };
    }
    return proxy;
  });
};

const domainMatch = (domain, pattern) => {
  if (typeof domain !== "string") return false;

  if (pattern.startsWith("+.")) {
    const base = pattern.slice(2);
    return domain === base || domain.endsWith("." + base);
  }
  if (pattern.startsWith("*.")) {
    const rest = domain.slice(0, -(pattern.length - 1));
    return (
      domain.endsWith(pattern.slice(1)) &&
      rest.length > 0 &&
      !rest.includes(".")
    );
  }
  if (pattern.startsWith(".")) return domain.endsWith(pattern);
  return domain === pattern;
};

const parseStringAsDNS = (dnsServer) => {
  if (!dnsServer) return;

  let jsURL;

  if (dnsServer.includes("://")) {
    jsURL = new URL(dnsServer);
  } else {
    let fixed = dnsServer;

    // IPv6: 1:1:1:1... -> [1:1:1:1...]
    if (
      !dnsServer.startsWith("[") &&
      (dnsServer.match(/:/g) || []).length > 1
    ) {
      fixed = `[${dnsServer}]`;
    }

    jsURL = new URL(`udp://${fixed}`);
  }

  const schema = jsURL.protocol.replace(":", "");

  return {
    server: jsURL.hostname,
    server_port: jsURL.port ? parseInt(jsURL.port, 10) : 0,
    type: schema,
    path: jsURL.pathname,
  };
};
