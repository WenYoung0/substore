const yaml = require("js-yaml");
const fs = require("node:fs");

const GEN_TYPE_DYNAMIC = "dynamic";
const GEN_TYPE_STATIC = "static";

const generateConfig = {
  dataSoucre: {
    useUpstream: (name) => !name.startsWith("@"),
    isGeoip: (name) =>
      name.startsWith("geoip") ||
      name.startsWith("@geoip") ||
      name.startsWith("_geoip"),
    box: {
      upstreamGeositeURL: (name) =>
        "https://raw.githubusercontent.com/SagerNet/sing-geosite/rule-set/" +
        name +
        ".srs",
      upstreamGeoipURL: (name) =>
        "https://raw.githubusercontent.com/duakc/geoip/refs/heads/release/srs/" +
        name.slice(name.indexOf("-") + 1, name.length) +
        ".srs",
      localGeoipURL: (name) =>
        "https://raw.githubusercontent.com/duakc/substore/refs/heads/rule/rule-set/ip/srs/" +
        name +
        ".srs",
      localGeositeURL: (name) =>
        "https://raw.githubusercontent.com/duakc/substore/refs/heads/rule/rule-set/domain/srs/" +
        name +
        ".srs",
      domain: "../../ruleset/domain/srs",
      ip: "../../ruleset/ip/srs",
    },
    cat: {
      upstreamGeositeURL: (name) =>
        "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/" +
        name.slice(name.indexOf("-") + 1, name.length) +
        ".mrs",
      upstreamGeoipURL: (name) =>
        "https://raw.githubusercontent.com/duakc/geoip/refs/heads/release/mrs/" +
        name.slice(name.indexOf("-") + 1, name.length) +
        ".mrs",
      localGeoipURL: (name) =>
        "https://raw.githubusercontent.com/duakc/substore/refs/heads/rule/rule-set/ip/mrs/" +
        name +
        ".mrs",
      localGeositeURL: (name) =>
        "https://raw.githubusercontent.com/duakc/substore/refs/heads/rule/rule-set/domain/mrs/" +
        name +
        ".classical", // use classical to get best compability
      domain: "../../ruleset/domain/mrs",
      ip: "../../ruleset/ip/mrs",
    },
  },
  box: [
    {
      type: GEN_TYPE_DYNAMIC,
      template: "../../internal/cores/box/template/box.json",
      path: "../../internal/cores/box/box.json",
      embed: true,
    },
    {
      type: GEN_TYPE_DYNAMIC,
      template: "../../internal/cores/box/template/enhanced.json",
      path: "../../internal/cores/box/enhanced.json",
      embed: true,
    },
    {
      type: GEN_TYPE_DYNAMIC,
      template: "../../internal/cores/box/template/minimal.json",
      path: "../../internal/cores/box/minimal.json",
      embed: true,
    },
  ],
  cat: [
    {
      type: GEN_TYPE_STATIC,
      template: "../../internal/cores/cat/template/cat.yaml",
      path: "../../internal/cores/cat/cat.yaml",
      staticFile: "../../internal/cores/cat/ruleset.list",
      embed: true,
    },
  ],
};

const main = () => {
  for (const boxItem of generateConfig.box ?? []) {
    applyBox(boxItem);
  }

  for (const catItem of generateConfig.cat ?? []) {
    applyCat(catItem);
  }
};

