const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// React Compiler injects `react/compiler-runtime` imports but React 18
// doesn't export that subpath. Redirect it to the standalone package.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react/compiler-runtime') {
    return {
      filePath: require.resolve('react-compiler-runtime'),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
