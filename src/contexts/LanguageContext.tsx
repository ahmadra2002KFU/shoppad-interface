import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Header
    smartCart: "Smart Cart",
    items: "items",
    
    // Categories
    all: "All",
    groceries: "Groceries",
    bakery: "Bakery",
    dairy: "Dairy",
    beverages: "Beverages",
    cleaning: "Cleaning",
    clothing: "Clothing",
    kitchen: "Kitchen",
    snacks: "Snacks",
    meat: "Meat",
    
    // Scanner
    scanBarcode: "Scan Barcode",
    scanQRCode: "Scan QR Code",
    scanningQRCode: "Scanning for QR code...",
    qrCodeScanned: "QR code scanned successfully!",
    qrScanInstructions: "Position the QR code within the frame",
    scanningBarcode: "Scanning for barcode...",
    barcodeScanned: "Barcode scanned successfully!",
    barcodeScanInstructions: "Position the barcode within the frame",
    invalidBarcode: "Invalid Barcode",
    productNotFound: "Product Not Found",
    cancel: "Cancel",
    invalidQRCode: "Invalid QR Code",
    productAdded: "Product Added",
    weightMismatch: "Weight Mismatch",
    
    // Cart
    cart: "Cart",
    emptyCart: "Your cart is empty",
    startShopping: "Start adding items to your cart",
    total: "Total",
    checkout: "Checkout",
    
    // Offers
    offers: "Offers",
    weeklyOffers: "Weekly Offers",
    freshProduceSale: "Fresh Produce Sale",
    allFruitsVegetables: "All fruits and vegetables",
    kitchenEssentials: "Kitchen Essentials",
    cookwareUtensils: "Cookware and utensils",
    clothingDeal: "Clothing Deal",
    allApparelItems: "All apparel items",
    
    // Map
    map: "Map",
    storeMap: "Store Map",
    clickToEnlarge: "Click to enlarge",
    
    // Weight
    currentWeight: "Current Weight",
    
    // Payment
    waitingForNFC: "Waiting for NFC Card",
    tapYourCard: "Please tap your card on the reader",
    paymentSuccessful: "Payment Successful!",
    thankYouForShopping: "Thank you for shopping with us!",
    paymentFailed: "Payment Failed",
    pleaseTryAgain: "Please try again or use another payment method",
    tryAgain: "Try Again",

    // NFC Checkout
    nfcCheckoutTitle: "Ready to Checkout?",
    nfcCheckoutMessage: "Are you ready to complete your purchase?",
    nfcDetected: "NFC card detected",
    cartEmpty: "Cart is empty - add items first",
    checkoutCancelled: "Checkout cancelled",
    yes: "Yes",
    no: "No",

    // Toast messages
    barcodeScanner: "Barcode scanner activated",
    qrScanner: "QR Code scanner activated",
    scannerDescription: "Scanner functionality will be integrated here",
  },
  ar: {
    // Header
    smartCart: "عربة التسوق الذكية",
    items: "منتج",
    
    // Categories
    all: "الكل",
    groceries: "بقالة",
    bakery: "مخبز",
    dairy: "ألبان",
    beverages: "مشروبات",
    cleaning: "تنظيف",
    clothing: "ملابس",
    kitchen: "مطبخ",
    snacks: "وجبات خفيفة",
    meat: "لحوم",
    
    // Scanner
    scanBarcode: "مسح الباركود",
    scanQRCode: "مسح رمز الاستجابة",
    scanningQRCode: "جاري البحث عن رمز الاستجابة...",
    qrCodeScanned: "تم مسح رمز الاستجابة بنجاح!",
    qrScanInstructions: "ضع رمز الاستجابة داخل الإطار",
    scanningBarcode: "جاري البحث عن الباركود...",
    barcodeScanned: "تم مسح الباركود بنجاح!",
    barcodeScanInstructions: "ضع الباركود داخل الإطار",
    invalidBarcode: "باركود غير صالح",
    productNotFound: "المنتج غير موجود",
    cancel: "إلغاء",
    invalidQRCode: "رمز استجابة غير صالح",
    productAdded: "تمت إضافة المنتج",
    weightMismatch: "عدم تطابق الوزن",
    
    // Cart
    cart: "السلة",
    emptyCart: "السلة فارغة",
    startShopping: "ابدأ بإضافة المنتجات إلى سلتك",
    total: "المجموع",
    checkout: "الدفع",
    
    // Offers
    offers: "العروض",
    weeklyOffers: "العروض الأسبوعية",
    freshProduceSale: "تخفيضات المنتجات الطازجة",
    allFruitsVegetables: "جميع الفواكه والخضروات",
    kitchenEssentials: "أساسيات المطبخ",
    cookwareUtensils: "أدوات الطبخ والمطبخ",
    clothingDeal: "عرض الملابس",
    allApparelItems: "جميع الملابس",
    
    // Map
    map: "الخريطة",
    storeMap: "خريطة المتجر",
    clickToEnarge: "انقر للتكبير",
    
    // Weight
    currentWeight: "الوزن الحالي",
    
    // Payment
    waitingForNFC: "في انتظار بطاقة NFC",
    tapYourCard: "يرجى وضع بطاقتك على القارئ",
    paymentSuccessful: "تمت الدفع بنجاح!",
    thankYouForShopping: "شكراً لتسوقك معنا!",
    paymentFailed: "فشلت عملية الدفع",
    pleaseTryAgain: "يرجى المحاولة مرة أخرى أو استخدام طريقة دفع أخرى",
    tryAgain: "حاول مرة أخرى",

    // NFC Checkout
    nfcCheckoutTitle: "هل أنت مستعد للدفع؟",
    nfcCheckoutMessage: "هل أنت مستعد لإتمام عملية الشراء؟",
    nfcDetected: "تم اكتشاف بطاقة NFC",
    cartEmpty: "السلة فارغة - أضف منتجات أولاً",
    checkoutCancelled: "تم إلغاء عملية الدفع",
    yes: "نعم",
    no: "لا",

    // Toast messages
    barcodeScanner: "تم تفعيل ماسح الباركود",
    qrScanner: "تم تفعيل ماسح رمز الاستجابة",
    scannerDescription: "سيتم دمج وظيفة الماسح هنا",
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    // Apply RTL for Arabic
    if (language === "ar") {
      document.documentElement.dir = "rtl";
      document.documentElement.lang = "ar";
    } else {
      document.documentElement.dir = "ltr";
      document.documentElement.lang = "en";
    }
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "ar" : "en"));
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}