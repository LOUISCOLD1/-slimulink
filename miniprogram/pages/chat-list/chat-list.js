const chatStore = require('../../utils/chat-store')
const app = getApp()

Page({
  data: {
    lang: 'zh',
    chats: [],
  },

  onShow() {
    this.setData({ lang: app.globalData.lang })
    this.loadChats()
  },

  loadChats() {
    const allChats = chatStore.getAllChats()
    const chats = allChats.map(chat => {
      const lastMsg = chat.messages.length > 0
        ? chat.messages[chat.messages.length - 1].content
        : ''
      return {
        id: chat.id,
        title: chat.title,
        lastMessage: lastMsg.length > 30 ? lastMsg.substring(0, 30) + '...' : lastMsg,
        timeLabel: this.formatTime(chat.updatedAt),
        msgCount: chat.messages.length,
      }
    })
    this.setData({ chats })
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
