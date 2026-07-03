// @call = assembleConfig
const assembleConfig = ({
  config = {},
  proxies = [],
  endpoints = [],
  ...rest
}) => {
  return {
    ...rest,
    config: {
      ...config,
      outbounds: [...(config.outbounds ?? []), ...produce(proxies)],
      endpoints: [...(config.endpoints ?? []), ...produceEndpoint(endpoints)],
    },
  };
};
