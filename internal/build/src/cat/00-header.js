const featureTransport = context.young.features.transport;
const featureLocation = context.young.features.location;

const directDetourOutbound = "DIRECT";
const productionPlatform = "mihomo";

const produce = (proxies = []) => {
  return ProxyUtils.yaml.safeLoad(
    ProxyUtils.produce([...proxies], productionPlatform),
  ).proxies;
};
