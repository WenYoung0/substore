const featureTransport = context.young.features.transport;
const featureLocation = context.young.features.location;
const featureBeautify = context.young.features.beautify;

const directDetourOutbound = "DIRECT";
const productionPlatform = "mihomo";

const produce = (proxies = []) => {
  return ProxyUtils.yaml.safeLoad(
    ProxyUtils.produce([...proxies], productionPlatform),
  ).proxies;
};

const applySortAndCompability = ({ proxies = [], ...rest }) => {
  const sortedProxies = featureBeautify.func.sortProxies({ proxies });

  // Notice heer , different platform has different name selector (tag or name)
  const names = produce(proxies).map((pp) => pp.name);
  return {
    proxies: sortedProxies.filter((sp) => names.includes(sp.name)),
    ...rest,
  };
};

const applyTransport = ({ proxies = [], config = {}, ...rest }) => {
  const transportGroups = featureTransport.func.completeTransport({
    proxies: proxies,
    fallback: ["HK", "JP", "SG", "US"],
  });

  Object.keys(transportGroups).map((selectorName) => {
    const selected = transportGroups[selectorName];
    if (selected.use && selected.proxies.length > 1) {
      config["proxy-groups"] = [
        {
          type: "select",
          name: selected.name,
          proxies: [...selected.proxies],
        },
        ...config["proxy-groups"],
      ];
    }
  });
  return {
    proxies: proxies.filter(
      (proxy) =>
        !featureTransport.func.isDestionation({ proxy }) ||
        "dialer-proxy" in proxy,
    ),
    config,
    ...rest,
  };
};

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
        ].includes(selector.name)
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
            (o) => featureLocation.func.getArea({ name: o }) === "AREA_EUROPE",
          ),
        );
      } else if (["✈️ TelegramDC5(AP)"].includes(selector.name)) {
        selector.proxies.push(
          ...out.filter(
            (o) => featureLocation.func.getArea({ name: o }) === "AREA_ASIA",
          ),
        );
      }
    });
  return { proxies, config, ...rest };
};

const applyGeoSiteGeoIP = ({ proxies = [], config = {}, ...rest }) => {
  const directIP = new Set();
  const directSite = new Set();
  for (const proxy of proxies) {
    if (proxy.server === undefined || proxy["dialer-proxy"]) {
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

  if (!("rule-providers" in config)) config["rule-providers"] = {};

  config["rule-providers"]["_geoip-direct"] = {
    type: "inline",
    behavior: "ipcidr",
    payload: [...directIP].map((ip) =>
      ip.includes(":") ? ip + "/128" : ip + "/32",
    ),
  };
  config["rule-providers"]["_geosite-direct"] = {
    type: "inline",
    behavior: "domain",
    payload: [...directSite],
  };

  return { proxies, config, ...rest };
};

const applyBoostrapDirect = ({ config = {}, ...rest }) => {
  const ghproxy = context.secret?.metadata?.ghproxy ?? "hk.gh-proxy.org";
  const githubDomains = [
    "raw.githubusercontent.com",
    "github.com",
    "gist.githubusercontent.com",
  ];
  if (config["rule-providers"]) {
    Object.keys(config["rule-providers"]).map((name) => {
      const ruleset = config["rule-providers"][name];
      if (
        ruleset.type === "http" &&
        githubDomains.some((domain) =>
          ruleset.url.startsWith("https://" + domain),
        )
      ) {
        ruleset.url = `https://${ghproxy}/${ruleset.url}`;
        ruleset.proxy = directDetourOutbound;
      }
    });
  }

  if (config["geox-url"]) {
    ["geoip", "geosite", "mmdb", "asn"].map((name) => {
      if (
        config["geox-url"][name] &&
        githubDomains.some((domain) =>
          config["geox-url"][name].startsWith("https://" + domain),
        )
      ) {
        config["geox-url"][name] =
          `https://${ghproxy}/${config["geox-url"][name]}`;
      }
    });
  }
};

let proxies = await produceArtifact({
  type: context.productionType,
  name: context.productionTarget,
  platform: "json",
  produceType: "internal",
});

({ proxies, config } = await Promise.resolve({
  proxies,
  config: ProxyUtils.yaml.safeLoad($files[0]),
})
  .then(applySortAndCompability)
  .then(applyTransport)
  .then(applyGeoSiteGeoIP)
  .then(applyBoostrapDirect)
  .then(applyPushGroup));

$content = ProxyUtils.yaml.dump({
  ...config,
  proxies: [
    ...(config.proxies ?? []),
    ...produce(proxies).map((proxy) => {
      Object.keys(proxy).map((key) => {
        if (key.startsWith("_") || ["properties"].includes(key)) {
          delete proxy[key];
        }
      });
      return proxy;
    }),
  ],
});
