const { t } = require('../../utils/i18n')

const app = getApp()

Page({
  data: {
    lang: 'zh',
    policy: {},
  },

  onLoad(options) {
    this.setData({ lang: app.globalData.lang })

    // 优先从 Storage 读取（推荐方式）
    const storageData = wx.getStorageSync('policyDetail')
    if (storageData) {
      this.setData({ policy: storageData })
      // 根据语言选择标题
      const title = this.data.lang === 'mn'
        ? (storageData.title_mn || storageData.title_zh || t('policyDetail'))
        : (storageData.title_zh || t('policyDetail'))
      wx.setNavigationBarTitle({ title })
      wx.removeStorageSync('policyDetail')
      return
    }

    // 兼容旧的URL参数方式
    if (options.data) {
      try {
        const policy = JSON.parse(decodeURIComponent(options.data))
        this.setData({ policy })
        wx.setNavigationBarTitle({ title: policy.title_zh || t('policyDetail') })
      } catch (e) {
        console.error('解析政策数据失败:', e)
      }
    }
  },

  // 一键拨号
  makeCall() {
    const phone = this.data.policy.phone
    if (phone) {
      wx.makePhoneCall({
        phoneNumber: phone,
        fail() {
          // 用户取消拨号，不用处理
        },
      })
    }
  },

  // 关于这个政策继续问AI — 预填问题到首页（根据当前语言生成问题）
  askAboutPolicy() {
    const policy = this.data.policy
    const lang = this.data.lang
    if (lang === 'mn' && policy.title_mn) {
      wx.setStorageSync('prefillQuestion', policy.title_mn + t('askPolicyQuestion'))
    } else if (policy.title_zh) {
      wx.setStorageSync('prefillQuestion', policy.title_zh + t('askPolicyQuestion'))
    }
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
})
