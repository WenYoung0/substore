// @call = assembleConfig
const assembleConfig = ({ config = {}, proxies = [], ...rest }) => {
  return {
    ...rest,
    config: {
      ...config,
      proxies: [
        ...(config.proxies ?? []),
        ...produce(proxies).map((proxy) => {
          Object.keys(proxy).map((key) => {
            if (key.startsWith("_") || ["properties"].includes(key)) {
              delete proxy[key];
            }
          });
          return proxy;
        }),
      ],
    },
  };
};
