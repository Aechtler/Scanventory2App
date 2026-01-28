module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@/features': './src/features',
            '@/shared': './src/shared',
            '@/app': './src/app',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
