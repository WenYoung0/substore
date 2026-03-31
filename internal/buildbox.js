const featureTransport = context.young.features.transport;
const featureLocation = context.young.features.location;
const featureBeautify = context.young.features.beautify;

const directDetourOutbound = "Direct";
const productionPlatform = "sing-box";

const produce = (proxies = []) => {
  return JSON.parse(ProxyUtils.produce([...proxies], productionPlatform))
    .outbounds;
};

const insertRouteRule = (config, rule) => {
  config.route = {
    ...(config.route ?? {}),
    rules: [
      {
        ...rule,
      },
      ...(config.route?.rules ?? []),
    ],
  };
};

const insertDNSRule = (config, rule) => {
  config.dns = {
    ...(config.dns ?? {}),
    rules: [
      {
        ...rule,
      },
      ...(config.dns?.rules ?? []),
    ],
  };
};

const insertDNSServer = (config, rule) => {
  config.dns = {
    ...(config.dns ?? {}),
    servers: [
      {
        ...rule,
      },
      ...(config.dns?.servers ?? []),
    ],
  };
};

const produceEndpoint = (endpoints = []) => {
  return JSON.parse(
    ProxyUtils.produce(
      [
        ...endpoints.filter(
          (e) => e.type === "tailscale" || e.type === "wireguard",
        ),
      ],
      productionPlatform,
    ),
  ).endpoints;
};

const applySortAndCompability = ({ proxies = [], ...rest }) => {
  const sortedProxies = featureBeautify.func.sortProxies({ proxies });

  // Notice heer , different platform has different name selector (tag or name)
  const names = produce(proxies).map((pp) => pp.tag);
  return {
    proxies: sortedProxies.filter((sp) => names.includes(sp.name)),
    ...rest,
  };
};

const applyTransport = ({ proxies = [], config = {}, ...rest }) => {
  const transportGroups = featureTransport.func.completeTransport({
    proxies: proxies,
    fallback: ["HK", "JP", "SG", "US"],
  });

  Object.keys(transportGroups).map((selectorName) => {
    const selected = transportGroups[selectorName];
    if (selected.use && selected.proxies.length > 1) {
      config.outbounds = [
        {
          type: "selector",
          tag: selected.name,
          outbounds: [...selected.proxies],
        },
        ...config.outbounds,
      ];
    }
  });
  return {
    proxies: proxies.filter(
      (proxy) =>
        !featureTransport.func.isDestionation({ proxy }) ||
        "dialer-proxy" in proxy,
    ),
    config,
    ...rest,
  };
};

const applyPushGroup = ({ proxies = [], config = {}, ...rest }) => {
  const out = proxies
    .filter(
      (proxy) =>
        proxy?.properties?.hidden === undefined || !proxy.properties.hidden,
    )
    .map((proxy) => proxy.name)
    .filter((pn) => !!pn);

  config.outbounds
    .filter((p) => ["selector", "urltest"].includes(p.type))
    .map((selector) => {
      if (
        [
          "🙋 Select",
          "🔍 Google",
          "🐈 Git",
          "🪟 Microsoft",
          "📺 Entertainment",
          "🤖 AI-Service",
          "🍎 Apple",
        ].includes(selector.tag)
      ) {
        selector.outbounds.push(...out);
      } else if (["✈️ TelegramDC1(NA)"].includes(selector.tag)) {
        selector.outbounds.push(
          ...out.filter(
            (o) =>
              featureLocation.func.getArea({ name: o }) ===
              "AREA_NORTH_AMERICA",
          ),
        );
      } else if (["✈️ TelegramDC4(EU)"].includes(selector.tag)) {
        selector.outbounds.push(
          ...out.filter(
            (o) => featureLocation.func.getArea({ name: o }) === "AREA_EUROPE",
          ),
        );
      } else if (["✈️ TelegramDC5(AP)"].includes(selector.tag)) {
        selector.outbounds.push(
          ...out.filter(
            (o) => featureLocation.func.getArea({ name: o }) === "AREA_ASIA",
          ),
        );
      }
    });
  return { proxies, config, ...rest };
};

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

