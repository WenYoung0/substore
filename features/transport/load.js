const featureLocation = context.young.features.location;

const isTransport = ({ proxy }) => {
  return (
    proxy !== undefined &&
    proxy.properties !== undefined &&
    proxy.properties.transport !== undefined &&
    ((typeof proxy.properties.transport === "boolean" &&
      proxy.properties.transport) ||
      proxy.properties.transport.is)
  );
};

const isDestionation = ({ proxy }) => {
  return (
    proxy !== undefined &&
    proxy.properties !== undefined &&
    proxy.properties.destination !== undefined &&
    ((typeof proxy.properties.destination === "boolean" &&
      proxy.properties.destination) ||
      proxy.properties.destination.is)
  );
};

const completeTransport = ({ proxies, detourName }) => {
  if (detourName === undefined) {
    detourName = (cca2) => {
      if (cca2 === "") {
        return "🚀 Transport";
      }
      return "🚀 Transport (" + cca2 + ")";
    };
  } else if (typeof detourName === "string") {
    destinationProxies.map((p) => (p["dialer-proxy"] = detourName));
    return { [detourName]: transportProxies };
  } else if (typeof detourName != "function") {
    throw new Error(
      "wrong detoruName type, excepted: function,string. got: " +
        typeof detourName,
    );
  }

  const transportProxies = proxies.filter((proxy) => isTransport({ proxy }));
  const destinationProxies = proxies.filter((proxy) =>
    isDestionation({ proxy }),
  );

  const transportGroups = {};
  for (const tp of transportProxies) {
    const transportLocation = featureLocation.func.getLocation({
      name: tp.name,
    });
    const generatedDetourName = detourName(transportLocation);
    if (!Array.isArray(transportGroups[generatedDetourName])) {
      transportGroups[generatedDetourName] = [];
    }
    transportGroups[generatedDetourName].push(tp.name);
  }

  for (const dp of destinationProxies) {
    const destinationRequiredTransport = [];
    if (typeof dp.properties.destination !== "boolean") {
      if (typeof dp.properties.destination.require === "string")
        destinationRequiredTransport.push(dp.properties.destination.require);
      else if (Array.isArray(dp.properties.destination.require))
        destinationRequiredTransport.push(...dp.properties.destination.require);

      if (dp.properties.destination.require === undefined) {
        const destinationLocation = featureLocation.func.getLocation({
          name: dp.name,
        });
        if (destinationLocation !== "")
          destinationRequiredTransport.push(destinationLocation);
        if (typeof dp.properties.destination.suits === "string")
          destinationRequiredTransport.push(dp.properties.destination.suits);
        else if (Array.isArray(dp.properties.destination.suits))
          destinationRequiredTransport.push(...dp.properties.destination.suits);
      }
    } else {
      const destinationLocation = featureLocation.func.getLocation({
        name: dp.name,
      });
      if (destinationLocation !== "")
        destinationRequiredTransport.push(destinationLocation);
    }

    for (const drt of destinationRequiredTransport) {
      const drtName = detourName(drt);
      if ([drtName] in transportGroups) {
        dp["dialer-proxy"] = drtName;
        break;
      }
    }

    // Fallback
    if (
      !("dialer-proxy" in dp) &&
      typeof dp.properties.destination != "boolean" &&
      dp.properties.destination.require === undefined
    ) {
      for (const loc of ["HK", "JP", "SG", "US"]) {
        const dname = detourName("HK");
        if ([dname] in transportGroups) {
          dp["dialer-proxy"] = dname;
          break;
        }
      }
    }
  }

  return transportGroups;
};

const transportObj = { load: true, func: {}, const: {} };

transportObj.func.completeTransport = completeTransport;
transportObj.func.isTransport = isTransport;
transportObj.func.isDestionation = isDestionation;

context.young = {
  ...(context.young || {}),
  features: {
    ...(context.young?.features || {}),
    transport: transportObj,
  },
};
