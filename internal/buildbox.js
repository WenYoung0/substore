const config = JSON.parse($files[0]);

const featureTransport = context.young.features.transport;
const featureLocation = context.young.features.location;

const productionPlatform = "sing-box";

const proxies = await produceArtifact({
  type: context.productionType,
  name: context.productionTarget,
  platform: "json",
  produceType: "internal",
})
  .then((proxies) =>
    proxies.map((p) => {
      if (p.properties !== undefined && p.properties.provider !== undefined) {
        p.name = [p.properties.provider, p.name].join("/");
      }
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
        config.outbounds = [
          {
            type: "selector",
            tag: selectorName,
            outbounds: [...transportGroups[selectorName]],
          },
          ...config.outbounds,
        ];
      } 
      else {
        for (proxy of proxies) {
          if (
            "dialer-proxy" in proxy &&
            proxy["dialer-proxy"] === selectorName
          ) {
            proxy["dialer-proxy"] = transportGroups[selectorName][0];
          }
        }
      }
    });

    return proxies.filter(
      (proxy) =>
        !featureTransport.func.isDestionation({ proxy }) ||
        "dialer-proxy" in proxy,
    );
  })
  .then((proxies) => {
    const notHidden = ({ proxy }) => {
      return proxy.properties === undefined || !proxy.properties.hidden;
    };
    const out = proxies
      .filter((proxy) => notHidden({ proxy }))
      .filter((proxy) => proxy.name && proxy.name.length > 0)
      .map((proxy) => proxy.name);

    config.outbounds
      .filter((p) => ["selector", "urltest"].includes(p.type))
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
              (o) =>
                featureLocation.func.getArea({ name: o }) === "AREA_EUROPE",
            ),
          );
        } else if (["✈️ TelegramDC5(AP)"].includes(selector.tag)) {
          selector.outbounds.push(
            ...out.filter(
              (o) => featureLocation.func.getArea({ name: o }) === "AREA_ASIA",
            ),
          );
        }

        selector.outbounds.sort((a, b) => {
          const special = ["Direct", "🙋 Select"];
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
    if (!("rule_set" in config.route)) config.route["rule_set"] = [];
    if (directIP.size === 0) directIP.add(placeHoldIP);
    if (directSite.size === 0) directSite.add(placeHoldDomain);

    config.route["rule_set"].push(
      {
        type: "inline",
        tag: "@geoip-direct",
        rules: [
          {
            ip_cidr: [...directIP].map((ip) =>
              ip.includes(":") ? ip + "/128" : ip + "/32",
            ),
          },
        ],
      },
      {
        type: "inline",
        tag: "@geosite-direct",
        rules: [
          {
            domain: [...directSite],
          },
        ],
      },
    );

    return proxies;
  });

config.outbounds.push(
  ...JSON.parse(ProxyUtils.produce([...proxies], productionPlatform)).outbounds,
);

$content = JSON.stringify(config, null, 2);
