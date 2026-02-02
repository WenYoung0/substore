const featureLocation = context.young.features.location;

const completeTransport = ({ proxies, detourName }) => {
  const transportProxies = proxies.filter(
    (p) =>
      p.properties !== undefined &&
      p.properties.transport !== undefined &&
      ((typeof p.properties.transport === "boolean" &&
        p.properties.transport) ||
        p.properties.transport.is),
  );
  const destinationProxies = proxies.filter(
    (p) =>
      p.properties !== undefined &&
      p.properties.destination !== undefined &&
      ((typeof p.properties.destination === "boolean" &&
        p.properties.destination) ||
        p.properties.destination.is),
  );
  if (destinationProxies.length === 0) {
    return {};
  }

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

  if (transportProxies.length === 1) {
    destinationProxies.map(
      (p) => (p["dialer-proxy"] = transportProxies[0].name),
    );
    return {};
  } else if (transportProxies.length === 0) {
    return {};
  }

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
      if (drtName in transportGroups) {
        const selectedGroup = transportGroups[drtName];
        dp["dialer-proxy"] = drtName;
        if (selectedGroup.length === 1) {
          dp["dialer-proxy"] = selectedGroup[0].name;
        }
        break;
      }
    }

    // Fallback
    if (
      (!"dialer-proxy") in dp &&
      typeof dp.properties.destination != "boolean" &&
      dp.properties.destination.require === undefined
    ) {
      for (const loc of ["HK", "JP", "SG", "US"]) {
        const dname = detourName("HK");
        if (dname in transportGroups) {
          dp["dialer-proxy"] = dname;
          if (transportGroups[dname].length === 1) {
            dp["dialer-proxy"] = transportGroups[dname][0].name;
          }
          break;
        }
      }
    }
  }

  return transportGroups;
};

const transportObj = { load: true, func: {}, const: {} };

transportObj.func.completeTransport = completeTransport;

context.young = {
  ...(context.young || {}),
  features: {
    ...(context.young?.features || {}),
    transport: transportObj,
  },
};
