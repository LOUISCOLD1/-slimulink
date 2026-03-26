const app = getApp()

Page({
  data: {
    lang: 'zh',
    engine: 'zhipu',
    baseUrl: '',
  },

  onLoad() {
    this.setData({
      lang: app.globalData.lang,
      engine: app.globalData.engine,
      baseUrl: app.globalData.baseUrl,
    })
  },

  setLang(e) {
    const lang = e.currentTarget.dataset.lang
    this.setData({ lang })
    app.globalData.lang = lang
    wx.setStorageSync('lang', lang)
    wx.showToast({ title: lang === 'zh' ? '已切换中文' : 'ᠮᠣᠩᠭᠣᠯ ᠬᠡᠯᠡ', icon: 'none' })
  },

  setEngine(e) {
    const engine = e.currentTarget.dataset.engine
    this.setData({ engine })
    app.globalData.engine = engine
    wx.setStorageSync('engine', engine)
    wx.showToast({ title: '已切换AI引擎', icon: 'none' })
  },

  onUrlInput(e) {
    this.setData({ baseUrl: e.detail.value })
  },

  saveUrl() {
    const url = this.data.baseUrl.trim()
    if (url) {
      app.globalData.baseUrl = url
      wx.setStorageSync('baseUrl', url)
      wx.showToast({ title: '已保存', icon: 'success' })
    }
  },
})
