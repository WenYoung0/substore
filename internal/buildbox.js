const featureTransport = context.young.features.transport;
const featureLocation = context.young.features.location;
const featureBeautify = context.young.features.beautify;
const secretPatch = context.secret?.patch;

const config = JSON.parse($files[0]);
const productionPlatform = "sing-box";

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
        config.outbounds = [
          {
            type: "selector",
            tag: selected.name,
            outbounds: [...selected.proxies],
          },
          ...config.outbounds,
        ];
      }
      return;
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
      });
    return proxies;
  })
  .then((proxies) => {
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
        continue;
      }

      const dots = serverAddr.split(".");
      if (dots.length === 4 && Number.isInteger(Number(dots[3])))
        directIP.add(serverAddr); // IPv4
      else directSite.add(serverAddr); // Domain
    }

    config.route?.rule_set?.map((rs) => {
      if (rs.tag === "@geosite-direct" && directSite.size > 0) {
        rs.rules[0].domain = [
          ...(rs.rules[0].domain ?? []),
          ...[...directSite],
        ];
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

    return proxies;
  });

config.outbounds = [
  ...(config.outbounds ?? []),
  ...JSON.parse(ProxyUtils.produce([...proxies], productionPlatform)).outbounds,
];
featureBeautify.func.completeRemoteRuleSetBox({
  config: config,
  downloadDetour: "direct-bootstrap",
  geoipURL: (ruleSetName) =>
    "https://raw.githubusercontent.com/Loyalsoldier/geoip/refs/heads/release/srs/" +
    ruleSetName.slice(ruleSetName.indexOf("-") + 1, ruleSetName.length) +
    ".srs",
});

if (typeof secretPatch === "function") secretPatch({ config, proxies });
$content = JSON.stringify(config, null, 2);
