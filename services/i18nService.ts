
export type Language = 'en' | 'ar' | 'ur';

export interface Translations {
  searchPlaceholder: string;
  postAd: string;
  myAccount: string;
  assistant: string;
  footerAbout: string;
  footerLinks: string;
  footerCategories: string;
  footerSupport: string;
  allRights: string;
  buySale: string;
  verifiedAssets: string;
  marketIntel: string;
  premiumHomes: string;
}

const translations: Record<Language, Translations> = {
  en: {
    searchPlaceholder: "Search Property, Vehicles, or ID...",
    postAd: "Post Listing",
    myAccount: "My Account",
    assistant: "Assistant",
    footerAbout: "Trazot is the definitive gateway for high-net-worth transactions across South Asia and the Gulf.",
    footerLinks: "Quick Links",
    footerCategories: "Top Categories",
    footerSupport: "Global Support",
    allRights: "All Rights Reserved",
    buySale: "Buy and Sale Premium Assets",
    verifiedAssets: "Verified Assets",
    marketIntel: "Market Intel",
    premiumHomes: "Premium Homes"
  },
  ar: {
    searchPlaceholder: "بحث عن عقارات، مركبات، أو رقم الهوية...",
    postAd: "أضف إعلان",
    myAccount: "حسابي",
    assistant: "المساعد",
    footerAbout: "ترازوت هي البوابة النهائية للمعاملات ذات القيمة العالية عبر جنوب آسيا والخليج.",
    footerLinks: "روابط سريعة",
    footerCategories: "الفئات الرئيسية",
    footerSupport: "الدعم العالمي",
    allRights: "جميع الحقوق محفوظة",
    buySale: "بيع وشراء الأصول المتميزة",
    verifiedAssets: "الأصول الموثقة",
    marketIntel: "ذكاء السوق",
    premiumHomes: "منازل فاخرة"
  },
  ur: {
    searchPlaceholder: "پراپرٹی، گاڑیاں، یا آئی ڈی تلاش کریں...",
    postAd: "اشتہار دیں",
    myAccount: "میرا اکاؤنٹ",
    assistant: "اسسٹنٹ",
    footerAbout: "ترازوت جنوبی ایشیا اور خلیج میں قیمتی اثاثوں کی خرید و فروخت کا سب سے معتبر پلیٹ فارم ہے۔",
    footerLinks: "فوری لنکس",
    footerCategories: "ٹاپ کیٹیگریز",
    footerSupport: "عالمی سپورٹ",
    allRights: "جملہ حقوق محفوظ ہیں",
    buySale: "پریمیم اثاثوں کی خرید و فروخت",
    verifiedAssets: "تصدیق شدہ اثاثے",
    marketIntel: "مارکیٹ انٹیل",
    premiumHomes: "پریمیم گھر"
  }
};

export const i18n = {
  get: (lang: Language): Translations => translations[lang] || translations.en,
  isRTL: (lang: Language): boolean => lang === 'ar' || lang === 'ur'
};
