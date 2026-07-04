// @call = applySortAndCompability
// @import = location
const applySortAndCompability = ({ proxies = [], ...rest }) => {
  const sortedProxies = context.features.location.sortProxies({ proxies });

  // Notice heer , different platform has different name selector (tag or name)
  const names = produce(proxies).map((pp) => pp.tag);
  return {
    proxies: sortedProxies.filter((sp) => names.includes(sp.name)),
    ...rest,
  };
};
