const locationEntries = [
  { key: "CN", regex: /CN|中国|🇨🇳/i },
  { key: "HK", regex: /HK|香港|🇭🇰/i },
  { key: "VN", regex: /VN|越南|🇻🇳/i },
  { key: "TH", regex: /TH|泰国|🇹🇭/i },
  { key: "IN", regex: /IN|印度|🇮🇳/i },
  { key: "TW", regex: /TW|台湾|🇹🇼/i },
  { key: "JP", regex: /JP|日本|🇯🇵/i },
  { key: "SG", regex: /SG|新加坡|🇸🇬/i },
  { key: "MY", regex: /MY|马来西亚|🇲🇾/i },
  { key: "KR", regex: /KR|韩国|🇰🇷/i },
  { key: "RU", regex: /RU|俄罗斯|🇷🇺/i },
  { key: "AU", regex: /AU|澳大利亚|🇦🇺/i },
  // 🇺🇸 \ud83c\uddfa\ud83c\uddf8
  // 🇺🇲 \ud83c\uddfa\ud83c\uddf2 // https://en.wikipedia.org/wiki/United_States_Minor_Outlying_Islands
  { key: "US", regex: /US|美国|🇺🇸|🇺🇲/i },
  { key: "CA", regex: /CA|加拿大|🇨🇦/i },
  { key: "DE", regex: /DE|德国|🇩🇪/i },
  { key: "UA", regex: /UA|乌克兰|🇺🇦/i },
  { key: "FR", regex: /FR|法国|🇫🇷/i },
  { key: "NL", regex: /NL|荷兰|🇳🇱/i },
  { key: "GB", regex: /GB|英国|🇬🇧/i },
  { key: "TR", regex: /TR|土耳其|🇹🇷/i },
  { key: "BR", regex: /BR|巴西|🇧🇷/i },
  { key: "AR", regex: /AR|阿根廷|🇦🇷/i },
  { key: "NG", regex: /NG|尼日利亚|🇳🇬/i },
];

const getLocation = ({ name }) => {
  if (!name) {
    return "";
  }
  for (const entry of locationEntries) {
    if (entry.regex.test(name)) {
      return entry.key;
    }
  }
  return "";
};

const getOrder = ({ name }) => {
  if (!name) {
    return 0;
  }
  for (let i = 0; i < locationEntries.length; i++) {
    const entry = locationEntries[i];
    if (entry.regex.test(name)) {
      const priority = i + 1;
      return priority;
    }
  }
  return -1;
};

const areas = {
  CN: "AREA_ASIA",
  HK: "AREA_ASIA",
  VN: "AREA_ASIA",
  TH: "AREA_ASIA",
  IN: "AREA_ASIA",
  TW: "AREA_ASIA",
  JP: "AREA_ASIA",
  SG: "AREA_ASIA",
  MY: "AREA_ASIA",
  KR: "AREA_ASIA",
  RU: "AREA_EU",
  AU: "AREA_OCEANIA",
  US: "AREA_NA",
  CA: "AREA_NA",
  DE: "AREA_EU",
  UA: "AREA_EU",
  FR: "AREA_EU",
  NL: "AREA_EU",
  GB: "AREA_EU",
  TR: "AREA_EU",
  BR: "AREA_SA",
  AR: "AREA_SA",
  NG: "AREA_AFRICA",
};

const getArea = ({ name }) => {
  if (!name) {
    return "";
  }
  const location = getLocation({ name });
  return areas[location] || "";
};

const locationObj = { load: true, func: {}, const: {} };
locationObj.func.getLocation = getLocation;
locationObj.func.getOrder = getOrder;
locationObj.func.getArea = getArea;

locationObj.const.locationEntries = locationEntries;

context.young = {
  ...(context.young || {}),
  features: {
    ...(context.young?.features || {}),
    location: locationObj,
  },
};
