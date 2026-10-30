const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Bhasha ki files aur form ke suggestion chips web se hi aate hain (ek hi jagah), isliye Metro ko ye bhi dikhao.
// web/src/lib se sirf wahi file bundle hoti hai jo import ho (suggestions.ts); baaki (Next.js wali) nahi.
config.watchFolders = [path.resolve(__dirname, "../web/src/i18n"), path.resolve(__dirname, "../web/src/lib")];

module.exports = config;
