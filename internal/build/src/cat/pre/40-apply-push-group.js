// @call = applyPushGroup
// @import = location
const applyPushGroup = ({ proxies = [], config = {}, ...rest }) => {
  const out = proxies
    .filter(
      (proxy) =>
        proxy?.properties?.hidden === undefined || !proxy.properties.hidden,
    )
    .map((proxy) => proxy.name)
    .filter((pn) => !!pn);

  config["proxy-groups"]
    .filter((pg) =>
      ["select", "urltest", "fallback", "load-balance"].includes(pg.type),
    )
    .map((selector) => {
      if (
        [
          "🙋 Select",
          "🔍 Google",
          "🐈 Git",
          "🪟 Microsoft",
          "📺 Media-Social",
          "🤖 AI-Service",
          "🍎 Apple",
        ].includes(selector.name)
      ) {
        selector.proxies.push(...out);
      } else if (["✈️ TelegramDC1(NA)"].includes(selector.name)) {
        selector.proxies.push(
          ...out.filter(
            (o) =>
              context.features.location.getArea({ name: o }) ===
              "AREA_NORTH_AMERICA",
          ),
        );
      } else if (["✈️ TelegramDC4(EU)"].includes(selector.name)) {
        selector.proxies.push(
          ...out.filter(
            (o) => context.features.location.getArea({ name: o }) === "AREA_EUROPE",
          ),
        );
      } else if (["✈️ TelegramDC5(AP)"].includes(selector.name)) {
        selector.proxies.push(
          ...out.filter(
            (o) => context.features.location.getArea({ name: o }) === "AREA_ASIA",
          ),
        );
      }
    });
  return { proxies, config, ...rest };
};
