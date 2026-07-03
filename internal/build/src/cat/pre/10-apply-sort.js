// @call = applySortAndCompability
const applySortAndCompability = ({ proxies = [], ...rest }) => {
  const sortedProxies = featureLocation.func.sortProxies({ proxies });

  // Notice heer , different platform has different name selector (tag or name)
  const names = produce(proxies).map((pp) => pp.name);
  return {
    proxies: sortedProxies.filter((sp) => names.includes(sp.name)),
    ...rest,
  };
};
