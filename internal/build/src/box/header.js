context.const = {
  ...(context.const ?? {}),
  platform: "sing-box",
  outbound: {
    direct: "🌐 Direct",
    directBootstrap: "direct-bootstrap",
  },
  ruleset: { bootstrapHTTPClient: "http-bootstrap" },
  dns: { bootstrapDNSTag: "dns-cn" },
};

const produce = (proxies = []) => {
  return JSON.parse(
    ProxyUtils.produce([...proxies], context.const.platform),
  ).outbounds;
};

const produceEndpoint = (endpoints = []) => {
  return JSON.parse(
    ProxyUtils.produce(
      [
        ...endpoints.filter(
          (e) => e.type === "tailscale" || e.type === "wireguard",
        ),
      ],
      context.const.platform,
    ),
  ).endpoints;
};

const parseSemver = (version) => {
  const defaultSemverInfo = {
    full: "",
    major: 0,
    minor: 0,
    patch: 0,
    prerelease: "",
    build: "",
    // sing-box
    alphaVersion: 0,
  };
  if (!version) return defaultSemverInfo;

  const semverRegex =
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

  const match = version.match(semverRegex);

  if (match) {
    const [full, major, minor, patch, prerelease, build] = match;
    if (prerelease) {
      defaultSemverInfo.alphaVersion = Number(prerelease.split(".")[1]);
    }
    defaultSemverInfo.full = full;
    defaultSemverInfo.major = Number(major);
    defaultSemverInfo.minor = Number(minor);
    defaultSemverInfo.patch = Number(patch);
    defaultSemverInfo.prerelease = prerelease;
    defaultSemverInfo.build = build;
    return defaultSemverInfo;
  } else {
    throw new Error("Parse Semver failed");
  }
};

const uaLookup = (ua = "") => {
  if (ua === "") {
    return undefined;
  }

  const defaultUaInfo = {
    SFM: false,
    SFI: false,
    SFT: false,
    SFA: false,
    version: parseSemver(undefined),
    language: "",
  };

  const regex =
    /^([^/]+)\/(\S+) \((?:Build )?([^;]+); sing-box ([^;]+); language ([^)]+)\)$/;

  const uaMatched = ua.match(regex);
  if (!uaMatched || uaMatched.length < 6) {
    return defaultUaInfo;
  }

  defaultUaInfo.SFM = uaMatched[1] === "SFM";
  defaultUaInfo.SFI = uaMatched[1] === "SFI";
  defaultUaInfo.SFT = uaMatched[1] === "SFT";
  defaultUaInfo.SFA = uaMatched[1] === "SFA";

  defaultUaInfo.version = parseSemver(uaMatched[2]);

  // 语言处理
  if (defaultUaInfo.SFM || defaultUaInfo.SFI || defaultUaInfo.SFT) {
    defaultUaInfo.language = uaMatched[5].startsWith("zh-Hans")
      ? "zh_CN"
      : "en_US";
  } else if (defaultUaInfo.SFA) {
    defaultUaInfo.language = uaMatched[5];
  }

  return defaultUaInfo;
};
