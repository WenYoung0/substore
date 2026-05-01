const locationEntries = [
  {
    cca2: "CN",
    flag: "🇨🇳",
    keywords: [
      "CN",
      "CHN",
      "BACK",
      "China",
      "中国",
      "中國",
      "回国",
      "回國",
      "国内",
      "國內",
      "华东",
      "华西",
      "华南",
      "华北",
      "华中",
      "江苏",
      "北京",
      "上海",
      "广州",
      "深圳",
      "杭州",
      "徐州",
      "青岛",
      "宁波",
      "镇江",
    ],
    area: "AREA_ASIA",
  },
  {
    cca2: "HK",
    flag: "🇭🇰",
    keywords: [
      "HK",
      "HKG",
      "HKT",
      "HKBN",
      "CMHK",
      "Smartone",
      "HKBNES",
      "HGC",
      "WTT",
      "CMI",
      "Hongkong",
      "香港",
      "Hong Kong",
      "HongKong",
      "HONG KONG",
      "深港",
      "沪港",
      "呼港",
      "穗港",
      "京港",
      "港",
    ],
    area: "AREA_ASIA",
  },
  {
    cca2: "MO",
    flag: "🇲🇴",
    keywords: ["MO", "MAC", "CTM", "Macao", "澳门", "澳門", "CTM"],
    area: "AREA_ASIA",
  },
  {
    cca2: "TW",
    flag: "🇹🇼",
    keywords: [
      "TW",
      "TWN",
      "CHT",
      "HINET",
      "ROC",
      "Taiwan",
      "台湾",
      "臺灣",
      "台灣",
      "中華民國",
      "中华民国",
      "台北",
      "台中",
      "新北",
      "彰化",
      "台",
      "臺",
      "Taipei",
      "Tai Wan",
    ],
    area: "AREA_ASIA",
  },
  {
    cca2: "JP",
    flag: "🇯🇵",
    keywords: [
      "JP",
      "JPN",
      "TYO",
      "NRT",
      "Japan",
      "日本",
      "东京",
      "大阪",
      "埼玉",
      "沪日",
      "穗日",
      "川日",
      "中日",
      "泉日",
      "杭日",
      "深日",
      "辽日",
      "广日",
      "大坂",
      "Osaka",
      "Tokyo",
    ],
    area: "AREA_ASIA",
  },
  {
    cca2: "KR",
    flag: "🇰🇷",
    keywords: [
      "KR",
      "KOR",
      "SEL",
      "Korea",
      "韩国",
      "韓國",
      "韩",
      "韓",
      "首尔",
      "春川",
      "Chuncheon",
      "Seoul",
    ],
    area: "AREA_ASIA",
  },
  {
    cca2: "VN",
    flag: "🇻🇳",
    keywords: ["VN", "VNM", "Vietnam", "越南", "胡志明"],
    area: "AREA_ASIA",
  },
  {
    cca2: "KH",
    flag: "🇰🇭",
    keywords: ["KH", "KGZ", "Cambodia", "柬埔寨"],
    area: "AREA_ASIA",
  },
  {
    cca2: "LA",
    flag: "🇱🇦",
    keywords: ["LA", "LAO", "Laos", "老挝", "老撾"],
    area: "AREA_ASIA",
  },
  {
    cca2: "TH",
    flag: "🇹🇭",
    keywords: ["TH", "THA", "Thailand", "泰国", "泰國", "曼谷", "🇹🇭"],
    area: "AREA_ASIA",
  },
  {
    cca2: "MM",
    flag: "🇲🇲",
    keywords: ["MM", "MMR", "Myanmar", "缅甸", "緬甸"],
    area: "AREA_ASIA",
  },
  {
    cca2: "MY",
    flag: "🇲🇾",
    keywords: ["MY", "MYS", "Malaysia", "马来", "馬來", "吉隆坡", "大馬"],
    area: "AREA_ASIA",
  },
  {
    cca2: "ID",
    flag: "🇮🇩",
    keywords: ["ID", "IDN", "Indonesia", "印尼", "印度尼西亚", "雅加达"],
    area: "AREA_ASIA",
  },
  {
    cca2: "SG",
    flag: "🇸🇬",
    keywords: [
      "SG",
      "SGP",
      "Singapore",
      "新加坡",
      "狮城",
      "沪新",
      "京新",
      "中新",
      "泉新",
      "穗新",
      "深新",
      "杭新",
      "广新",
      "廣新",
      "滬新",
    ],
    area: "AREA_ASIA",
  },
  {
    cca2: "PH",
    flag: "🇵🇭",
    keywords: ["PH", "PHL", "Philippines", "菲律宾", "菲律賓"],
    area: "AREA_ASIA",
  },
  {
    cca2: "BN",
    flag: "🇧🇳",
    keywords: ["BN", "BRN", "Brunei", "文莱", "汶萊"],
    area: "AREA_ASIA",
  },
  {
    cca2: "IN",
    flag: "🇮🇳",
    keywords: ["IN", "IND", "India", "印度", "孟买", "MFumbai", "Mumbai", "🇮🇳"],
    area: "AREA_ASIA",
  },
  {
    cca2: "NP",
    flag: "🇳🇵",
    keywords: ["NP", "NPL", "Nepal", "尼泊尔"],
    area: "AREA_ASIA",
  },
  {
    cca2: "BT",
    flag: "🇧🇹",
    keywords: ["BT", "BTN", "Bhutan", "不丹", "不丹王国"],
    area: "AREA_ASIA",
  },
  {
    cca2: "BD",
    flag: "🇧🇩",
    keywords: ["BD", "BGD", "Bangladesh", "孟加拉国", "孟加拉"],
    area: "AREA_ASIA",
  },
  {
    cca2: "LK",
    flag: "🇱🇰",
    keywords: ["LK", "LKA", "Sri Lanka", "斯里兰卡", "斯里蘭卡"],
    area: "AREA_ASIA",
  },
  {
    cca2: "PK",
    flag: "🇵🇰",
    keywords: ["PK", "PAK", "Pakistan", "巴基斯坦"],
    area: "AREA_ASIA",
  },
  {
    cca2: "AF",
    flag: "🇦🇫",
    keywords: ["AF", "AFG", "Afghanistan", "阿富汗"],
    area: "AREA_ASIA",
  },
  {
    cca2: "KG",
    flag: "🇰🇬",
    keywords: ["KG", "KGZ", "Kyrgyzstan", "吉尔吉斯斯坦"],
    area: "AREA_ASIA",
  },
  {
    cca2: "KZ",
    flag: "🇰🇿",
    keywords: ["KZ", "KAZ", "Kazakhstan", "哈萨克斯坦", "哈萨克"],
    area: "AREA_ASIA",
  },
  {
    cca2: "MN",
    flag: "🇲🇳",
    keywords: ["MN", "MNG", "Mongolia", "蒙古"],
    area: "AREA_ASIA",
  },
  {
    cca2: "KP",
    flag: "🇰🇵",
    keywords: ["KP", "PRK", "North Korea", "朝鲜"],
    area: "AREA_ASIA",
  },
  {
    cca2: "RU",
    flag: "🇷🇺",
    keywords: [
      "RU",
      "RUS",
      "Russia",
      "俄罗斯",
      "俄国",
      "俄羅斯",
      "伯力",
      "莫斯科",
      "圣彼得堡",
      "西伯利亚",
      "京俄",
      "杭俄",
      "廣俄",
      "滬俄",
      "广俄",
      "沪俄",
      "Moscow",
    ],
    area: "AREA_EUROPE",
  },
  {
    cca2: "IR",
    flag: "🇮🇷",
    keywords: ["IR", "IRN", "Iran", "伊朗"],
    area: "AREA_ASIA",
  },
  {
    cca2: "IQ",
    flag: "🇮🇶",
    keywords: ["IQ", "IRQ", "Iraq", "伊拉克", "巴格达", "Baghdad"],
    area: "AREA_ASIA",
  },
  {
    cca2: "AZ",
    flag: "🇦🇿",
    keywords: ["AZ", "AZE", "Azerbaijan", "阿塞拜疆"],
    area: "AREA_ASIA",
  },
  {
    cca2: "AM",
    flag: "🇦🇲",
    keywords: ["AM", "ARM", "Armenia", "亚美尼亚"],
    area: "AREA_ASIA",
  },
  {
    cca2: "GE",
    flag: "🇬🇪",
    keywords: ["GE", "GEO", "Georgia", "格鲁吉亚", "格魯吉亞"],
    area: "AREA_ASIA",
  },
  {
    cca2: "TR",
    flag: "🇹🇷",
    keywords: ["TR", "TUR", "Turkey", "土耳其", "伊斯坦布尔", "Istanbul", "🇹🇷"],
    area: "AREA_EUROPE",
  },
  {
    cca2: "JO",
    flag: "🇯🇴",
    keywords: ["JO", "JOR", "Jordan", "约旦"],
    area: "AREA_ASIA",
  },
  {
    cca2: "IL",
    flag: "🇮🇱",
    keywords: ["IL", "ISR", "Israel", "以色列"],
    area: "AREA_ASIA",
  },
  {
    cca2: "SA",
    flag: "🇸🇦",
    keywords: ["SA", "SAU", "Saudi", "沙特阿拉伯", "沙特", "Riyadh", "利雅得"],
    area: "AREA_ASIA",
  },
  {
    cca2: "AE",
    flag: "🇦🇪",
    keywords: ["AE", "ARE", "United Arab Emirates", "阿联酋", "迪拜", "Dubai"],
    area: "AREA_ASIA",
  },
  {
    cca2: "QA",
    flag: "🇶🇦",
    keywords: ["QA", "QAT", "Qatar", "卡塔尔", "卡塔爾"],
    area: "AREA_ASIA",
  },
  {
    cca2: "BH",
    flag: "🇧🇭",
    keywords: ["BH", "BHR", "Bahrain", "巴林"],
    area: "AREA_ASIA",
  },
  {
    cca2: "OM",
    flag: "🇴🇲",
    keywords: ["OM", "OMN", "Oman", "阿曼", "马斯喀特"],
    area: "AREA_ASIA",
  },
  {
    cca2: "EG",
    flag: "🇪🇬",
    keywords: ["EG", "EGY", "Egypt", "埃及"],
    area: "AREA_AFRICA",
  },
  {
    cca2: "TN",
    flag: "🇹🇳",
    keywords: ["TN", "TUN", "Tunisia", "突尼斯"],
    area: "AREA_AFRICA",
  },
  {
    cca2: "DZ",
    flag: "🇩🇿",
    keywords: ["DZ", "DZA", "Algeria", "阿尔及利亚", "阿爾及利亞"],
    area: "AREA_AFRICA",
  },
  {
    cca2: "MA",
    flag: "🇲🇦",
    keywords: ["MA", "MAR", "Morocco", "摩洛哥"],
    area: "AREA_AFRICA",
  },
  {
    cca2: "NG",
    flag: "🇳🇬",
    keywords: ["NG", "NGA", "Nigeria", "尼日利亚", "尼日利亞", "🇳🇬"],
    area: "AREA_AFRICA",
  },
  {
    cca2: "KE",
    flag: "🇰🇪",
    keywords: ["KE", "KEN", "Kenya", "肯尼亚"],
    area: "AREA_AFRICA",
  },
  {
    cca2: "TG",
    flag: "🇹🇬",
    keywords: ["TG", "TGO", "Togo", "多哥", "洛美", "Lomé", "Lome"],
    area: "AREA_AFRICA",
  },
  {
    cca2: "ML",
    flag: "🇲🇱",
    keywords: ["ML", "MLI", "Mali", "马里"],
    area: "AREA_AFRICA",
  },
  {
    cca2: "ZA",
    flag: "🇿🇦",
    keywords: ["ZA", "ZAF", "JNB", "South Africa", "南非"],
    area: "AREA_AFRICA",
  },
  {
    cca2: "SO",
    flag: "🇸🇴",
    keywords: ["SO", "SOM", "Somalia", "索马里", "摩加迪沙", "Mogadishu"],
    area: "AREA_AFRICA",
  },
  {
    cca2: "ZW",
    flag: "🇿🇼",
    keywords: ["ZW", "ZWE", "Zimbabwe", "津巴布韦"],
    area: "AREA_AFRICA",
  },
  {
    cca2: "UA",
    flag: "🇺🇦",
    keywords: ["UA", "UKR", "Ukraine", "乌克兰", "烏克蘭", "🇺🇦"],
    area: "AREA_EUROPE",
  },
  {
    cca2: "BY",
    flag: "🇧🇾",
    keywords: ["BY", "BLR", "Belarus", "白俄罗斯", "白俄"],
    area: "AREA_EUROPE",
  },
  {
    cca2: "MD",
    flag: "🇲🇩",
    keywords: ["MD", "MDA", "Moldova", "摩尔多瓦", "摩爾多瓦"],
    area: "AREA_EUROPE",
  },
  {
    cca2: "PL",
    flag: "🇵🇱",
    keywords: ["PL", "POL", "Poland", "波兰", "波蘭", "华沙", "Warsaw"],
    area: "AREA_EUROPE",
  },
  {
    cca2: "LT",
    flag: "🇱🇹",
    keywords: ["LT", "LTU", "Lithuania", "立陶宛"],
    area: "AREA_EUROPE",
  },
  {
    cca2: "LV",
    flag: "🇱🇻",
    keywords: ["LV", "LVA", "Latvia", "拉脱维亚", "Latvija"],
    area: "AREA_EUROPE",
  },
  {
    cca2: "EE",
    flag: "🇪🇪",
    keywords: ["EE", "EST", "Estonia", "爱沙尼亚"],
    area: "AREA_EUROPE",
  },
  {
    cca2: "FI",
    flag: "🇫🇮",
    keywords: ["FI", "FIN", "Finland", "芬兰", "芬蘭", "赫尔辛基"],
    area: "AREA_EUROPE",
  },
  {
    cca2: "SE",
    flag: "🇸🇪",
    keywords: ["SE", "SWE", "Sweden", "瑞典", "斯德哥尔摩", "Stockholm"],
    area: "AREA_EUROPE",
  },
  {
    cca2: "NO",
    flag: "🇳🇴",
    keywords: ["NO", "NOR", "Norway", "挪威"],
    area: "AREA_EUROPE",
  },
  {
    cca2: "IS",
    flag: "🇮🇸",
    keywords: ["IS", "ISL", "Iceland", "冰岛", "冰島"],
    area: "AREA_EUROPE",
  },
  {
    cca2: "DK",
    flag: "🇩🇰",
    keywords: ["DK", "DNK", "Denmark", "丹麦", "丹麥"],
    area: "AREA_EUROPE",
  },
  {
    cca2: "DE",
    flag: "🇩🇪",
    keywords: [
      "DE",
      "DEU",
      "German",
      "德国",
      "德國",
      "京德",
      "滬德",
      "廣德",
      "沪德",
      "广德",
      "法兰克福",
      "Frankfurt",
      "德意志",
    ],
    area: "AREA_EUROPE",
  },
  {
    cca2: "NL",
    flag: "🇳🇱",
    keywords: [
      "NL",
      "NLD",
      "AMS",
      "Netherlands",
      "荷兰",
      "荷蘭",
      "尼德蘭",
      "阿姆斯特丹",
      "Amsterdam",
    ],
    area: "AREA_EUROPE",
  },
  {
    cca2: "BE",
    flag: "🇧🇪",
    keywords: ["BE", "BEL", "Belgium", "比利时", "比利時"],
    area: "AREA_EUROPE",
  },
  {
    cca2: "LU",
    flag: "🇱🇺",
    keywords: ["LU", "LUX", "Luxembourg", "卢森堡"],
    area: "AREA_EUROPE",
  },
  {
    cca2: "FR",
    flag: "🇫🇷",
    keywords: ["FR", "FRA", "France", "法国", "法國", "巴黎", "🇫🇷"],
    area: "AREA_EUROPE",
  },
  {
    cca2: "GB",
    flag: "🇬🇧",
    keywords: [
      "GB",
      "GBR",
      "UK",
      "Great Britain",
      "英国",
      "England",
      "United Kingdom",
      "伦敦",
      "英",
      "London",
    ],
    area: "AREA_EUROPE",
  },
  {
    cca2: "IE",
    flag: "🇮🇪",
    keywords: ["IE", "IRL", "Ireland", "爱尔兰", "愛爾蘭", "都柏林"],
    area: "AREA_EUROPE",
  },
  {
    cca2: "IM",
    flag: "🇮🇲",
    keywords: ["IM", "IMN", "Isle of Man", "马恩岛", "馬恩島"],
    area: "AREA_EUROPE",
  },
  {
    cca2: "PT",
    flag: "🇵🇹",
    keywords: ["PT", "PRT", "Portugal", "葡萄牙"],
    area: "AREA_EUROPE",
  },
  {
    cca2: "ES",
    flag: "🇪🇸",
    keywords: ["ES", "ESP", "Spain", "西班牙"],
    area: "AREA_EUROPE",
  },
  {
    cca2: "AD",
    flag: "🇦🇩",
    keywords: ["AD", "AND", "Andorra", "安道尔"],
    area: "AREA_EUROPE",
  },
  {
    cca2: "IT",
    flag: "🇮🇹",
    keywords: ["IT", "ITA", "Italy", "意大利", "義大利", "米兰", "Nachash"],
    area: "AREA_EUROPE",
  },
  {
    cca2: "VA",
    flag: "🇻🇦",
    keywords: [
      "VA",
      "VAT",
      "Vatican",
      "Vatican City",
      "Holy See",
      "梵蒂冈",
      "梵蒂岡",
    ],
    area: "AREA_EUROPE",
  },
  {
    cca2: "MT",
    flag: "🇲🇹",
    keywords: ["MT", "MLT", "Malta", "马耳他"],
    area: "AREA_EUROPE",
  },
  {
    cca2: "CH",
    flag: "🇨🇭",
    keywords: ["CH", "CHE", "Switzerland", "瑞士", "苏黎世", "Zurich"],
    area: "AREA_EUROPE",
  },
  {
    cca2: "AT",
    flag: "🇦🇹",
    keywords: ["AT", "AUT", "Austria", "奥地利", "奧地利", "维也纳"],
    area: "AREA_EUROPE",
  },
  {
    cca2: "HU",
    flag: "🇭🇺",
    keywords: ["HU", "HUN", "Hungary", "匈牙利"],
    area: "AREA_EUROPE",
  },
  {
    cca2: "SK",
    flag: "🇸🇰",
    keywords: ["SK", "SVK", "Slovakia", "斯洛伐克"],
    area: "AREA_EUROPE",
  },
  {
    cca2: "CZ",
    flag: "🇨🇿",
    keywords: ["CZ", "CZE", "Czechia", "捷克", "Czech", "Czech Republic"],
    area: "AREA_EUROPE",
  },
  {
    cca2: "RO",
    flag: "🇷🇴",
    keywords: ["RO", "ROU", "Romania", "罗马尼亚"],
    area: "AREA_EUROPE",
  },
  {
    cca2: "BG",
    flag: "🇧🇬",
    keywords: ["BG", "BGR", "Bulgaria", "保加利亚", "保加利亞"],
    area: "AREA_EUROPE",
  },
  {
    cca2: "RS",
    flag: "🇷🇸",
    keywords: ["RS", "SRB", "Serbia", "塞尔维亚"],
    area: "AREA_EUROPE",
  },
  {
    cca2: "MK",
    flag: "🇲🇰",
    keywords: ["MK", "MKD", "Macedonia", "马其顿", "馬其頓"],
    area: "AREA_EUROPE",
  },
  {
    cca2: "AL",
    flag: "🇦🇱",
    keywords: ["AL", "ALB", "Albania", "阿尔巴尼亚", "阿爾巴尼亞"],
    area: "AREA_EUROPE",
  },
  {
    cca2: "GR",
    flag: "🇬🇷",
    keywords: ["GR", "GRC", "Greece", "希腊", "希臘"],
    area: "AREA_EUROPE",
  },
  {
    cca2: "SI",
    flag: "🇸🇮",
    keywords: ["SI", "SVN", "Slovenia", "斯洛文尼亚"],
    area: "AREA_EUROPE",
  },
  {
    cca2: "HR",
    flag: "🇭🇷",
    keywords: ["HR", "HRV", "Croatia", "克罗地亚", "克羅地亞"],
    area: "AREA_EUROPE",
  },
  {
    cca2: "BA",
    flag: "🇧🇦",
    keywords: ["BA", "BIH", "Bosnia and Herzegovina", "波黑共和国", "波黑"],
    area: "AREA_EUROPE",
  },
  {
    cca2: "CY",
    flag: "🇨🇾",
    keywords: ["CY", "CYP", "Cyprus", "塞浦路斯"],
    area: "AREA_EUROPE",
  },
  {
    cca2: "AU",
    flag: "🇦🇺",
    keywords: [
      "AU",
      "AUS",
      "Australia",
      "澳大利亚",
      "澳洲",
      "墨尔本",
      "悉尼",
      "土澳",
      "京澳",
      "廣澳",
      "滬澳",
      "沪澳",
      "广澳",
      "Sydney",
    ],
    area: "AREA_OCEANIA",
  },
  {
    cca2: "NZ",
    flag: "🇳🇿",
    keywords: ["NZ", "NZL", "New Zealand", "新西兰", "新西蘭"],
    area: "AREA_OCEANIA",
  },
  {
    cca2: "PG",
    flag: "🇵🇬",
    keywords: ["PG", "PNG", "Papua New Guinea", "巴布亚新几内亚"],
    area: "AREA_OCEANIA",
  },
  {
    cca2: "WS",
    flag: "🇼🇸",
    keywords: ["WS", "WSM", "Samoa", "萨摩亚", "薩摩亞"],
    area: "AREA_OCEANIA",
  },
  {
    cca2: "GU",
    flag: "🇬🇺",
    keywords: ["GU", "GUM", "Guam", "关岛", "關島"],
    area: "AREA_OCEANIA",
  },
  {
    cca2: "MP",
    flag: "🇲🇵",
    keywords: [
      "MP",
      "MNP",
      "北马里亚纳",
      "Northern Mariana Islands",
      "Saipan",
      "塞班",
    ],
    area: "AREA_OCEANIA",
  },
  {
    cca2: "US",
    flag: "🇺🇸",
    keywords: [
      "US",
      "USA",
      "LAX",
      "SFO",
      "SJC",
      "United States",
      "美国",
      "America",
      "美",
      "京美",
      "波特兰",
      "达拉斯",
      "俄勒冈",
      "Oregon",
      "凤凰城",
      "费利蒙",
      "硅谷",
      "矽谷",
      "拉斯维加斯",
      "洛杉矶",
      "圣何塞",
      "圣克拉拉",
      "西雅图",
      "芝加哥",
      "沪美",
      "哥伦布",
      "纽约",
      "New York",
      "Los Angeles",
      "San Jose",
      "Sillicon Valley",
      "Michigan",
      "俄亥俄",
      "Ohio",
      "马纳萨斯",
      "Manassas",
      "弗吉尼亚",
      "Virginia",
      "🇺🇸",
      "🇺🇲",
    ],
    area: "AREA_NORTH_AMERICA",
  },
  {
    cca2: "CA",
    flag: "🇨🇦",
    keywords: [
      "CA",
      "CAN",
      "Canada",
      "加拿大",
      "蒙特利尔",
      "温哥华",
      "楓葉",
      "枫叶",
      "滑铁卢",
      "多伦多",
      "Waterloo",
      "Toronto",
    ],
    area: "AREA_NORTH_AMERICA",
  },
  {
    cca2: "MX",
    flag: "🇲🇽",
    keywords: ["MX", "MEX", "Mexico", "墨西哥"],
    area: "AREA_NORTH_AMERICA",
  },
  {
    cca2: "GT",
    flag: "🇬🇹",
    keywords: ["GT", "GTM", "Guatemala", "危地马拉"],
    area: "AREA_NORTH_AMERICA",
  },
  {
    cca2: "CR",
    flag: "🇨🇷",
    keywords: ["CR", "CRI", "Costa Rica", "哥斯达黎加"],
    area: "AREA_NORTH_AMERICA",
  },
  {
    cca2: "PA",
    flag: "🇵🇦",
    keywords: ["PA", "PAN", "Panama", "巴拿马"],
    area: "AREA_NORTH_AMERICA",
  },
  {
    cca2: "CO",
    flag: "🇨🇴",
    keywords: ["CO", "COL", "Colombia", "哥伦比亚"],
    area: "AREA_SOUTH_AMERICA",
  },
  {
    cca2: "VE",
    flag: "🇻🇪",
    keywords: ["VE", "VEN", "Venezuela", "委内瑞拉"],
    area: "AREA_SOUTH_AMERICA",
  },
  {
    cca2: "EC",
    flag: "🇪🇨",
    keywords: ["EC", "ECU", "Ecuador", "厄瓜多尔"],
    area: "AREA_SOUTH_AMERICA",
  },
  {
    cca2: "PE",
    flag: "🇵🇪",
    keywords: ["PE", "PER", "Peru", "秘鲁", "祕魯"],
    area: "AREA_SOUTH_AMERICA",
  },
  {
    cca2: "BO",
    flag: "🇧🇴",
    keywords: ["BO", "BOL", "Bolivia", "玻利维亚"],
    area: "AREA_SOUTH_AMERICA",
  },
  {
    cca2: "PY",
    flag: "🇵🇾",
    keywords: ["PY", "PRY", "Paraguay", "巴拉圭"],
    area: "AREA_SOUTH_AMERICA",
  },
  {
    cca2: "BR",
    flag: "🇧🇷",
    keywords: ["BR", "BRA", "Brazil", "巴西", "圣保罗"],
    area: "AREA_SOUTH_AMERICA",
  },
  {
    cca2: "CL",
    flag: "🇨🇱",
    keywords: ["CL", "CHL", "Chile", "智利"],
    area: "AREA_SOUTH_AMERICA",
  },
  {
    cca2: "AR",
    flag: "🇦🇷",
    keywords: ["AR", "ARG", "Argentina", "阿根廷"],
    area: "AREA_SOUTH_AMERICA",
  },
  {
    cca2: "UY",
    flag: "🇺🇾",
    keywords: ["UY", "URY", "Uruguay", "乌拉圭"],
    area: "AREA_SOUTH_AMERICA",
  },
  {
    cca2: "PR",
    flag: "🇵🇷",
    keywords: ["PR", "PRI", "Puerto Rico", "波多黎各"],
    area: "AREA_NORTH_AMERICA",
  },
  {
    cca2: "AW",
    flag: "🇦🇼",
    keywords: ["AW", "ABW", "Aruba", "阿鲁巴"],
    area: "AREA_NORTH_AMERICA",
  },
  {
    cca2: "AG",
    flag: "🇦🇬",
    keywords: ["AG", "ATG", "Antigua and Barbuda", "安提瓜和巴布达"],
    area: "AREA_NORTH_AMERICA",
  },
  {
    cca2: "RE",
    flag: "🇷🇪",
    keywords: ["RE", "REU", "Réunion", "留尼汪", "法属留尼汪"],
    area: "AREA_AFRICA",
  },
  {
    cca2: "GL",
    flag: "🇬🇱",
    keywords: ["GL", "GRL", "Greenland", "格陵兰岛", "格陵兰"],
    area: "AREA_NORTH_AMERICA",
  },
  {
    cca2: "AQ",
    flag: "🇦🇶",
    keywords: ["AQ", "ATA", "Antarctica", "南极洲", "南极"],
    area: "AREA_ANTARCTICA",
  },
];

