const api = require('../../utils/api')
const { t } = require('../../utils/i18n')
const app = getApp()

Page({
  data: {
    lang: 'zh',
    loading: true,
    contacts: [],
    favoriteList: [],
    groups: [],
    favorites: [],
  },

  onLoad() {
    this.setData({ lang: app.globalData.lang })
    this.loadContacts()
  },

  onShow() {
    this.setData({ lang: app.globalData.lang })
  },

  async loadContacts() {
    this.setData({ loading: true })
    try {
      const contacts = await api.getContacts()
      wx.setStorageSync('cachedContacts', contacts)
      this.setData({ contacts })
      this.organizeContacts()
    } catch (err) {
      const cached = wx.getStorageSync('cachedContacts')
      if (cached) {
        this.setData({ contacts: cached })
        this.organizeContacts()
      }
    } finally {
      this.setData({ loading: false })
    }
  },

  organizeContacts() {
    const favorites = wx.getStorageSync('favoriteContacts') || []
    this.setData({ favorites })

    const contacts = this.data.contacts.map(c => ({
      ...c,
      isFav: favorites.includes(c.phone),
    }))

    const favoriteList = contacts.filter(c => c.isFav)

    // 按 category 分组
    const groupMap = {}
    contacts.forEach(c => {
      const cat = c.category || '其他'
      if (!groupMap[cat]) groupMap[cat] = []
      groupMap[cat].push(c)
    })
    const groups = Object.keys(groupMap).map(category => ({
      category,
      contacts: groupMap[category],
    }))

    this.setData({ favoriteList, groups })
  },

  toggleFavorite(e) {
    const phone = e.currentTarget.dataset.phone
    let favorites = this.data.favorites
    if (favorites.includes(phone)) {
      favorites = favorites.filter(f => f !== phone)
    } else {
      favorites.push(phone)
    }
    wx.setStorageSync('favoriteContacts', favorites)
    this.setData({ favorites })
    this.organizeContacts()
  },

  makeCall(e) {
    const phone = e.currentTarget.dataset.phone
    if (!phone) return
    wx.makePhoneCall({ phoneNumber: phone, fail() {} })
  },
})
