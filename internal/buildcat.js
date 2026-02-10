const config = ProxyUtils.yaml.safeLoad($files[0]);

const featureTransport = context.young.features.transport;
const featureLocation = context.young.features.location;

const productionPlatform = "mihomo";

const proxies = await produceArtifact({
  type: context.productionType,
  name: context.productionTarget,
  platform: "json",
  produceType: "internal",
})
  .then((proxies) =>
    proxies.map((p) => {
      p.name = p.name.trim();
      return p;
    }),
  )
  .then((proxies) => {
    const transportGroups = featureTransport.func.completeTransport({
      proxies: proxies,
    });

    Object.keys(transportGroups).map((selectorName) => {
      if (transportGroups[selectorName].length > 1) {
        config["proxy-groups"] = [
          {
            type: "select",
            name: selectorName,
            proxies: [...transportGroups[selectorName]],
          },
          ...config["proxy-groups"],
        ];
      }
    });
    return proxies;
  })
  .then((proxies) => {
    const notHidden = ({ proxy }) => {
      return proxy.properties === undefined || !proxy.properties.hidden;
    };
    const destinationHasTransport = ({ proxy }) => {
      return (
        featureTransport.func.isDestionation({ proxy }) &&
        proxy["dialer-proxy"] !== undefined
      );
    };
    const out = proxies
      .filter(
        (proxy) => notHidden({ proxy }) && destinationHasTransport({ proxy }),
      )
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
          ].includes(selector.tag)
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

        selector.proxies.sort((a, b) => {
          const special = ["DIRECT", "🙋 Select"];
          if (special.includes(a) && !special.includes(b)) {
            return -1;
          }
          if (!special.includes(a) && special.includes(b)) {
            return 1;
          }

          const locationDiff =
            featureLocation.func.getOrder({ name: a }) -
            featureLocation.func.getOrder({ name: b });
          if (locationDiff !== 0) return locationDiff;

          return a.localeCompare(b);
        });
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
      behavior: "ipcdir",
      payload: [...directIP].map((ip) =>
        ip.includes(":") ? ip + "/128" : ip + "/32",
      ),
    };
    config["rule-providers"]["_geosite-direct"] = {
      type: "inline",
      behavior: "classic",
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
