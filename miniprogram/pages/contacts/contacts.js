const api = require('../../utils/api')
const { t } = require('../../utils/i18n')

const app = getApp()

const DEFAULT_CONTACTS = [
  { name: '政务服务热线', name_mn: 'ᠵᠠᠰᠠᠭ ᠤᠨ ᠦᠢᠯᠡᠴᠢᠯᠡᠭᠡ', phone: '12345', description: '综合政务咨询' },
  { name: '医保服务热线', name_mn: 'ᠡᠮᠨᠡᠯᠭᠡ ᠶᠢᠨ ᠳᠠᠭᠠᠳᠬᠠᠯ', phone: '12393', description: '医疗保险咨询' },
]

Page({
  data: {
    lang: 'zh',
    contacts: [],
    loading: true,
  },

  onLoad() {
    this.setData({ lang: app.globalData.lang })
    this.loadContacts()
  },

  async loadContacts() {
    this.setData({ loading: true })
    try {
      const contacts = await api.getContacts()
      // 缓存到本地，离线时可用
      wx.setStorageSync('cachedContacts', contacts)
      this.setData({ contacts })
    } catch (err) {
      console.error('加载联系电话失败:', err)
      // 尝试使用离线缓存
      const cached = wx.getStorageSync('cachedContacts')
      if (cached && cached.length > 0) {
        this.setData({ contacts: cached })
      } else {
        this.setData({ contacts: DEFAULT_CONTACTS })
      }
    } finally {
      this.setData({ loading: false })
    }
  },

  onShow() {
    this.setData({ lang: app.globalData.lang })
  },

  // 拨打电话
  makeCall(e) {
    const phone = e.currentTarget.dataset.phone
    if (!phone) return
    wx.makePhoneCall({
      phoneNumber: phone,
      fail() {
        // 用户取消拨号，不用处理
      },
    })
  },
})
