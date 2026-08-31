context.const = {
  ...(context.const ?? {}),
  platform: "sing-box",
  outbound: {
    direct: "🌐 Direct",
    directBootstrap: "direct-bootstrap",
  },
  ruleset: { bootstrapHTTPClient: "http-bootstrap" },
  dns: { bootstrapDNSTag: "dns-bootstrap" },
};

const produce = (proxies = []) => {
  return JSON.parse(ProxyUtils.produce([...proxies], context.const.platform))
    .outbounds;
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

const createSemverInfo = () => ({
  full: "",
  major: 0,
  minor: 0,
  patch: 0,
  prerelease: "",
  build: "",
  // sing-box
  alphaVersion: 0,
});

const parseSemver = (version) => {
  const defaultSemverInfo = createSemverInfo();

  if (typeof version !== "string" || version.trim() === "") {
    return defaultSemverInfo;
  }

  const semverRegex =
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

  const match = version.trim().match(semverRegex);
  if (!match) {
    return defaultSemverInfo;
  }

  const [full, major, minor, patch, prerelease = "", build = ""] = match;
  const alphaMatch = prerelease.match(/(?:^|\.)alpha\.(\d+)(?:\.|$)/);

  defaultSemverInfo.full = full;
  defaultSemverInfo.major = Number(major);
  defaultSemverInfo.minor = Number(minor);
  defaultSemverInfo.patch = Number(patch);
  defaultSemverInfo.prerelease = prerelease;
  defaultSemverInfo.build = build;
  defaultSemverInfo.alphaVersion = alphaMatch ? Number(alphaMatch[1]) : 0;
  return defaultSemverInfo;
};

const createUaInfo = () => ({
  SFM: false,
  SFI: false,
  SFT: false,
  SFA: false,
  SFD: false,
  SFW: false,
  SFL: false,
  isZhCN: false,
  isZhTW: false,
  isEnUS: false,
  isFa: false,
  isRu: false,
  version: parseSemver(),
});

const applyUaLanguage = (uaInfo, language) => {
  const normalized = language.trim().replaceAll("-", "_").toLowerCase();
  if (!normalized) return;

  if (/^zh(?:_|$)/.test(normalized)) {
    if (/(?:^|_)(?:hant|tw|hk|mo)(?:_|$)/.test(normalized)) {
      uaInfo.isZhTW = true;
    } else {
      uaInfo.isZhCN = true;
    }
  } else if (/^en(?:_|$)/.test(normalized)) {
    uaInfo.isEnUS = true;
  } else if (/^fa(?:_|$)/.test(normalized)) {
    uaInfo.isFa = true;
  } else if (/^ru(?:_|$)/.test(normalized)) {
    uaInfo.isRu = true;
  }
};

const uaLookup = (ua = "") => {
  if (typeof ua !== "string" || ua.trim() === "") {
    return undefined;
  }

  const defaultUaInfo = createUaInfo();
  const uaMatched = ua
    .trim()
    .match(/^([A-Z]{3})\s+\(sing-box\s+([^;()\s]+);\s*language\s+([^)]+)\)$/);

  if (
    !uaMatched ||
    !["SFM", "SFI", "SFT", "SFA", "SFD", "SFW", "SFL"].includes(
      uaMatched[1],
    )
  ) {
    return defaultUaInfo;
  }

  const client = uaMatched[1];
  const version = parseSemver(uaMatched[2]);
  if (!version.full) {
    return defaultUaInfo;
  }

  defaultUaInfo[client] = true;
  defaultUaInfo.version = version;
  applyUaLanguage(defaultUaInfo, uaMatched[3]);

  return defaultUaInfo;
};

const findTun = (config = {}) => {
  const found = (config?.inbounds ?? []).filter((inb) => inb.type === "tun");
  return found.length > 0 ? found[0] : undefined;
};
