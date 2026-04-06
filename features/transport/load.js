const featureLocation = context.young.features.location;

const isTransport = ({ proxy }) => {
  return proxy?.properties?.transport || proxy?.properties?.transport?.is;
};

const isDestionation = ({ proxy }) => {
  return proxy?.properties?.destination || proxy?.properties?.destination?.is;
};

const completeTransport = ({ proxies, detourName, fallback }) => {
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

    if (transportGroups[transportLocation] === undefined) {
      transportGroups[transportLocation] = {
        use: false,
        name: detourName(transportLocation),
        proxies: [],
      };
    }
    transportGroups[transportLocation].proxies.push(tp.name);
  }

  for (const dp of destinationProxies) {
    const destinationRequiredLocation = [];
    if (
      typeof dp.properties.destination !== "boolean" &&
      dp.properties.destination.require !== undefined
    ) {
      if (typeof dp.properties.destination.require === "string")
        destinationRequiredLocation.push(dp.properties.destination.require);
      else if (Array.isArray(dp.properties.destination.require))
        destinationRequiredLocation.push(...dp.properties.destination.require);
    } else {
      const destinationLocation = featureLocation.func.getLocation({
        name: dp.name,
      });
      if (destinationLocation !== "")
        destinationRequiredLocation.push(destinationLocation);

      if (typeof dp.properties.destination.suits === "string")
        destinationRequiredLocation.push(dp.properties.destination.suits);
      else if (Array.isArray(dp.properties.destination.suits))
        destinationRequiredLocation.push(...dp.properties.destination.suits);
      if (Array.isArray(fallback))
        destinationRequiredLocation.push(...fallback);
    }

    for (const loc of destinationRequiredLocation) {
      if ([loc] in transportGroups) {
        const selected = transportGroups[loc];
        selected.use = true;
        dp["dialer-proxy"] =
          selected.proxies.length > 1 ? selected.name : selected.proxies[0];
        break;
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
