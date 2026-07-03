// @call = applyBoostrapDirect
const applyBoostrapDirect = ({ config = {}, ...rest }) => {
  const ghproxy = context.secret?.metadata?.ghproxy ?? "hk.gh-proxy.org";
  const githubDomains = [
    "raw.githubusercontent.com",
    "github.com",
    "gist.githubusercontent.com",
  ];

  if (Array.isArray(config.route?.rule_set)) {
    config.route.rule_set.map((ruleset) => {
      if (
        ruleset.type === "remote" &&
        githubDomains.some((domain) =>
          ruleset.url.startsWith("https://" + domain),
        )
      ) {
        ruleset.url = `https://${ghproxy}/${ruleset.url}`;
        ruleset.http_client = directHTTPClient;
      }
    });
  }
  if (
    config.experimental?.clash_api?.external_ui_download_url &&
    githubDomains.some((domain) =>
      config.experimental.clash_api.external_ui_download_url.startsWith(
        "https://" + domain,
      ),
    )
  ) {
    config.experimental.clash_api.external_ui_download_url = `https://${ghproxy}/${config.experimental.clash_api.external_ui_download_url}`;
    config.experimental.clash_api.external_ui_download_detour =
      directBootstrapOutbound;
  }

  return { config, ...rest };
};
