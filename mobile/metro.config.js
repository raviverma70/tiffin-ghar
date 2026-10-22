const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Bhasha ki files web se hi aati hain (ek hi jagah text), isliye Metro ko web/src/i18n bhi dikhao
config.watchFolders = [path.resolve(__dirname, "../web/src/i18n")];

module.exports = config;
