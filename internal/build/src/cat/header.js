context.const = {
  ...(context.const ?? {}),
  platform: "mihomo",
  outbound: { directDetour: "DIRECT" },
};

const produce = (proxies = []) => {
  return ProxyUtils.yaml.safeLoad(
    ProxyUtils.produce([...proxies], context.const.platform),
  ).proxies;
};
