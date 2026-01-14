const config = JSON.parse($files[0]);

const propertiesHidden = "_hidden";

const transportDetourSelector = "🚀 Transport";

const featureProperties = context.young.features.properties;
const featureTransport = context.young.features.transport;
const featureLocation = context.young.features.location;

const commons = context.young.commons;

const productionPlatform = commons.const.platformNameSingbox;

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
    config.outbounds
      .filter((p) => p.type === "selector" || p.type === "urltest")
      .map((selector) => {
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
          .filter((p) => !p.tag.includes("_shadowtls"))
          .map((p) => p.tag.trim())
          .filter((p) => p && p.length > 0);

        if (
          [
            "🙋 Select",
            "🔍 Google",
            "🪟 Microsoft",
            "📺 Media, Social",
          ].includes(selector.tag)
        ) {
          selector.outbounds.push(...out);
        } else if (["🤖 AI-Service"].includes(selector.tag)) {
          selector.outbounds.push(
            ...out.filter(
              (o) => featureLocation.func.getLocation({ name: o }) !== "HK"
            )
          );
        } else if (["✈️ TelegramDC1(NA)"].includes(selector.tag)) {
          selector.outbounds.push(
            ...out.filter((o) => featureLocation.func.getArea({ name: o }) === "NA")
          );
        } else if (["✈️ TelegramDC4(EU)"].includes(selector.tag)) {
          selector.outbounds.push(
            ...out.filter((o) => featureLocation.func.getArea({ name: o }) === "EU")
          );
        } else if (["✈️ TelegramDC5(AP)"].includes(selector.tag)) {
          selector.outbounds.push(
            ...out.filter(
              (o) => featureLocation.func.getArea({ name: o }) === "ASIA"
            )
          );
        }

        selector.outbounds.sort((a, b) => {
          const orderDiff =
            featureLocation.func.getOrder({ name: a }) -
            featureLocation.func.getOrder({ name: b });
          if (orderDiff !== 0) return orderDiff;

          return a.localeCompare(b);
        });
      });
    return proxies;
  })
  .then((proxies) => {
    config.outbounds.push(
      ...proxies.map((p) => featureProperties.func.unbindProxy({ proxy: p }))
    );
    return proxies;
  });

$content = JSON.stringify(config, null, 2);
