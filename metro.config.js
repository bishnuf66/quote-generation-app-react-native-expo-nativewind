const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

// Get the default Metro config
const config = getDefaultConfig(__dirname, {
  // Enable CSS support
  isCSSEnabled: true,
});

// Add the NativeWind plugin
module.exports = withNativeWind(config, { 
  input: './global.css',
  projectRoot: __dirname,
  configPath: './tailwind.config.js',
  isDev: process.env.NODE_ENV !== 'production',
});