const applyBox = (item) => {
  const ruleset = [];
  const configData = fs.readFileSync(item.template, "utf-8");
  const config = JSON.parse(configData);
  if (!config) {
    console.log("empty template: ", item.template);
    return;
  }

  if (item.type === GEN_TYPE_DYNAMIC) {
    ruleset.push(...genRulesetFromConfig(config));
  } else if (item.type === GEN_TYPE_STATIC && item.staticFile) {
    const content = fs.readFileSync(item.staticFile, "utf8");
    ruleset.push(...content.split(/\r?\n/));
  } else {
    console.log("unknown type");
    return;
  }
  config.route = {
    ...(config.route ?? {}),
    rule_set: [
      ...(config.route?.rule_set ?? []),
      ...ruleset.map((name) => {
        let rulesetObject = {
          tag: name,
        };
        if (generateConfig.dataSoucre.useUpstream(name)) {
          rulesetObject = {
            ...rulesetObject,
            type: "remote",
            format: "binary",
            url: generateConfig.dataSoucre.isGeoip(name)
              ? generateConfig.dataSoucre.box.upstreamGeoipURL(name)
              : generateConfig.dataSoucre.box.upstreamGeositeURL(name),
          };
        } else if (item.embed) {
          const rulePath = generateConfig.dataSoucre.isGeoip(name)
            ? generateConfig.dataSoucre.box.ip + "/" + name + ".json"
            : generateConfig.dataSoucre.box.domain + "/" + name + ".json";
          const rule = JSON.parse(fs.readFileSync(rulePath));
          rulesetObject = {
            ...rulesetObject,
            type: "inline",
            rules: rule.rules,
          };
        } else {
          rulesetObject = {
            ...rulesetObject,
            type: "remote",
            format: "binary",
            url: generateConfig.dataSoucre.isGeoip(name)
              ? generateConfig.dataSoucre.box.localGeoipURL(name)
              : generateConfig.dataSoucre.box.localGeositeURL(name),
          };
          return rulesetObject;
        }
        return rulesetObject;
      }),
    ],
  };
  fs.writeFileSync(item.path, JSON.stringify(config, null, 2));
};

const applyCat = (item) => {
  const ruleset = [];
  const configData = fs.readFileSync(item.template, "utf-8");
  let config = yaml.load(configData);
  if (!config) {
    console.log("empty template: ", item.template);
    return;
  }
  if (item.type === GEN_TYPE_DYNAMIC) {
    console.log("cat doesn't support dynamic generation");
  } else if (item.type === GEN_TYPE_STATIC && item.staticFile) {
    const content = fs.readFileSync(item.staticFile, "utf8");
    ruleset.push(...content.split(/\r?\n/));
  } else {
    console.log("unknown type");
    return;
  }
  const ruleProviders = ruleset
    .filter((n) => !!n)
    .map((name) => {
      let rulesetObject = {};
      if (generateConfig.dataSoucre.useUpstream(name)) {
        rulesetObject = {
          type: "http",
          format: "mrs",
          interval: 86400,
          behavior: generateConfig.dataSoucre.isGeoip(name)
            ? "ipcidr"
            : "domain",
          url: generateConfig.dataSoucre.isGeoip(name)
            ? generateConfig.dataSoucre.cat.upstreamGeoipURL(name)
            : generateConfig.dataSoucre.cat.upstreamGeositeURL(name),
        };
      } else if (item.embed) {
        const rulePath = generateConfig.dataSoucre.isGeoip(name)
          ? generateConfig.dataSoucre.cat.ip + "/" + name + ".list"
          : generateConfig.dataSoucre.cat.domain + "/" + name + ".classical";
        const rule = fs.readFileSync(rulePath, "utf-8");
        const payload = rule.split(/\r?\n/).filter((n) => !!n);
        rulesetObject = {
          type: "inline",
          behavior: generateConfig.dataSoucre.isGeoip(name)
            ? "ipcidr"
            : "classical",
          payload: payload,
        };
      } else {
        rulesetObject = {
          type: "http",
          format: generateConfig.dataSoucre.isGeoip(name) ? "mrs" : "text",
          interval: 86400,
          behavior: generateConfig.dataSoucre.isGeoip(name)
            ? "ipcidr"
            : "classical",
          url: generateConfig.dataSoucre.isGeoip(name)
            ? generateConfig.dataSoucre.cat.localGeoipURL(name)
            : generateConfig.dataSoucre.cat.localGeositeURL(name),
        };
      }
      if (name.startsWith("@")) {
        name = "_" + name.substring(1, name.length);
      }

      return { [name]: rulesetObject };
    });

  config["rule-providers"] = {
    ...(config["rule-providers"] ?? {}),
    ...Object.assign(config["rule-providers"] ?? {}, ...ruleProviders),
  };

  fs.writeFileSync(item.path, yaml.dump(config));
};

const genRulesetFromConfig = (config) => {
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

  return [...rulesetSet]
    .filter((name) => !["@geosite-direct", "@geoip-direct"].includes(name))
    .sort();
};

main();
