const config = JSON.parse($files[0]);

const propertiesHidden = "_hidden";

const transportDetourSelector = "🚀 Transport";

const featureProperties = context.young.features.properties;
const featureTransport = context.young.features.transport;
const commons = context.young.commons;

let proxies = await produceArtifact({
  type: context.productionType,
  name: context.productionTarget,
  platform: commons.builtin.platformNameSingbox,
  produceType: "internal",
})
  .then((proxies) =>
    proxies.map((p) =>
      featureProperties.func.bindProxy({
        proxy: p,
        platform: context.productionPlatform,
      })
    )
  )
  .then((proxies) =>
    featureTransport.func.apply({
      config: config,
      proxies: proxies,
      transportDetourSelector: transportDetourSelector,
      platform: context.productionPlatform,
    })
  );

const selectorGroup = config.outbounds.filter(
  (p) => p.type === "selector" || p.type === "urltest"
);

selectorGroup.map((selector) => {
  const out = proxies
    .filter(
      (p) =>
        !featureProperties.func
          .getPropertiesFromProxy({
            proxy: p,
            platform: context.productionPlatform,
          })
          .includes(propertiesHidden)
    )
    .filter((p) => !p.tag.includes("_shadowtls"))
    .map((p) => p.tag.trim())
    .filter((p) => p && p.length > 0);

  if (
    ["🙋 Select", "🔍 Google", "🪟 Microsoft", "📺 Media, Social"].includes(
      selector.tag
    )
  ) {
    selector.outbounds.push(...out);
  } else if (["🤖 AI-Service"].includes(selector.tag)) {
    selector.outbounds.push(
      ...out.filter((o) => !["🇭🇰"].some((loc) => o.startsWith(loc)))
    );
  } else if (["✈️ TelegramDC1(NA)"].includes(selector.tag)) {
    selector.outbounds.push(
      ...out.filter((o) => ["🇺🇸"].some((loc) => o.startsWith(loc)))
    );
  } else if (["✈️ TelegramDC4(EU)"].includes(selector.tag)) {
    selector.outbounds.push(
      ...out.filter((o) => ["🇩🇪", "🇬🇧", "🇳🇱"].some((loc) => o.startsWith(loc)))
    );
  } else if (["✈️ TelegramDC5(AP)"].includes(selector.tag)) {
    selector.outbounds.push(
      ...out.filter((o) =>
        ["🇭🇰", "🇹🇼", "🇸🇬", "🇲🇾", "🇯🇵"].some((loc) => o.startsWith(loc))
      )
    );
  }

  commons.func.sortNodes({
    nodes: selector.outbounds,
  });
});

config.outbounds.push(
  ...proxies.map((p) => featureProperties.func.unbindProxy({ proxy: p }))
);

$content = JSON.stringify(config, null, 2);
