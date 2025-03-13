const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// HMR/Fast Refresh 관련 설정
config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'json'];
config.transformer.minifierConfig = {
  keep_classnames: true,
  keep_fnames: true,
  mangle: {
    keep_classnames: true,
    keep_fnames: true
  }
};

module.exports = config;