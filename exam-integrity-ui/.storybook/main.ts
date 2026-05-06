import type { StorybookConfig } from '@storybook/react-webpack5';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/preset-create-react-app',
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  staticDirs: ['../public'],
  webpackFinal: async (config) => {
    // Add TypeScript + JSX support using the babel preset already installed by react-scripts
    config.module?.rules?.push({
      test: /\.(ts|tsx)$/,
      exclude: /node_modules/,
      use: [
        {
          loader: require.resolve('babel-loader'),
          options: {
            presets: [
              [require.resolve('babel-preset-react-app'), { flow: false, typescript: true }],
            ],
          },
        },
      ],
    });
    if (config.resolve) {
      config.resolve.extensions = [...(config.resolve.extensions ?? []), '.ts', '.tsx'];
    }
    return config;
  },
};

export default config;
