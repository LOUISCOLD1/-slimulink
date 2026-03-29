App({
  globalData: {
    baseUrl: 'http://your-server-ip:80',
    lang: 'zh',
    engine: 'zhipu',
    fontSize: 'large',
    speechRate: '+0%',
  },

  onLaunch() {
    const lang = wx.getStorageSync('lang')
    if (lang) this.globalData.lang = lang
    const baseUrl = wx.getStorageSync('baseUrl')
    if (baseUrl) this.globalData.baseUrl = baseUrl
    const engine = wx.getStorageSync('engine')
    if (engine) this.globalData.engine = engine
    const fontSize = wx.getStorageSync('fontSize')
    if (fontSize) this.globalData.fontSize = fontSize
    const speechRate = wx.getStorageSync('speechRate')
    if (speechRate) this.globalData.speechRate = speechRate
  }
})
