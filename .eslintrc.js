module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ["plugin:vue/essential", "@vue/standard", "prettier"],
  plugins: ["prettier"],
  parserOptions: {
    parser: "babel-eslint",
  },
  rules: {
    "prettier/prettier": "error",
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    semi: true,
  },
};
