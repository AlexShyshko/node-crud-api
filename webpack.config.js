import path, { resolve } from 'path';
import ESLintPlugin from 'eslint-webpack-plugin';

export default {
  target: 'node',
  mode: 'production',
  entry: path.resolve(import.meta.dirname, './src/index.ts'),
  output: {
    clean: true,
    path: path.resolve(import.meta.dirname, './dist'),
    filename: 'index.js',
  },
  module: {
    rules: [
      {
        test: /\.ts$/i,
        use: 'ts-loader',
        exclude: ['/node_modules/'],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  plugins: [
    ...[new ESLintPlugin({
      extensions: ['ts', 'js'],
      failOnError: true,
      fix: true,
    })],
  ],
};