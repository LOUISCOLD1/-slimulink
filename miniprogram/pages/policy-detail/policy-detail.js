Page({
  data: {
    policy: {},
  },

  onLoad(options) {
    if (options.data) {
      try {
        const policy = JSON.parse(decodeURIComponent(options.data))
        this.setData({ policy })
        wx.setNavigationBarTitle({ title: policy.title_zh || '政策详情' })
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
      })
    }
  },

  // 关于这个政策继续问AI
  askAboutPolicy() {
    const title = this.data.policy.title_zh
    // 跳转到首页并预填问题
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
})
