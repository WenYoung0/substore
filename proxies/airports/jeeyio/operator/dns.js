const operator = (proxies, targetPlatform, context) => {
  const policy = [];

  for (const rawFile of context.raw ?? []) {
    const rawFileConfig = ProxyUtils.yaml.safeLoad(rawFile);
    policy.push(...(rawFileConfig?.dns?.["proxy-server-nameserver"] || []));
  }

  if (policy.length == 0) {
    return proxies;
  }

  const dnsServer = policy[0];
  const dnsServerObject = parseStringAsDNS(dnsServer);
  if (!dnsServerObject) {
    return proxies;
  }

  return proxies.map((p) => ({
    ...(p ?? {}),
    properties: {
      ...(p.properties ?? {}),
      dns: dnsServerObject,
    },
  }));
};

const parseStringAsDNS = (dnsServer) => {
  if (!dnsServer) return;

  let jsURL;

  if (dnsServer.includes("://")) {
    jsURL = new URL(dnsServer);
  } else {
    let fixed = input;

    // IPv6: 1:1:1:1... -> [1:1:1:1...]
    if (!input.startsWith("[") && (input.match(/:/g) || []).length > 1) {
      fixed = `[${input}]`;
    }

    jsURL = new URL(`udp://${fixed}`);
  }

  schema = jsURL.protocol.replace(":", "");

  return {
    server: jsURL.hostname,
    server_port: jsURL.port ? parseInt(url.port, 10) : 0,
    type: jsURL.protocol.replace(":", ""),
    path: jsURL.pathname,
  };
};
