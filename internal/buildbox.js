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
      p.name = p.name.trim();
      return p;
    }),
  )
  .then((proxies) => {
    const out = proxies
      .filter((p) => p.properties === undefined || !p.properties.hidden)
      .map((p) => p.name)
      .filter((p) => p && p.length > 0);

    config.outbounds
      .filter((p) => ["selector", "urltest"].includes(p.type))
      .map((selector) => {
        if (["🤖 AI-Service"].includes(selector.tag)) {
          selector.outbounds.push(
            ...out.filter(
              (o) => featureLocation.func.getLocation({ name: o }) !== "HK",
            ),
          );
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
        } else {
          selector.outbounds.push(...out);
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
    });
    return proxies;
  });

config.outbounds.push(
  ...JSON.parse(ProxyUtils.produce([...proxies], productionPlatform)).outbounds,
);

$content = JSON.stringify(config, null, 2);
