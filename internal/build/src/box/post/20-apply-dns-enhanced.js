// @call = applyDnsEnhanced
const applyDnsEnhanced = ({ config = {}, experimental = {}, ...rest }) => {
  // client subnet
  const getClientIP = () => {
    const req = $options?._req;
    const headers = req?.headers ?? {};

    const ip =
      headers["cf-connecting-ip"] ||
      headers["true-client-ip"] ||
      headers["x-real-ip"] ||
      headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req?.socket?.remoteAddress;
    return ip === undefined ? "" : ip.trim();
  };

  let ip = getClientIP();
  if (ip === "") ip = "114.114.114.114";
  for (const dnsRule of [...(config?.dns?.rules ?? [])]) {
    if (
      dnsRule.client_subnet === "0.0.0.0/0" ||
      dnsRule.client_subnet === "::/0"
    ) {
      dnsRule.client_subnet = ip + (ip.includes(":") ? "/128" : "/32");
    }
  }

  // experimental h3
  if (experimental.dns_cn_use_h3 && Array.isArray(config?.dns?.servers))
    config.dns.servers.map((dns) => {
      if (dns.tag === "dns-cn" && dns.type === "https") dns.type = "h3";
    });

  // leak
  if (experimental.dns_leak_boost && Array.isArray(config?.dns?.rules)) {
    config.dns.rules.map((r) => {
      if (r.server === "dns-ecs") {
        r.server = "dns-cn";
        r.client_subnet = undefined;
      }
    });
  }

  // no local
  if (experimental.dns_local_use_dhcp && Array.isArray(config?.dns?.servers)) {
    config.dns.servers
      .filter((server) => server.type === "local")
      .forEach((server) => server.type === "dhcp");
  }

  return { config, experimental, ...rest };
};
