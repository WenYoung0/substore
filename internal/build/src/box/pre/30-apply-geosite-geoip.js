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

  config.route?.rule_set?.map((rs) => {
    if (rs.tag === "@geosite-direct" && directSite.size > 0) {
      rs.rules[0].domain = [...(rs.rules[0].domain ?? []), ...[...directSite]];
    }

    if (rs.tag === "@geoip-direct" && directIP.size > 0) {
      rs.rules[0].ip_cidr = [
        ...(rs.rules[0].ip_cidr ?? []),
        ...[...directIP].map((ip) =>
          ip.includes(":") ? ip + "/128" : ip + "/32",
        ),
      ];
    }
  });

  return { proxies, config, ...rest };
};
