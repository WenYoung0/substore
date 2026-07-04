// @call = applyPlatformSettings
const applyPlatformSettings = ({ config = {}, ua = undefined, ...rest }) => {
  const ret = { config, ua, ...rest };
  if (ua === undefined) {
    return ret;
  }
  config?.inbounds
    ?.filter((inb) => inb.type === "tun")
    .map((tunInbound) => {
      if (ua.SFM) {
        // on macos , only set ipv6 dns address to fix the program
        // which read the /etc/resolv.conf as major dns resolver config.
        if (tunInbound.dns_address)
          tunInbound.dns_address = tunInbound.dns_address.filter((addr) =>
            addr.includes(":"),
          );
        // on macos , gvisor has better performance.
        tunInbound.stack = "gvisor";
      }
    });

  return ret;
};
