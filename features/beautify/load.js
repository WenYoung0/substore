const featureLocation = context.young.features.location;

const sortProxies = ({ proxies }) => {
  const emptyProviderKey = "_empty";
  const providerList = {};
  const finalProxies = [];
  for (const proxy of proxies) {
    let providerName = emptyProviderKey;
    if (
      proxy.properties !== undefined &&
      proxy.properties.provider !== undefined
    ) {
      providerName = proxy.properties.provider;
      proxy.name = [providerName, proxy.name].join("/");
    }
    if (!Array.isArray(providerList[providerName]))
      providerList[providerName] = [];
    providerList[providerName].push(proxy);
    proxy.name = proxy.name.trim();
  }
  Object.keys(providerList)
    .sort((a, b) => {
      return a.localeCompare(b);
    })
    .map((providerName) => {
      const providerSet = providerList[providerName];
      providerSet.sort((a, b) => {
        const locationDiff =
          featureLocation.func.getOrder({ name: a.name }) -
          featureLocation.func.getOrder({ name: b.name });
        if (locationDiff !== 0) return locationDiff;

        return a.name.localeCompare(b.name);
      });
      return providerSet;
    })
    .map((providerSet) => {
      finalProxies.push(...providerSet);
    });

  return finalProxies;
};

const completeRemoteRuleSetBox = ({
  config,
  downloadDetour,
  geositeURL,
  geoipURL,
}) => {
  const lookupRuleset = ({ ruleItem }) => {
    const res = [];
    if (ruleItem === undefined || ruleItem === null) {
    } else if (Array.isArray(ruleItem.rules)) {
      for (const logicalRuleItem of ruleItem.rules) {
        res.push(...lookupRuleset({ ruleItem: logicalRuleItem }));
      }
    } else if (typeof ruleItem.rule_set === "string") {
      res.push(ruleItem.rule_set);
    } else if (Array.isArray(ruleItem.rule_set)) {
      res.push(...ruleItem.rule_set);
    }
    return res;
  };

  if (!geositeURL) {
    geositeURL = (ruleSetName) =>
      "https://raw.githubusercontent.com/SagerNet/sing-geosite/rule-set/" +
      ruleSetName +
      ".srs";
  }
  if (!geoipURL) {
    geoipURL = (ruleSetName) =>
      "https://raw.githubusercontent.com/SagerNet/sing-geoip/rule-set/" +
      ruleSetName +
      ".srs";
  }

  const rulesetSet = new Set();

  for (const rs of [
    ...lookupRuleset({ ruleItem: config.route }),
    ...lookupRuleset({ ruleItem: config.dns }),
  ]) {
    rulesetSet.add(rs);
  }
  for (const rs of config.route?.rule_set ?? []) {
    if (rs.tag) rulesetSet.delete(rs.tag);
  }
  if (!config.route) config.route = {};
  config.route.rule_set = [
    ...(config.route.rule_set ?? []),
    ...[...rulesetSet].map((rs) => {
      return {
        tag: rs,
        type: "remote",
        format: "binary",
        url: rs.startsWith("geosite") ? geositeURL(rs) : geoipURL(rs),
        download_detour: downloadDetour,
      };
    }),
  ];

  return [...rulesetSet];
};

const beautifyObj = { load: true, func: {} };

beautifyObj.func.sortProxies = sortProxies;
beautifyObj.func.completeRemoteRuleSetBox = completeRemoteRuleSetBox;

context.young = {
  ...(context.young || {}),
  features: {
    ...(context.young?.features || {}),
    beautify: beautifyObj,
  },
};
