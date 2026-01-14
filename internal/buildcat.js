const config = ProxyUtils.yaml.safeLoad($files[0]);
const propertiesHidden = "_hidden";

const transportDetourSelector = "🚀 Transport";

const featureProperties = context.young.features.properties;
const featureTransport = context.young.features.transport;
const featureLocation = context.young.features.location;

const commons = context.young.commons;

const productionPlatform = commons.const.platformMihomo;

await produceArtifact({
  type: context.productionType,
  name: context.productionTarget,
  platform: productionPlatform,
  produceType: "internal",
})
  .then((proxies) =>
    proxies.map((p) =>
      featureProperties.func.bindProxy({
        proxy: p,
        platform: productionPlatform,
      })
    )
  )
  .then((proxies) =>
    featureTransport.func.apply({
      config: config,
      proxies: proxies,
      transportDetourSelector: transportDetourSelector,
      platform: productionPlatform,
    })
  )
  .then((proxies) => {
    config["proxy-groups"].map((selector) => {
      const out = proxies
        .filter(
          (p) =>
            !featureProperties.func
              .getPropertiesFromProxy({
                proxy: p,
                platform: productionPlatform,
              })
              .includes(propertiesHidden)
        )
        .map((p) => p.name.trim())
        .filter((p) => p && p.length > 0);

      if (
        ["🙋 Select", "🔍 Google", "🪟 Microsoft", "📺 Media, Social"].includes(
          selector.name
        )
      ) {
        selector.proxies.push(...out);
      } else if (["🤖 AI-Service"].includes(selector.name)) {
        selector.proxies.push(
          ...out.filter(
            (o) => featureLocation.func.getLocation({ name: o }) !== "HK"
          )
        );
      } else if (["✈️ TelegramDC1(NA)"].includes(selector.name)) {
        selector.proxies.push(
          ...out.filter(
            (o) => featureLocation.func.getArea({ name: o }) === "NA"
          )
        );
      } else if (["✈️ TelegramDC4(EU)"].includes(selector.name)) {
        selector.proxies.push(
          ...out.filter(
            (o) => featureLocation.func.getArea({ name: o }) === "EU"
          )
        );
      } else if (["✈️ TelegramDC5(AP)"].includes(selector.name)) {
        selector.proxies.push(
          ...out.filter(
            (o) => featureLocation.func.getArea({ name: o }) === "ASIA"
          )
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

        const propertiesA = featureProperties.func.getPropertiesFromName({
          name: a,
        });
        const propertiesB = featureProperties.func.getPropertiesFromName({
          name: b,
        });

        const getPropertyPriority = (properties) => {
          const hasDestination = featureProperties.func.hasProperties({
            properties: properties,
            target: featureTransport.const.propertiesDestination,
          });

          const hasTransport = featureProperties.func.hasProperties({
            properties: properties,
            target: featureTransport.const.propertiesTransport,
          });
          if (hasDestination) return -1; // front
          if (hasTransport) return 1; // last
          return 0; // middle
        };

        const priorityDiff =
          getPropertyPriority(propertiesA) - getPropertyPriority(propertiesB);
        if (priorityDiff !== 0) return priorityDiff;

        return a.localeCompare(b);
      });
    });
    return proxies;
  })
  .then((proxies) => {
    config.proxies = [];
    config.proxies.push(
      ...proxies
        .map((p) => featureProperties.func.unbindProxy({ proxy: p }))
        .map((p) => {
          Object.keys(p).forEach((element) => {
            if (element.startsWith("_")) {
              delete p[element];
            }
          });
          return p;
        })
    );
    return proxies;
  });

$content = ProxyUtils.yaml.dump(config);
