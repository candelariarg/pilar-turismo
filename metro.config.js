const path = require('path');
const fs = require('fs');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const reactNativeSrcDir = path.resolve(__dirname, 'node_modules/react-native/src');

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('react-native/')) {
    const subpath = moduleName.replace('react-native/', '');
    const candidate = path.join(reactNativeSrcDir, `${subpath}.js`);
    if (fs.existsSync(candidate)) {
      return {
        filePath: candidate,
        type: 'sourceFile',
      };
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
