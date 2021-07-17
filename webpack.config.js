const path = require("path");
const ESLintPlugin = require("eslint-webpack-plugin");
const Dotenv = require("dotenv-webpack");

module.exports = {
  mode: "development",
  entry: "./src/index.ts",
  output: {
    filename: "bundle.js",
    path: path.join(__dirname, "dist"),
    publicPath: "/dist/",
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        exclude: /node_modules/,
        use: "ts-loader",
      },
    ],
  },
  plugins: [new ESLintPlugin(), new Dotenv()],
  resolve: {
    extensions: [".ts", ".js"],
  },
  devtool: "inline-source-map",
};
