const featureTransport = context.young.features.transport;
const featureLocation = context.young.features.location;

const config = ProxyUtils.yaml.safeLoad($files[0]);
const productionPlatform = "mihomo";

const proxies = await produceArtifact({
  type: context.productionType,
  name: context.productionTarget,
  platform: "json",
  produceType: "internal",
})
  .then((proxies) => featureBeautify.func.sortProxies({ proxies }))
  .then((proxies) => {
    const transportGroups = featureTransport.func.completeTransport({
      proxies: proxies,
      fallback: ["HK", "JP", "SG", "US"],
    });

    Object.keys(transportGroups).map((selectorName) => {
      const selected = transportGroups[selectorName];
      if (selected.use && selected.proxies.length > 1) {
        config["proxy-groups"] = [
          {
            type: "select",
            name: selected.name,
            proxies: [...selected.proxies],
          },
          ...config["proxy-groups"],
        ];
      }
    });
    return featureTransport.func.removeInvalidDestination({ proxies });
  })
  .then((proxies) => {
    const notHidden = ({ proxy }) => {
      return proxy.properties === undefined || !proxy.properties.hidden;
    };
    const out = proxies
      .filter((proxy) => notHidden({ proxy }))
      .filter((proxy) => proxy.name && proxy.name.length > 0)
      .map((proxy) => proxy.name);

    config["proxy-groups"]
      .filter((pg) =>
        ["select", "urltest", "fallback", "load-balance"].includes(pg.type),
      )
      .map((selector) => {
        if (
          [
            "🙋 Select",
            "🔍 Google",
            "💻 Dev",
            "🪟 Microsoft",
            "📺 Media-Social",
            "🤖 AI-Service",
          ].includes(selector.name)
        ) {
          selector.proxies.push(...out);
        } else if (["✈️ TelegramDC1(NA)"].includes(selector.name)) {
          selector.proxies.push(
            ...out.filter(
              (o) =>
                featureLocation.func.getArea({ name: o }) ===
                "AREA_NORTH_AMERICA",
            ),
          );
        } else if (["✈️ TelegramDC4(EU)"].includes(selector.name)) {
          selector.proxies.push(
            ...out.filter(
              (o) =>
                featureLocation.func.getArea({ name: o }) === "AREA_EUROPE",
            ),
          );
        } else if (["✈️ TelegramDC5(AP)"].includes(selector.name)) {
          selector.proxies.push(
            ...out.filter(
              (o) => featureLocation.func.getArea({ name: o }) === "AREA_ASIA",
            ),
          );
        }
      });
    return proxies;
  })
  .then((proxies) => {
    const placeHoldDomain =
      "__this_is_a_placehold_domain_._this_rule_is_generated_by_substore.example.com";
    const placeHoldIP = "223.5.5.5";
    const directIP = new Set();
    const directSite = new Set();
    for (const proxy of proxies) {
      if (
        (!"server") in proxy ||
        ("dialer-proxy" in proxy && proxy["dialer-proxy"] !== "")
      ) {
        continue;
      }
      const serverAddr = proxy.server;
      if (serverAddr.includes(":")) {
        // IPv6
        directIP.add(serverAddr);
      } else {
        const dots = serverAddr.split(".");
        if (dots.length === 4 && Number.isInteger(Number(dots[3]))) {
          directIP.add(serverAddr);
        } else {
          directSite.add(serverAddr);
        }
      }
    }

    if (!("rule-providers" in config)) config["rule-providers"] = {};
    if (directIP.size === 0) directIP.add(placeHoldIP);
    if (directSite.size === 0) directSite.add(placeHoldDomain);

    config["rule-providers"]["_geoip-direct"] = {
      type: "inline",
      behavior: "ipcidr",
      payload: [...directIP].map((ip) =>
        ip.includes(":") ? ip + "/128" : ip + "/32",
      ),
    };
    config["rule-providers"]["_geosite-direct"] = {
      type: "inline",
      behavior: "classical",
      payload: [...directSite].map((site) => ["DOMAIN", site].join(",")),
    };

    return proxies;
  });

if (!Array.isArray(config.proxies)) config.proxies = [];
config.proxies = [
  ...config.proxies,
  ...ProxyUtils.yaml
    .safeLoad(ProxyUtils.produce([...proxies], productionPlatform))
    .proxies.map((p) => {
      Object.keys(p).forEach((key) => {
        if (key.startsWith("_") || ["properties"].includes(key)) {
          delete p[key];
        }
      });
      return p;
    }),
];

$content = ProxyUtils.yaml.dump(config);
