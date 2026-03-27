App({
  globalData: {
    // 部署后改成你的服务器地址
    baseUrl: 'http://your-server-ip:80',
    lang: 'zh',        // 当前语言: zh=汉语, mn=蒙语
    engine: 'zhipu',   // AI引擎: zhipu / deepseek
  },

  onLaunch() {
    // 读取本地存储的用户设置
    const lang = wx.getStorageSync('lang')
    if (lang) {
      this.globalData.lang = lang
    }
    const baseUrl = wx.getStorageSync('baseUrl')
    if (baseUrl) {
      this.globalData.baseUrl = baseUrl
    }
    const engine = wx.getStorageSync('engine')
    if (engine) {
      this.globalData.engine = engine
    }
  }
})
