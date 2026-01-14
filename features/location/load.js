const locations = {
  CN: /CN|中国|🇨🇳/gi,
  HK: /HK|香港|🇭🇰/gi,
  VN: /VN|越南|🇻🇳/gi,
  TH: /TH|泰国|🇹🇭/gi,
  IN: /IN|印度|🇮🇳/gi,
  TW: /TW|台湾|🇹🇼/gi,
  JP: /JP|日本|🇯🇵/gi,
  SG: /SG|新加坡|🇸🇬/gi,
  MY: /MY|马来西亚|🇲🇾/gi,
  KR: /KR|韩国|🇰🇷/gi,
  RU: /RU|俄罗斯|🇷🇺/gi,
  AU: /AU|澳大利亚|🇦🇺/gi,
  // 🇺🇸 \ud83c\uddfa\ud83c\uddf8
  // 🇺🇲 \ud83c\uddfa\ud83c\uddf2 // https://en.wikipedia.org/wiki/United_States_Minor_Outlying_Islands
  US: /US|美国|🇺🇸|🇺🇲/gi,
  CA: /CA|加拿大|🇨🇦/gi,
  DE: /DE|德国|🇩🇪/gi,
  UA: /UA|乌克兰|🇺🇦/gi,
  FR: /FR|法国|🇫🇷/gi,
  NL: /NL|荷兰|🇳🇱/gi,
  GB: /GB|英国|🇬🇧/gi,
  TR: /TR|土耳其|🇹🇷/gi,
  BR: /BR|巴西|🇧🇷/gi,
  AR: /AR|阿根廷|🇦🇷/gi,
  NG: /NG|尼日利亚|🇳🇬/gi,
};

const getLocation = ({ name }) => {
  if (!name) {
    return "";
  }
  for (const key in locations) {
    const regex = locations[key];
    if (regex.test(name)) {
      return key;
    }
  }
  return "";
};

const getOrder = ({ name }) => {
  if (!name) {
    return 0;
  }
  let priority = 1;
  for (const key in locations) {
    const regex = locations[key];
    if (regex.test(name)) {
      return priority;
    }
    priority++;
  }
  return priority;
};

const areas = {
  CN: "ASIA",
  HK: "ASIA",
  VN: "ASIA",
  TH: "ASIA",
  IN: "ASIA",
  TW: "ASIA",
  JP: "ASIA",
  SG: "ASIA",
  MY: "ASIA",
  KR: "ASIA",
  RU: "EU",
  AU: "OCEANIA",
  US: "NA",
  CA: "NA",
  DE: "EU",
  UA: "EU",
  FR: "EU",
  NL: "EU",
  GB: "EU",
  TR: "EU",
  BR: "SA",
  AR: "SA",
  NG: "AFRICA",
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

locationObj.const.locations = locations;

context.young = {
  ...(context.young || {}),
  features: {
    ...(context.young?.features || {}),
    location: locationObj,
  },
};
