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

    const tag =
      "dns-" +
      [props.type, props.server, props.path, props.port]
        .filter((v) => v)
        .join("_");

    const singDns = { type: props.type, server: props.server, tag };
    if (props.port) singDns.server_port = props.port;
    if ((props.type === "https" || props.type === "h3") && props.path !== "") {
      singDns.path = props.path;
    }

    // a dns server addressed by a domain needs a bootstrap resolver to
    // look up that address itself.
    if (isDomain(singDns.server)) {
      singDns.domain_resolver = { server: context.const.dns.bootstrapDNSTag };
    }

    singDns.detour = context.const.outbound.direct;
    return singDns;
  };

  // some airports ship their own dns. expose each as a sing-box dns server and
  // point the proxy's outbound.domain_resolver at it (sub-store passes
  // `_domain_resolver` through). the matching route-level dns.rules are added
  // later in post from the produced outbounds (see apply-internal-dns-rules).
  const dnsServers = {};

  for (const proxy of proxies) {
    if (!proxy.properties?.dns) continue;

    const singDns = buildSingDns(proxy);
    dnsServers[singDns.tag] = singDns;
    proxy._domain_resolver = { server: singDns.tag };
  }

  if (Object.keys(dnsServers).length === 0) {
    return { config, proxies, ...rest };
  }

  config.dns = config.dns ?? {};
  config.dns.servers = [
    ...(config.dns.servers ?? []),
    ...Object.values(dnsServers),
  ];

  return { config, proxies, ...rest };
};
