// @call = applyBoostrapDirect
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
  return { config, ...rest };
};
