const path = require('path');

module.exports = {
  target: 'node',
  mode: 'development',
  entry: path.resolve(__dirname, 'src/main.ts'),
  devtool: 'source-map',

  output: {
    path: path.resolve(__dirname, '../../dist/apps/api'),
    filename: 'main.js',
    libraryTarget: 'commonjs2',
    clean: true,
  },

  resolve: {
    extensions: ['.ts', '.js'],
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: path.resolve(__dirname, 'tsconfig.app.json'),
          },
        },
        exclude: /node_modules/,
      },
    ],
  },

  externals: {
    // keep native deps as runtime requires (prevents bundling issues)
    bcrypt: 'commonjs bcrypt',
  },
};
