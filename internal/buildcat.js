const config = ProxyUtils.yaml.safeLoad($files[0]);
const propertiesHidden = "_hidden";

const transportDetourSelector = "🚀 Transport";

const featureProperties = context.young.features.properties;
const featureTransport = context.young.features.transport;
const commons = context.young.commons;

const productionPlatform = commons.builtin.platformNameMihomo;

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
          ...out.filter((o) => !["🇭🇰"].some((loc) => o.startsWith(loc)))
        );
      } else if (["✈️ TelegramDC1(NA)"].includes(selector.name)) {
        selector.proxies.push(
          ...out.filter((o) => ["🇺🇸"].some((loc) => o.startsWith(loc)))
        );
      } else if (["✈️ TelegramDC4(EU)"].includes(selector.name)) {
        selector.proxies.push(
          ...out.filter((o) =>
            ["🇩🇪", "🇬🇧", "🇳🇱"].some((loc) => o.startsWith(loc))
          )
        );
      } else if (["✈️ TelegramDC5(AP)"].includes(selector.name)) {
        selector.proxies.push(
          ...out.filter((o) =>
            ["🇭🇰", "🇹🇼", "🇸🇬", "🇲🇾", "🇯🇵"].some((loc) => o.startsWith(loc))
          )
        );
      }

      commons.func.sortNodes({
        nodes: selector.proxies,
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
  });

$content = ProxyUtils.yaml.dump(config);
