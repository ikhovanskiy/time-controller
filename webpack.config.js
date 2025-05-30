const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    main: "./src/index.tsx",
    content: "./src/content.ts",
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: {
          loader: "ts-loader",
          options: {
            compilerOptions: {
              noEmit: false,
            },
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.module\.css$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: true,
            },
          },
        ],
      },
      {
        test: /\.css$/,
        exclude: /\.module\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|ico)$/i,
        type: "asset/resource",
        generator: {
          filename: "images/[name][ext]",
        },
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx"],
  },
  output: {
    filename: (pathData) => {
      return pathData.chunk.name === "content" ||
        pathData.chunk.name === "background"
        ? "[name].js"
        : "[name].[contenthash].js";
    },
    path: path.resolve(__dirname, "build"),
    clean: true,
    publicPath: "./",
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      filename: "index.html",
      chunks: ["main"],
      inject: "body",
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "public",
          to: ".",
          globOptions: {
            ignore: ["**/index.html"],
          },
        },
      ],
    }),
  ],
  mode: "production",
  target: "web",
  optimization: {
    minimize: true,
    usedExports: true,
    sideEffects: false,
    splitChunks: {
      chunks: (chunk) => {
        return chunk.name !== "content" && chunk.name !== "background";
      },
      minSize: 20000,
      maxSize: 200000,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      cacheGroups: {
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
          name: "react",
          chunks: (chunk) => {
            return chunk.name !== "content" && chunk.name !== "background";
          },
          priority: 20,
          enforce: true,
        },
        recharts: {
          test: /[\\/]node_modules[\\/]recharts[\\/]/,
          name: "recharts",
          chunks: (chunk) => {
            return chunk.name !== "content" && chunk.name !== "background";
          },
          priority: 15,
          enforce: true,
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: (chunk) => {
            return chunk.name !== "content" && chunk.name !== "background";
          },
          priority: 10,
        },
      },
    },
  },
};
