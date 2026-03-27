const { t } = require('../../utils/i18n')

const app = getApp()

Page({
  data: {
    lang: 'zh',
    engine: 'zhipu',
  },

  onLoad() {
    this.setData({
      lang: app.globalData.lang,
      engine: app.globalData.engine,
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
    wx.showToast({ title: t('engineSwitched'), icon: 'none' })
  },
})