const getFull = (proxy) => {
  if (!proxy) {
    return { cca2: "", flag: "", keywords: [], area: "", order: -1 };
  }
  const accurateLocation = proxy.properties?.location ?? "";
  const proxyName = proxy.name.toLowerCase();
  for (let i = 0; i < locationEntries.length; i++) {
    const entry = locationEntries[i];
    if (
      (accurateLocation && entry.cca2 === accurateLocation) ||
      proxyName.includes(entry.flag)
    ) {
      return { ...entry, order: i + 1 };
    }
  }
  // fallback
  for (let i = 0; i < locationEntries.length; i++) {
    const entry = locationEntries[i];
    if (
      entry.keywords.some(
        (keyword) =>
          keyword &&
          keyword !== "" &&
          proxyName.includes(keyword.toLowerCase()),
      )
    ) {
      return { ...entry, order: i + 1 };
    }
  }

  // not found
  return { cca2: "", flag: "", keywords: [], area: "", order: -1 };
};

const getLocation = (proxy) => getFull(proxy).cca2;
const getOrder = (proxy) => getFull(proxy).order;
const getArea = (proxy) => getFull(proxy).area;

const sortProxies = ({ proxies }) => {
  const emptyProviderKey = "_empty";
  const providerList = {};
  const finalProxies = [];

  // rename and merge proxies
  for (const proxy of proxies) {
    let providerName = emptyProviderKey;
    if (
      proxy.properties !== undefined &&
      proxy.properties.provider !== undefined
    ) {
      providerName = proxy.properties.provider;
      proxy.name = [providerName, proxy.name].join("/");
    }
    proxy.name = proxy.name.trim();

    providerList[providerName] = [...(providerList[providerName] ?? []), proxy];
  }

  Object.keys(providerList)
    .sort((a, b) => {
      if (a === emptyProviderKey) return b === emptyProviderKey ? 0 : -1;
      if (b === emptyProviderKey) return 0;
      else return a.localeCompare(b);
    })
    .map((providerName) => {
      const providerSet = providerList[providerName];
      providerSet.sort((a, b) => {
        const locationDiff = getOrder(a) - getOrder(b);
        if (locationDiff !== 0) return locationDiff;

        return a.name.localeCompare(b.name);
      });
      return providerSet;
    })
    .map((providerSet) => {
      finalProxies.push(...providerSet);
    });

  return finalProxies;
};

const locationObj = { load: true, func: {}, const: {} };
locationObj.func.getFull = getFull;
locationObj.func.getLocation = getLocation;
locationObj.func.getOrder = getOrder;
locationObj.func.getArea = getArea;
locationObj.func.sortProxies = sortProxies;

locationObj.const.locationEntries = locationEntries;

context.young = {
  ...(context.young || {}),
  features: {
    ...(context.young?.features || {}),
    location: locationObj,
  },
};
