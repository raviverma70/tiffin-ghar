import type { MessageKey } from "./messages/hinglish";
import type { Translator } from "./translate";

// Backend ke message (exact text) se bhasha ki key. Naya message jo yahan nahi hai wo jaisa hai waisa dikhta hai.
const ERROR_KEYS: Record<string, MessageKey> = {
  "Aap apni hi dukaan se order nahi kar sakte": "err.ownShop",
  "Aapki provider profile pehle se bani hai": "err.profileExists",
  "Aapko ye karne ki ijazat nahi hai": "err.forbidden",
  "Ab ye order cancel nahi ho sakta": "err.cannotCancel",
  "Bahut galat koshish, naya OTP maango": "err.tooManyOtpTries",
  "Ek item ki quantity 20 se zyada nahi ho sakti": "err.qtyMax",
  "Galat item id": "err.badItemId",
  "Galat order id": "err.badOrderId",
  "Galat provider id": "err.badProviderId",
  "Item nahi mila": "err.itemNotFound",
  "JSON galat likha hai": "err.badJson",
  "Kuch gadbad hui, baad me try karo": "err.generic",
  "Kuch items aaj ke menu me nahi hain ya band hain": "err.itemsNotInMenu",
  "Login zaroori hai": "err.loginRequired",
  "OTP expire ho gaya, naya maango": "err.otpExpired",
  "OTP galat hai": "err.otpWrong",
  "Order ka total bahut zyada hai": "err.totalTooHigh",
  "Order nahi mila": "err.orderNotFound",
  "Order pehle hi cancel ho chuka hai": "err.alreadyCancelled",
  "Pehle OTP maango": "err.askOtpFirst",
  "Profile abhi approve nahi hui hai": "err.notApproved",
  "Provider profile nahi mili": "err.providerProfileMissing",
  "Session khatam ho gaya, dobara login karo": "err.sessionEnded",
  "Thoda ruko, 1 minute baad dobara try karo": "err.slowDown",
  "Token galat ya expire hai, dobara login karo": "err.tokenBad",
  "Token galat ya expire hai": "err.tokenBad",
  "User nahi mila": "err.userNotFound",
  "Ye dukaan abhi band hai ya mili nahi": "err.shopClosed",
  "Ye route nahi mila": "err.routeNotFound",
  "Items galat hain, page reload karo": "err.itemsBad",
  "Server se jud nahi paye, baad me try karo": "err.network",
  "Server se baat nahi ho pa rahi, baad me try karo": "err.network",
  "Galat input": "err.badInput",
  "Galat data": "err.badInput",
  "6 digit ka OTP daalo": "err.otp6",
  "6 digit ka pincode daalo": "err.pincode6",
  "Daam kam se kam ₹1 ho": "err.priceMin",
  "Daam number me daalo": "err.priceNumber",
  "Daam paise me, poora number daalo (₹85 = 8500)": "err.pricePaise",
  "Daam ₹10,000 se zyada nahi ho sakta": "err.priceMax",
  "Delivery ka pata likho": "err.addressRequired",
  "Delivery ka poora pata likho": "err.addressRequired",
  "Poora pata likho": "err.addressRequired",
  "Dish ka naam likho": "err.dishName",
  "Dukaan ka naam likho": "err.shopName",
  "Ek order me 20 se zyada alag items nahi ho sakte": "err.itemsMax",
  "FSSAI number 14 digit ka hota hai": "err.fssai",
  "Items ki list bhejo": "err.itemsList",
  "Kam se kam ek item chuno": "err.itemsMin",
  "Kuch to badalne ke liye bhejo": "err.nothingToChange",
  "Limit 1 se 50 ke beech rakho": "err.limitRange",
  "Note 200 akshar se chhota rakho": "err.noteMax",
  "Page 1 ya usse bada hona chahiye": "err.pageMin",
  "Pata 250 akshar se chhota rakho": "err.addressMax",
  "Quantity 1 se 20 ke beech rakho": "err.qtyRange",
  "Quantity number me daalo": "err.qtyNumber",
  "Refresh token galat hai": "err.refreshBad",
  "Sahi 10 digit ka mobile number daalo": "err.phone10",
  "Sahi id bhejo": "err.idBad",
  "Shehar likho": "err.cityRequired",
  "Status galat hai": "err.statusBad",
  "Rating 1 se 5 ke beech chuno": "err.ratingRange",
  "Review 500 akshar se chhota rakho": "err.reviewMax",
  "Review sirf pahunche hue order par de sakte ho": "err.reviewNotDelivered",
  "Is order ka review pehle hi ho chuka hai": "err.reviewExists",
  "Dukaan nahi mili": "err.shopNotFound",
  "Provider nahi mila": "err.providerNotFound",
  "Photo 2 MB se chhoti rakho (JPG, PNG ya WebP)": "err.photoTooBig",
  "Sirf JPG, PNG ya WebP photo bhejo": "err.photoType",
  "Ye photo sahi nahi hai. JPG, PNG ya WebP bhejo": "err.photoBad",
  "Bahut zyada reviews, thodi der baad try karo": "err.tooManyReviews",
  "Bahut zyada photo upload, thodi der baad try karo": "err.tooManyUploads",
  "Bhasha galat hai": "err.langBad",
};

const PSTATUS: Record<string, MessageKey> = {
  PLACED: "pstatus.PLACED",
  ACCEPTED: "pstatus.ACCEPTED",
  PREPARING: "pstatus.PREPARING",
  OUT_FOR_DELIVERY: "pstatus.OUT_FOR_DELIVERY",
  DELIVERED: "pstatus.DELIVERED",
  REJECTED: "pstatus.REJECTED",
  CANCELLED: "pstatus.CANCELLED",
};

export function translateError(t: Translator, message: string): string {
  const key = ERROR_KEYS[message];
  if (key) return t(key);

  // "Order abhi ACCEPTED hai, isse CANCELLED nahi kar sakte"
  const m = /^Order abhi ([A-Z_]+) hai, isse ([A-Z_]+) nahi kar sakte$/.exec(message);
  if (m) {
    const from = PSTATUS[m[1]];
    const to = PSTATUS[m[2]];
    if (from && to) return t("err.statusConflict", { from: t(from), to: t(to) });
  }

  return message;
}
