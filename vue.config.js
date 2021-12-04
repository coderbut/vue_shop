// vue.config.js
module.exports = {
  devServer: {
    overlay: {
      warnings: false, // 不显示警告
      // eslint-disable-next-line no-tabs
      errors: false // 不显示错误
    }
  },
  lintOnSave: false // 关闭eslint检查
};
