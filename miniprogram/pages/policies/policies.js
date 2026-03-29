const api = require('../../utils/api')
const { t } = require('../../utils/i18n')
const app = getApp()

Page({
  data: {
    lang: 'zh',
    policies: [],
    filteredPolicies: [],
    hotPolicies: [],
    categories: [
      { key: '补贴', icon: '💰', zh: '补贴', mn: 'ᠨᠥᠬᠥᠪᠥᠷᠢ', colorClass: 'cat-gold' },
      { key: '医保', icon: '🏥', zh: '医保', mn: 'ᠡᠮᠨᠡᠯᠭᠡ', colorClass: 'cat-blue' },
      { key: '教育', icon: '📚', zh: '教育', mn: 'ᠰᠤᠷᠭᠠᠨ', colorClass: 'cat-purple' },
      { key: '草原', icon: '🌿', zh: '草原', mn: 'ᠨᠤᠲᠤᠭ', colorClass: 'cat-green' },
      { key: '养老', icon: '👴', zh: '养老', mn: 'ᠥᠲᠡᠯᠦᠭᠡ', colorClass: 'cat-pink' },
      { key: '住房', icon: '🏠', zh: '住房', mn: 'ᠣᠷᠣᠨ', colorClass: 'cat-sky' },
      { key: '创业', icon: '💼', zh: '创业', mn: 'ᠦᠢᠯᠡᠰ', colorClass: 'cat-rose' },
      { key: '', icon: '📋', zh: '更多', mn: 'ᠪᠦᠭᠦᠳᠡ', colorClass: 'cat-gray' },
    ],
    activeCategory: '',
    searchText: '',
    loading: true,
  },

  onLoad() {
    this.setData({ lang: app.globalData.lang })
    this.loadPolicies()
  },

  onShow() { this.setData({ lang: app.globalData.lang }) },

  onPullDownRefresh() {
    this.loadPolicies().then(() => wx.stopPullDownRefresh())
  },

  async loadPolicies() {
    this.setData({ loading: true })
    try {
      const policies = await api.getPolicies()
      wx.setStorageSync('cachedPolicies', policies)
      const hotPolicies = policies.slice(0, 3)
      this.setData({ policies, hotPolicies, filteredPolicies: policies })
    } catch (err) {
      const cached = wx.getStorageSync('cachedPolicies')
      if (cached && cached.length > 0) {
        this.setData({ policies: cached, hotPolicies: cached.slice(0, 3), filteredPolicies: cached })
      } else {
        wx.showToast({ title: t('loadFail'), icon: 'none' })
      }
    } finally {
      this.setData({ loading: false })
    }
  },

  onCategoryTap(e) {
    const category = e.currentTarget.dataset.category
    if (!category) {
      this.setData({ activeCategory: '', filteredPolicies: this.data.policies })
      return
    }
    const filtered = this.data.policies.filter(p => p.category === category)
    this.setData({ activeCategory: category, filteredPolicies: filtered, searchText: '' })
  },

  onSearchInput(e) {
    const searchText = e.detail.value
    this.setData({ searchText, activeCategory: '' })
    this.filterPolicies()
  },

  filterPolicies() {
    const keyword = this.data.searchText.toLowerCase()
    if (!keyword) {
      this.setData({ filteredPolicies: this.data.policies })
      return
    }
    const filtered = this.data.policies.filter(p =>
      (p.title_zh && p.title_zh.toLowerCase().includes(keyword)) ||
      (p.title_mn && p.title_mn.toLowerCase().includes(keyword)) ||
      (p.summary && p.summary.toLowerCase().includes(keyword)) ||
      (p.money && p.money.includes(keyword))
    )
    this.setData({ filteredPolicies: filtered })
  },

  clearFilter() {
    this.setData({ activeCategory: '', searchText: '', filteredPolicies: this.data.policies })
  },

  onPolicyTap(e) {
    const id = e.currentTarget.dataset.id
    const policy = this.data.policies.find(p => p.id === id)
    if (policy) {
      wx.setStorageSync('policyDetail', policy)
      wx.navigateTo({ url: '/pages/policy-detail/policy-detail' })
    }
  },
})
