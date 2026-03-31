const chatStore = require('../../utils/chat-store')
const { t } = require('../../utils/i18n')
const app = getApp()

Page({
  data: {
    lang: 'zh',
    engine: 'zhipu',
    fontSize: 'large',
    speechRate: '+0%',
    statusBarHeight: 20,
    fontSizeOn: true,
    highContrast: false,
    familyNotify: false,
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync()
    this.setData({
      statusBarHeight: sysInfo.statusBarHeight || 20,
      lang: app.globalData.lang,
      engine: app.globalData.engine,
      fontSize: app.globalData.fontSize,
      speechRate: app.globalData.speechRate,
    })
  },

  goBack() {
    wx.navigateBack({ fail() {} })
  },

  onFontSizeToggle(e) {
    this.setData({ fontSizeOn: e.detail.value })
  },

  onHighContrastToggle(e) {
    this.setData({ highContrast: e.detail.value })
  },

  onFamilyNotifyToggle(e) {
    this.setData({ familyNotify: e.detail.value })
  },

  setLang(e) {
    const lang = e.currentTarget.dataset.lang
    this.setData({ lang })
    app.globalData.lang = lang
    wx.setStorageSync('lang', lang)
  },

  setEngine(e) {
    const engine = e.currentTarget.dataset.engine
    this.setData({ engine })
    app.globalData.engine = engine
    wx.setStorageSync('engine', engine)
  },

  setFontSize(e) {
    const fontSize = e.currentTarget.dataset.size
    this.setData({ fontSize })
    app.globalData.fontSize = fontSize
    wx.setStorageSync('fontSize', fontSize)
  },

  setSpeechRate(e) {
    const speechRate = e.currentTarget.dataset.rate
    this.setData({ speechRate })
    app.globalData.speechRate = speechRate
    wx.setStorageSync('speechRate', speechRate)
  },

  onHelpTap() {
    wx.showToast({ title: '帮助与支持', icon: 'none' })
  },

  onFeedbackTap() {
    wx.showToast({ title: '意见反馈', icon: 'none' })
  },

  clearHistory() {
    wx.showModal({
      title: t('clearHistory'),
      content: t('clearHistoryConfirm'),
      success: (res) => {
        if (res.confirm) {
          chatStore.clearAllChats()
          wx.showToast({ title: t('clearDone'), icon: 'success' })
        }
      },
    })
  },
})
