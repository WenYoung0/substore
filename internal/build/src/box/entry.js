// @call = generateContext()
const generateContext = async () => {
  const lookupQuery = (name) => {
    return $options?._req?.query?.[name];
  };

  const generated = {
    config: JSON.parse($files[0]),
    experimental: {},
    ua: uaLookup(
      $options?._req?.headers?.["user-agent"] ||
        $options?._req?.headers?.["User-Agent"] ||
        context.test?.ua,
    ),
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
        "snell",
      ].includes(proxy.type),
    );
    generated.endpoints = produced.filter((proxy) =>
      ["wireguard", "tailscale"].includes(proxy.type),
    );
  } else {
    generated.proxies = [];
  }

  (lookupQuery("experimental") || context.test?.experimental || "")
    .split(",")
    .map((fe) => {
      generated.experimental[fe] = true;
    });

  return generated;
};
