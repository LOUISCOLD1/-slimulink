const chatStore = require('../../utils/chat-store')
const api = require('../../utils/api')
const { t } = require('../../utils/i18n')
const app = getApp()

Page({
  data: { lang: 'zh', policy: {} },

  onLoad() {
    this.setData({ lang: app.globalData.lang })
    const policy = wx.getStorageSync('policyDetail')
    if (policy) {
      this.setData({ policy })
      const title = this.data.lang === 'mn'
        ? (policy.title_mn || policy.title_zh)
        : policy.title_zh
      wx.setNavigationBarTitle({ title: title || t('policyDetail') })
      wx.removeStorageSync('policyDetail')
    }
  },

  makeCall() {
    const phone = this.data.policy.phone
    if (phone) {
      wx.makePhoneCall({ phoneNumber: phone, fail() {} })
    }
  },

  askAboutPolicy() {
    const policy = this.data.policy
    const lang = this.data.lang
    const title = (lang === 'mn' && policy.title_mn) ? policy.title_mn : policy.title_zh
    const question = title + (lang === 'mn' ? ' ᠲᠥᠷᠥ ᠵᠢᠷᠤᠮ ᠶᠠᠭᠤ ᠪᠤᠢ?' : '的具体政策是什么？')

    // 创建新对话并跳转
    const chatId = chatStore.createChat(question)
    chatStore.addMessage(chatId, { role: 'user', content: question })

    // 异步调用AI，先跳转
    wx.navigateTo({ url: `/pages/chat/chat?chatId=${chatId}&prefill=${encodeURIComponent(question)}` })
  },
})
