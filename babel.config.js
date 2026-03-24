module.exports = function (api) {
  api.cache(true);
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
      'react-native-reanimated/plugin',
    ],
  };
};
