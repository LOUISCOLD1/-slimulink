const chatStore = require('../../utils/chat-store')
const app = getApp()

Page({
  data: {
    lang: 'zh',
    chats: [],
    filteredChats: [],
    searchText: '',
    activeTab: 'all',
    statusBarHeight: 20,
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: sysInfo.statusBarHeight || 20 })
  },

  onShow() {
    this.setData({ lang: app.globalData.lang })
    this.loadChats()
  },

  loadChats() {
    const allChats = chatStore.getAllChats()
    const chats = allChats.map((chat, idx) => {
      const lastMsg = chat.messages.length > 0
        ? chat.messages[chat.messages.length - 1].content
        : ''
      // 模拟状态：交替展示不同状态
      let statusText = '已读'
      let statusClass = 'badge-read'
      if (idx === 0) { statusText = '新回复'; statusClass = 'badge-new' }
      else if (idx % 3 === 0) { statusText = '已解决'; statusClass = 'badge-resolved' }

      return {
        id: chat.id,
        title: chat.title,
        lastMessage: lastMsg.length > 30 ? lastMsg.substring(0, 30) + '...' : lastMsg,
        timeLabel: this.formatTime(chat.updatedAt),
        msgCount: chat.messages.length,
        isAI: true,
        initial: 'U',
        statusText,
        statusClass,
        responder: 'AI政策顾问',
      }
    })
    this.setData({ chats, filteredChats: chats })
    this.applyFilter()
  },

  formatTime(timestamp) {
    const date = new Date(timestamp)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 86400000)

    if (timestamp >= today.getTime()) {
      return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    } else if (timestamp >= yesterday.getTime()) {
      return this.data.lang === 'zh' ? '昨天' : 'ᠥᠴᠦᠭᠡᠳᠦᠷ'
    } else {
      return `${date.getMonth() + 1}月${date.getDate()}日`
    }
  },

  onTabTap(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
    this.applyFilter()
  },

  onSearchInput(e) {
    this.setData({ searchText: e.detail.value })
    this.applyFilter()
  },

  applyFilter() {
    let list = this.data.chats
    const tab = this.data.activeTab
    const search = this.data.searchText.trim().toLowerCase()

    if (tab === 'unread') {
      list = list.filter(c => c.statusClass === 'badge-new')
    } else if (tab === 'resolved') {
      list = list.filter(c => c.statusClass === 'badge-resolved')
    }

    if (search) {
      list = list.filter(c =>
        c.title.toLowerCase().includes(search) ||
        c.lastMessage.toLowerCase().includes(search)
      )
    }

    this.setData({ filteredChats: list })
  },

  onChatTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/chat/chat?chatId=${id}` })
  },

  onNewChat() {
    wx.switchTab({ url: '/pages/index/index' })
  },

  onDeleteChat(e) {
    const id = e.currentTarget.dataset.id
    const lang = this.data.lang
    wx.showModal({
      title: lang === 'zh' ? '删除对话' : 'ᠤᠰᠲᠠᠭᠠᠬᠤ',
      content: lang === 'zh' ? '确定要删除这个对话吗？' : 'ᠡᠨᠡ ᠶᠠᠷᠢᠯᠴᠠᠯᠭ᠎ᠠ ᠶᠢ ᠤᠰᠲᠠᠭᠠᠬᠤ ᠤᠤ?',
      success: (res) => {
        if (res.confirm) {
          chatStore.deleteChat(id)
          this.loadChats()
        }
      },
    })
  },
})