const applyClientSubnet = ({ config = {}, ...rest }) => {
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
      dnsRule.client_subnet === "::/0" ||
      dnsRule.client_subnet === ""
    ) {
      dnsRule.client_subnet = ip + (ip.includes(":") ? "/128" : "/32");
    }
  }

  return { config, ...rest };
};

const applyBoostrapDirect = ({ config = {}, ...rest }) => {
  const ghproxy = context.secret?.metadata?.ghproxy ?? "hk.gh-proxy.org";
  const githubDomains = [
    "raw.githubusercontent.com",
    "github.com",
    "gist.githubusercontent.com",
  ];

  if (Array.isArray(config.route?.rule_set)) {
    config.route.rule_set.map((ruleset) => {
      if (
        ruleset.type === "remote" &&
        githubDomains.some((domain) =>
          ruleset.url.startsWith("https://" + domain),
        )
      ) {
        ruleset.url = `https://${ghproxy}/${ruleset.url}`;
        ruleset.download_detour = directDetourOutbound;
      }
    });
  }
  if (
    config.experimental?.clash_api?.external_ui_download_url &&
    githubDomains.some((domain) =>
      config.experimental.clash_api.external_ui_download_url.startsWith(
        "https://" + domain,
      ),
    )
  ) {
    config.experimental.clash_api.external_ui_download_url = `https://${ghproxy}/${config.experimental.clash_api.external_ui_download_url}`;
    config.experimental.clash_api.external_ui_download_detour =
      directDetourOutbound;
  }

  return { config, ...rest };
};

const applyEndpoints = ({ config = {}, endpoints = [], ...rest }) => {
  const { endpoint } = $options?._req?.query ?? { endpoint: undefined };
  if (!endpoint || !endpoints) return { config, ...rest };
  const endpointIDs = endpoint.split("_");
  for (const eid of endpointIDs) {
    for (const ep of endpoints) {
      if (ep.properties?.endpoint?.id !== eid) continue;
      config.endpoints = [
        ...(config.endpoints ?? []),
        {
          ...produceEndpoint([ep])[0],
        },
      ];
      const domainMatch = {};
      if (ep.properties.endpoint.route?.domain)
        domainMatch.domain = ep.properties.endpoint.route.domain;
      if (ep.properties.endpoint.route?.domain_suffix)
        domainMatch.domain_suffix = ep.properties.endpoint.route.domain_suffix;
      if (domainMatch.domain || domainMatch.domain_suffix) {
        if (ep.type == "tailscale") {
          insertDNSRule(config, {
            ...domainMatch,
            action: "route",
            server: "dns-" + ep.name,
          });
          insertDNSServer(config, {
            type: "tailscale",
            tag: "dns-" + ep.name,
            endpoint: ep.name,
          });
        }
        insertRouteRule(config, {
          ...domainMatch,
          action: "route",
          outbound: ep.name,
        });
      }

      if (ep.properties.endpoint.route?.ip)
        insertRouteRule(config, {
          ip_cidr: ep.properties.endpoint.route.ip,
          action: "route",
          outbound: ep.name,
        });
    }
  }

  return { config, endpoints, ...rest };
};

let config = JSON.parse($files[0]);

let proxies = await produceArtifact({
  type: context.productionType,
  name: context.productionTarget,
  platform: "json",
  produceType: "internal",
});

let endpoints = [];
if (context.endpointGroup) {
  endpoints = await produceArtifact({
    type: context.productionType,
    name: context.endpointGroup,
    platform: "json",
    produceType: "internal",
  });
}

({ proxies, config } = await Promise.resolve({
  proxies,
  endpoints,
  config,
})
  .then(applySortAndCompability)
  .then(applyTransport)
  .then(applyGeoSiteGeoIP)
  .then(applyPushGroup)
  .then(applyBoostrapDirect)
  .then(applyClientSubnet)
  .then(applyEndpoints));

const lastProduce = ($content = JSON.stringify(
  {
    ...config,
    outbounds: [...(config.outbounds ?? []), ...produce(proxies)],
  },
  null,
  2,
));
