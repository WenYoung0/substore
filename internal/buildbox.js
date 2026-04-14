const featureTransport = context.young.features.transport;
const featureLocation = context.young.features.location;

const directDetourOutbound = "Direct";
const productionPlatform = "sing-box";

const produce = (proxies = []) => {
  return JSON.parse(ProxyUtils.produce([...proxies], productionPlatform))
    .outbounds;
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
  const sortedProxies = featureLocation.func.sortProxies({ proxies });

  // Notice heer , different platform has different name selector (tag or name)
  const names = produce(proxies).map((pp) => pp.tag);
  return {
    proxies: sortedProxies.filter((sp) => names.includes(sp.name)),
    ...rest,
  };
};

const applyTransport = ({
  proxies = [],
  config = {},
  experimental = {},
  ...rest
}) => {
  const transportGroups = featureTransport.func.completeTransport({
    proxies: proxies,
  });

  Object.keys(transportGroups).map((selectorName) => {
    const selected = transportGroups[selectorName];
    if (selected.use && selected.proxies.length > 1) {
      const transportGroup = {
        type: "selector",
        tag: selected.name,
        outbounds: [...selected.proxies],
      };
      if (!!experimental.transport_use_urltest) {
        transportGroup.type = "urltest";
        transportGroup.tolerance = "20ms";
        transportGroup.interval = "30s";
      }
      config.outbounds = [
        {
          ...transportGroup,
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
    experimental,
    config,
    ...rest,
  };
};

const applyPushGroup = ({ proxies = [], config = {}, ...rest }) => {
  const out = proxies.filter(
    (proxy) =>
      proxy?.properties?.hidden === undefined || !proxy.properties.hidden,
  );
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
        selector.outbounds.push(...out.map((o) => o.name));
      } else if (["✈️ TelegramDC1(NA)"].includes(selector.tag)) {
        selector.outbounds.push(
          ...out
            .filter(
              (o) =>
                featureLocation.func.getArea(o) === "AREA_NORTH_AMERICA" ||
                featureLocation.func.getLocation(o) == "JP",
            )
            .map((o) => o.name),
        );
      } else if (["✈️ TelegramDC4(EU)"].includes(selector.tag)) {
        selector.outbounds.push(
          ...out
            .filter((o) => featureLocation.func.getArea(o) === "AREA_EUROPE")
            .map((o) => o.name),
        );
      } else if (["✈️ TelegramDC5(AP)"].includes(selector.tag)) {
        selector.outbounds.push(
          ...out
            .filter((o) => featureLocation.func.getArea(o) === "AREA_ASIA")
            .map((o) => o.name),
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
    if (dnsRule.client_subnet === "0.0.0.0/0") {
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
  const tailnetIPRanges = ["100.64.0.0/10", "fd7a:115c:a1e0::/48"];

  const endpoint = $options?._req?.query?.endpoint ?? "";
  const allowRouteAll =
    $options?._req?.query?.allow_route_all === "true" ?? false;

  // endpoint id generated by:
  // $ openssl rand -hex 16
  const endpointIDs = endpoint.split("_");
  const availableEndpoints = (endpoints ?? []).filter((ep) =>
    (endpointIDs ?? []).some(
      (eid) =>
        (ep.type === "tailscale" || ep.type === "wireguard") &&
        ep.properties?.endpoint?.id == eid,
    ),
  );

  if (availableEndpoints.length == 0) {
    // no endpoint available , so exclude tailnet ip range to tun configure.
    (config.inbounds ?? [])
      .filter((inbound) => inbound.type === "tun")
      .map(
        (tunin) =>
          (tunin.route_exclude_address = [
            ...(tunin.route_exclude_address ?? []),
            ...tailnetIPRanges,
          ]),
      );
    return { config, ...rest };
  } else if (allowRouteAll)
    // use `allow_route_all` to fix that some ip range may not routed
    // due the ip range was excluded by tun config.
    (config.inbounds ?? [])
      .filter((inbound) => inbound.type === "tun")
      .map((tunin) => (tunin.route_exclude_address = []));

  availableEndpoints.map((ep) => {
    if (ep.type === "wireguard") {
      config.route = {
        ...(config.route ?? {}),
        rules: [
          {
            action: "route",
            ip_cidr: ep.properties?.endpoint?.route?.ip_cidr ?? ep.address,
            outbound: ep.name,
          },
          ...(config.route?.rules ?? []),
        ],
      };
      return;
    }
    // tailscale
    config.dns = {
      ...(config.dns ?? {}),
      servers: [
        ...(config.dns?.servers ?? []),
        {
          type: "tailscale",
          tag: "dns-" + ep.name,
          endpoint: ep.name,
        },
      ],
      rules: [
        {
          action: "evaluate",
          server: "dns-" + ep.name,
        },
        {
          match_response: true,
          ip_accept_any: true,
          action: "respond",
        },
        ...(config.dns?.rules ?? []),
      ],
    };
    config.route = {
      ...(config.route ?? {}),
      rules: [
        {
          action: "route",
          ip_cidr: ep.properties?.endpoint?.route?.ip_cidr ?? tailnetIPRanges,
          outbound: ep.name,
        },
        {
          action: "route",
          domain_suffix:
            ep.properties?.endpoint?.route?.domain_suffix ?? "ts.net",
          outbound: ep.name,
        },
        ...(config.route?.rules ?? []),
      ],
    };
    return;
  });

  return { config, endpoints: availableEndpoints, ...rest };
};

const generateContext = async () => {
  const lookupQuery = (name) => {
    return $options?._req?.query?.[name];
  };

  const generated = { config: JSON.parse($files[0]), experimental: {} };

  if (lookupQuery("user") || context.test?.user) {
    const userID = lookupQuery("user") || context.test?.user || "";
    const produced = await produceArtifact({
      type: lookupQuery("prod_type") || "collection",
      name: userID,
      platform: "json",
      produceType: "internal",
    });
    generated.proxies = produced.filter((proxy) =>
      [
        "socks",
        "http",
        "ss",
        "vmess",
        "trojan",
        "naive",
        "hysteria",
        "hysteria2",
        "vless",
        "tuic",
        "anytls",
        "tor",
        "ssh",
      ].includes(proxy.type),
    );
    generated.endpoints = produced.filter((proxy) =>
      ["wireguard", "tailscale"].includes(proxy.type),
    );
  }

  (lookupQuery("experimental") || context.test?.experimental || "")
    .split(",")
    .map((fe) => {
      generated.experimental[fe] = true;
    });

  return generated;
};

const { config, proxies, endpoints } = await generateContext()
  .then(applySortAndCompability)
  .then(applyTransport)
  .then(applyGeoSiteGeoIP)
  .then(applyPushGroup)
  .then(applyBoostrapDirect)
  .then(applyClientSubnet)
  .then(applyEndpoints);

const lastProduce = ($content = JSON.stringify(
  {
    ...config,
    outbounds: [...(config.outbounds ?? []), ...produce(proxies)],
    endpoints: [...(config.endpoints ?? []), ...produceEndpoint(endpoints)],
  },
  null,
  2,
));
