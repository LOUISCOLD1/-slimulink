const api = require('../../utils/api')

Page({
  data: {
    policies: [],
    filteredPolicies: [],
    categories: ['补贴', '低保', '医保', '教育', '住房', '创业'],
    activeCategory: '',
    searchText: '',
    loading: true,
  },

  onLoad() {
    this.loadPolicies()
  },

  onPullDownRefresh() {
    this.loadPolicies().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  async loadPolicies() {
    this.setData({ loading: true })
    try {
      const policies = await api.getPolicies()
      this.setData({
        policies,
        filteredPolicies: policies,
      })
    } catch (err) {
      console.error('加载政策失败:', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 分类筛选
  onCategoryTap(e) {
    const category = e.currentTarget.dataset.category
    this.setData({ activeCategory: category })
    this.filterPolicies()
  },

  // 搜索
  onSearchInput(e) {
    this.setData({ searchText: e.detail.value })
    this.filterPolicies()
  },

  // 过滤政策列表
  filterPolicies() {
    const { policies, activeCategory, searchText } = this.data
    let filtered = policies

    if (activeCategory) {
      filtered = filtered.filter(p => p.category === activeCategory)
    }

    if (searchText) {
      const keyword = searchText.toLowerCase()
      filtered = filtered.filter(p =>
        (p.title_zh && p.title_zh.toLowerCase().includes(keyword)) ||
        (p.summary && p.summary.toLowerCase().includes(keyword)) ||
        (p.money && p.money.includes(keyword))
      )
    }

    this.setData({ filteredPolicies: filtered })
  },

  // 点击政策卡片
  onPolicyTap(e) {
    const id = e.currentTarget.dataset.id
    const policy = this.data.policies.find(p => p.id === id)
    if (policy) {
      wx.setStorageSync('policyDetail', policy)
      wx.navigateTo({
        url: '/pages/policy-detail/policy-detail',
      })
    }
  },
})
