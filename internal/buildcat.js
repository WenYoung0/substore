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
    const out = proxies
      .filter((p) => p.properties === undefined || !p.properties.hidden)
      .map((p) => p.name)
      .filter((p) => p && p.length > 0);

    config["proxy-groups"]
      .filter((pg) =>
        ["select", "urltest", "fallback", "load-balance"].includes(pg.type),
      )

      .map((selector) => {
        if (["🤖 AI-Service"].includes(selector.name)) {
          selector.proxies.push(
            ...out.filter(
              (o) => featureLocation.func.getLocation({ name: o }) !== "HK",
            ),
          );
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
        } else {
          selector.proxies.push(...out);
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

// $content = ProxyUtils.produce([...proxies], productionPlatform)
