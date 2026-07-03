// @call = applyGeoSiteGeoIP
const applyGeoSiteGeoIP = ({ proxies = [], config = {}, ...rest }) => {
  const directIP = new Set();
  const directSite = new Set();
  for (const proxy of proxies) {
    if (proxy.server === undefined || proxy["dialer-proxy"]) {
      continue;
    }
    const serverAddr = proxy.server;
    if (serverAddr.includes(":")) {
      // IPv6
      directIP.add(serverAddr);
      continue;
    }

    const dots = serverAddr.split(".");
    if (dots.length === 4 && Number.isInteger(Number(dots[3])))
      directIP.add(serverAddr); // IPv4
    else directSite.add(serverAddr); // Domain
  }
  if (context.secret?.metadata?.ghproxy)
    directSite.add(context.secret?.metadata?.ghproxy);
  if (context.secret?.metadata?.subscribeURL)
    directSite.add(context.secret?.metadata?.subscribeURL);

  if (!("rule-providers" in config)) config["rule-providers"] = {};

  config["rule-providers"]["_geoip-direct"] = {
    type: "inline",
    behavior: "ipcidr",
    payload: [...directIP].map((ip) =>
      ip.includes(":") ? ip + "/128" : ip + "/32",
    ),
  };
  config["rule-providers"]["_geosite-direct"] = {
    type: "inline",
    behavior: "domain",
    payload: [...directSite],
  };

  return { proxies, config, ...rest };
};
