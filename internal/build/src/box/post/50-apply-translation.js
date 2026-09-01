// @call = applyTranslation
const applyTranslation = ({ config = {}, ua = undefined, ...rest }) => {
  const ret = { config, ua, ...rest };

  const translations = {
    "🌐 Direct": {
      zh_CN: "🌐 直连",
      zh_TW: "🌐 直連",
      fa: "🌐 اتصال مستقیم",
      ru: "🌐 Прямое подключение",
    },
    "🙋 Select": {
      zh_CN: "🙋 手动选择",
      zh_TW: "🙋 手動選擇",
      fa: "🙋 انتخاب دستی",
      ru: "🙋 Ручной выбор",
    },
    "🔍 Google": {
      zh_CN: "🔍 谷歌服务",
      zh_TW: "🔍 谷歌服務",
      fa: "🔍 سرویس‌های گوگل",
      ru: "🔍 Сервисы Google",
    },
    "🐈 Git": {
      zh_CN: "🐈 开发服务",
      zh_TW: "🐈 開發服務",
      fa: "🐈 سرویس‌های توسعه",
      ru: "🐈 Сервисы разработки",
    },
    "📦 Microsoft": {
      zh_CN: "📦 微软服务",
      zh_TW: "📦 微軟服務",
      fa: "📦 سرویس‌های مایکروسافت",
      ru: "📦 Сервисы Microsoft",
    },
    "📺 Youtube": {
      zh_CN: "📺 油管",
      zh_TW: "📺 油管",
      fa: "📺 یوتیوب",
      ru: "📺 YouTube",
    },
    "🎬 Entertainment": {
      zh_CN: "🎬 流媒体",
      zh_TW: "🎬 串流媒體",
      fa: "🎬 سرگرمی",
      ru: "🎬 Развлечения",
    },
    "🤖 AI-Service": {
      zh_CN: "🤖 AI服务",
      zh_TW: "🤖 AI 服務",
      fa: "🤖 سرویس هوش مصنوعی",
      ru: "🤖 Сервисы ИИ",
    },
    "🍎 Apple": {
      zh_CN: "🍎 苹果服务",
      zh_TW: "🍎 蘋果服務",
      fa: "🍎 سرویس‌های اپل",
      ru: "🍎 Сервисы Apple",
    },
    "✈️ TelegramDC1(NA)": {
      zh_CN: "✈️ 电报DC1 (北美)",
      zh_TW: "✈️ 電報DC1 (北美)",
      fa: "✈️ تلگرام DC1 (آمریکای شمالی)",
      ru: "✈️ Telegram DC1 (Северная Америка)",
    },
    "✈️ TelegramDC4(EU)": {
      zh_CN: "✈️ 电报DC4 (欧洲)",
      zh_TW: "✈️ 電報DC4 (歐洲)",
      fa: "✈️ تلگرام DC4 (اروپا)",
      ru: "✈️ Telegram DC4 (Европа)",
    },
    "✈️ TelegramDC5(AP)": {
      zh_CN: "✈️ 电报DC5 (亚太)",
      zh_TW: "✈️ 電報DC5 (亞太)",
      fa: "✈️ تلگرام DC5 (آسیا-اقیانوسیه)",
      ru: "✈️ Telegram DC5 (Азиатско-Тихоокеанский регион)",
    },
  };

  let translation;
  if (ua?.isZhCN) {
    translation = "zh_CN";
  } else if (ua?.isZhTW) {
    translation = "zh_TW";
  } else if (ua?.isEnUS) {
    translation = "en_US";
  } else if (ua?.isFa) {
    translation = "fa";
  } else if (ua?.isRu) {
    translation = "ru";
  }

  if (!config || !translation) {
    return ret;
  }

  let jsonConfig = JSON.stringify(config);
  Object.entries(translations).map(([raw, localized]) => {
    const target = localized[translation] ?? raw;
    jsonConfig = jsonConfig.replaceAll(raw, target);
  });

  return { config: JSON.parse(jsonConfig), ua, ...rest };
};
