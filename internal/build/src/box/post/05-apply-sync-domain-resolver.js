// @call = applySyncDomainResolver
const applySyncDomainResolver = ({ config = {}, ...rest }) => {
  const isDomain = (addr) => {
    if (!addr || addr.includes(":")) return false; // empty or IPv6
    const dots = addr.split(".");
    // not an IPv4 literal => treat as domain
    return !(dots.length === 4 && Number.isInteger(Number(dots[3])));
  };

  const resolverTag = (dr) => (typeof dr === "string" ? dr : dr?.server);

  // walk the produced outbounds: any node whose server is a domain and that
  // carries a domain_resolver (set in pre via _domain_resolver) gets a
  // route-level dns.rule, so external resolution of that domain matches the
  // internal outbound resolution instead of diverging.
  const servedDomains = {};
  for (const outbound of config.outbounds ?? []) {
    if (!isDomain(outbound.server)) continue;

    let tag = resolverTag(outbound.domain_resolver);
    if (!tag) {
      const routeDefaultResolver = config?.route?.default_domain_resolver;
      if (routeDefaultResolver && typeof routeDefaultResolver === "string") {
        tag = routeDefaultResolver;
      } else if (
        routeDefaultResolver.server &&
        typeof routeDefaultResolver.server === "string"
      ) {
        tag = routeDefaultResolver.server;
      } else {
        tag = context.const.dns.bootstrapDNSTag;
      }
    }

    servedDomains[tag] = servedDomains[tag] ?? new Set();
    servedDomains[tag].add(outbound.server);
  }

  config.dns = {
    ...(config.dns ?? {}),
    rules: [
      ...(Object.entries(servedDomains).map(([server, domains]) => ({
        domain: [...domains],
        action: "route",
        server,
      })) ?? []),
      ...(config.dns.rules ?? []),
    ],
  };

  return { config, ...rest };
};
