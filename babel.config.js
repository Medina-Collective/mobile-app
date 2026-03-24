module.exports = function (api) {
  api.cache(true);

  // Jest sets BABEL_ENV=test. The reanimated plugin requires react-native-worklets
  // which is a native module — skip it in unit tests to avoid the missing module error.
  const isTest = process.env.BABEL_ENV === 'test' || process.env.NODE_ENV === 'test';

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@features': './src/features',
            '@hooks': './src/hooks',
            '@utils': './src/utils',
            '@constants': './src/constants',
            '@app-types': './src/types',
            '@theme': './src/theme',
            '@services': './src/services',
            '@store': './src/store',
            '@assets': './assets',
          },
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        },
      ],
      // IMPORTANT: react-native-reanimated/plugin must always be last
      // Skip in test environment — it requires react-native-worklets (native module)
      ...(!isTest ? ['react-native-reanimated/plugin'] : []),
    ],
  };
};
