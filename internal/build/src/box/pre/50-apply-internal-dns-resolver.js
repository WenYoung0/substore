// @call = applyInternalDNSResolver
const applyInternalDNSResolver = ({ config = {}, proxies = [], ...rest }) => {
  const isDomain = (addr) => {
    if (!addr || addr.includes(":")) return false; // empty or IPv6
    const dots = addr.split(".");
    // not an IPv4 literal => treat as domain
    return !(dots.length === 4 && Number.isInteger(Number(dots[3])));
  };

  // normalize proxy.properties.dns (string shorthand or object) into a
  // sing-box dns server object with a deterministic, dedupe-friendly tag.
  const buildSingDns = (proxy) => {
    const dns = proxy.properties.dns;
    const props = { type: "", server: "", path: "", port: 0 };
    if (typeof dns === "string") {
      props.type = "udp";
      props.server = dns;
    } else {
      props.type = dns.type ?? "";
      props.server = dns.server ?? "";
      props.path = dns.path ?? "";
      props.port = dns.port ?? 0;
    }

    const tag = ["dns", props.type, props.server, props.path, props.port]
      .filter((v) => v)
      .join("_");

    const singDns = { type: props.type, server: props.server, tag };
    if (props.port) singDns.server_port = props.port;
    if ((props.type === "https" || props.type === "h3") && props.path !== "") {
      singDns.path = props.path;
    }
    return singDns;
  };

  // some airports ship their own dns. expose each as a sing-box dns server and
  // resolve the proxy's own server domain through it via the outbound's
  // domain_resolver field (sub-store passes `_domain_resolver` through). the
  // matching dns.rules entries keep route-level (external) resolution of those
  // same domains consistent with the internal outbound resolution.
  const dnsServers = {};
  const servedDomains = {};

  for (const proxy of proxies) {
    if (!proxy.properties?.dns) continue;

    const singDns = buildSingDns(proxy);
    dnsServers[singDns.tag] = singDns;
    proxy._domain_resolver = { server: singDns.tag };

    if (isDomain(proxy.server)) {
      servedDomains[singDns.tag] = servedDomains[singDns.tag] ?? new Set();
      servedDomains[singDns.tag].add(proxy.server);
    }
  }

  if (Object.keys(dnsServers).length === 0) {
    return { config, proxies, ...rest };
  }

  config.dns = config.dns ?? {};
  config.dns.servers = [
    ...(config.dns.servers ?? []),
    ...Object.values(dnsServers),
  ];

  const domainRules = Object.entries(servedDomains)
    .filter(([, domains]) => domains.size > 0)
    .map(([server, domains]) => ({
      domain: [...domains],
      action: "route",
      server,
    }));
  if (domainRules.length > 0) {
    config.dns.rules = [...domainRules, ...(config.dns.rules ?? [])];
  }

  return { config, proxies, ...rest };
};
