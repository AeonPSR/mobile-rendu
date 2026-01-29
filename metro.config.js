const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix for Windows path issues with node:sea and node:util
if (process.platform === 'win32') {
  config.resolver.platforms = ['native', 'web', 'android', 'ios'];
  config.resolver.nodeModulesPaths = [
    './node_modules',
  ];
  
  // Disable node externals that cause issues on Windows
  config.resolver.disableHierarchicalLookup = false;
  config.resolver.enableGlobalPackages = false;
}

// Disable experimental features that might cause issues
config.resolver.unstable_enablePackageExports = false;

module.exports = config;