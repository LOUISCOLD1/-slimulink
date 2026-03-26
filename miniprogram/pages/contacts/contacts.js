const api = require('../../utils/api')

Page({
  data: {
    contacts: [],
    loading: true,
  },

  onLoad() {
    this.loadContacts()
  },

  async loadContacts() {
    this.setData({ loading: true })
    try {
      const contacts = await api.getContacts()
      this.setData({ contacts })
    } catch (err) {
      console.error('加载联系电话失败:', err)
      // 加载失败时用本地默认数据
      this.setData({
        contacts: [
          { name: '政务服务热线', name_mn: 'ᠵᠠᠰᠠᠭ ᠤᠨ ᠦᠢᠯᠡᠴᠢᠯᠡᠭᠡ', phone: '12345', description: '综合政务咨询' },
          { name: '医保服务热线', name_mn: 'ᠡᠮᠨᠡᠯᠭᠡ ᠶᠢᠨ ᠳᠠᠭᠠᠳᠬᠠᠯ', phone: '12393', description: '医疗保险咨询' },
        ],
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 拨打电话
  makeCall(e) {
    const phone = e.currentTarget.dataset.phone
    wx.makePhoneCall({
      phoneNumber: phone,
    })
  },
})
