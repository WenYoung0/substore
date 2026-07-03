// @call = generateContext()
const generateContext = async () => {
  const lookupQuery = (name) => {
    return $options?._req?.query?.[name];
  };

  const generated = {
    config: ProxyUtils.yaml.safeLoad($files[0]),
    experimental: {},
  };

  if (lookupQuery("user") || context.test?.user) {
    const userID = lookupQuery("user") || context.test?.user || "";
    const produced = await produceArtifact({
      type: lookupQuery("prod_type") || "collection",
      name: userID,
      platform: "json",
      produceType: "internal",
    });
    generated.proxies = produced.filter((proxy) =>
      [
        "socks",
        "http",
        "ss",
        "vmess",
        "trojan",
        "naive",
        "hysteria",
        "hysteria2",
        "vless",
        "tuic",
        "anytls",
        "tor",
        "ssh",
        "mieru",
        "sudoku",
        "masque",
        "trusttunnel",
      ].includes(proxy.type),
    );
  }

  (lookupQuery("experimental") || context.test?.experimental || "")
    .split(",")
    .map((fe) => {
      generated.experimental[fe] = true;
    });

  return generated;
};
