// @call = applyTranslation
const applyTranslation = ({ config = {}, ua = undefined, ...rest }) => {
  const ret = { config, ua, ...rest };

  const globalTranslation = {
    zh_CN: {
      "🌐 Direct": "🌐 直连",
      "🙋 Select": "🙋 手动选择",
      "🔍 Google": "🔍 谷歌服务",
      "🐈 Git": "🐈 开发服务",
      "🪟 Microsoft": "🪟 微软服务",
      "📺 Entertainment": "📺 流媒体",
      "🤖 AI-Service": "🤖 AI服务",
      "🍎 Apple": "🍎 苹果服务",

      "✈️ TelegramDC1(NA)": "✈️ 电报DC1 (北美)",
      "✈️ TelegramDC4(EU)": "✈️ 电报DC4 (欧洲)",
      "✈️ TelegramDC5(AP)": "✈️ 电报DC5 (亚太)",
    },
  };

  if (!config || !ua || !ua.isZhCN) {
    return ret;
  }

  let jsonConfig = JSON.stringify(config);
  Object.keys(globalTranslation.zh_CN).map((raw) => {
    const target = globalTranslation.zh_CN[raw];
    jsonConfig = jsonConfig.replaceAll(raw, target);
  });

  return { config: JSON.parse(jsonConfig), ua, ...rest };
};
