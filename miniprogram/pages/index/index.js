const api = require('../../utils/api')
const recorder = require('../../utils/recorder')
const chatStore = require('../../utils/chat-store')
const { t } = require('../../utils/i18n')

const app = getApp()

Page({
  data: {
    lang: 'zh',
    isRecording: false,
    isLoading: false,
    inputText: '',
    reminder: '',
    reminderQuestion: '',
    chatCount: 0,
    statusBarHeight: 20,

    hotQuestions: [
      { icon: '💰', zh: '低保每个月多少钱？怎么申请？', mn: 'ᠠᠮᠢᠳᠤᠷᠠᠯ ᠤᠨ ᠪᠠᠲᠤᠯᠠᠭᠠᠵᠢ ᠬᠡᠳᠦᠢ ᠪᠤᠢ?' },
      { icon: '🏥', zh: '医保怎么报销？比例是多少？', mn: 'ᠡᠮᠨᠡᠯᠭᠡ ᠶᠢᠨ ᠳᠠᠭᠠᠳᠬᠠᠯ ᠬᠡᠷᠬᠢᠨ ᠨᠥᠬᠥᠨ ᠣᠯᠭᠣᠬᠤ ᠪᠤᠢ?' },
      { icon: '🌿', zh: '草原补贴怎么领？要什么材料？', mn: 'ᠨᠤᠲᠤᠭ ᠤᠨ ᠨᠥᠬᠥᠪᠥᠷᠢ ᠬᠡᠷᠬᠢᠨ ᠠᠪᠬᠤ ᠪᠤᠢ?' },
      { icon: '📚', zh: '孩子上学有什么补助？', mn: 'ᠬᠡᠦᠬᠡᠳ ᠰᠤᠷᠭᠠᠭᠤᠯᠢ ᠳᠤ ᠲᠤᠰᠠᠯᠠᠮᠵᠢ ᠪᠠᠢᠨ᠎ᠠ ᠤᠤ?' },
      { icon: '👴', zh: '养老保险怎么交？', mn: 'ᠥᠲᠡᠯᠦᠭᠡ ᠶᠢᠨ ᠳᠠᠭᠠᠳᠬᠠᠯ ᠬᠡᠷᠬᠢᠨ ᠲᠥᠯᠥᠬᠦ ᠪᠤᠢ?' },
      { icon: '🏠', zh: '危房改造有补贴吗？', mn: 'ᠠᠶᠤᠤᠯᠲᠠᠢ ᠭᠡᠷ ᠵᠠᠰᠠᠬᠤ ᠳᠤ ᠨᠥᠬᠥᠪᠥᠷᠢ ᠪᠠᠢᠨ᠎ᠠ ᠤᠤ?' },
    ],
  },

  onLoad() {
    this.setData({ lang: app.globalData.lang })
    this.loadConfig()
    // 获取状态栏高度，用于自定义导航栏
    const sysInfo = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: sysInfo.statusBarHeight || 20 })
  },

  onShow() {
    this.setData({
      lang: app.globalData.lang,
      chatCount: chatStore.getChatCount(),
    })
    // 检查预填问题（从政策详情页跳转来的）
    const prefillQuestion = wx.getStorageSync('prefillQuestion')
    if (prefillQuestion) {
      wx.removeStorageSync('prefillQuestion')
      this.setData({ inputText: prefillQuestion })
    }
  },

  async loadConfig() {
    try {
      const config = await api.getConfig()
      wx.setStorageSync('appConfig', config)
      this.applyConfig(config)
    } catch (err) {
      const cached = wx.getStorageSync('appConfig')
      if (cached) this.applyConfig(cached)
    }
  },

  applyConfig(config) {
    const lang = this.data.lang
    if (config.reminder) {
      this.setData({
        reminder: lang === 'mn' ? config.reminder.mn : config.reminder.zh,
        reminderQuestion: lang === 'mn' ? config.reminder.question_mn : config.reminder.question_zh,
      })
    }
  },

  onInput(e) {
    this.setData({ inputText: e.detail.value })
  },

  onTextSubmit() {
    if (this.data.isLoading) return
    const question = this.data.inputText.trim()
    if (!question) return
    this.askQuestion(question)
  },

  onHotQuestion(e) {
    if (this.data.isLoading) return
    const question = e.currentTarget.dataset.question
    this.askQuestion(question)
  },

  async onMicTap() {
    if (this.data.isLoading) return

    const result = await recorder.toggleRecord()

    if (result === null) {
      this.setData({ isRecording: recorder.isRecording() })
      if (recorder.isRecording()) {
        wx.vibrateShort({ type: 'medium' })
      }
      return
    }

    this.setData({ isRecording: false, isLoading: true })

    try {
      wx.showLoading({ title: t('recognizing') })
      const sttResult = await recorder.uploadAndRecognize(result)
      wx.hideLoading()

      if (sttResult.text) {
        this.askQuestion(sttResult.text)
      } else {
        wx.showToast({ title: sttResult.error || t('notHeard'), icon: 'none' })
        this.setData({ isLoading: false })
      }
    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: t('recordFail'), icon: 'none' })
      this.setData({ isLoading: false })
    }
  },

  async askQuestion(question) {
    this.setData({ isLoading: true, inputText: '' })

    try {
      const chatId = chatStore.createChat(question)
      chatStore.addMessage(chatId, { role: 'user', content: question })
      const result = await api.askPolicy(question)
      chatStore.addMessage(chatId, {
        role: 'bot',
        content: result.answer,
        sources: result.sources || [],
      })
      wx.navigateTo({
        url: `/pages/chat/chat?chatId=${chatId}`,
      })
    } catch (err) {
      console.error('问答失败:', err)
      wx.showToast({ title: t('queryFail'), icon: 'none' })
    } finally {
      this.setData({ isLoading: false })
    }
  },

  goToChatList() {
    wx.switchTab({ url: '/pages/chat-list/chat-list' })
  },

  goToPolicies() {
    wx.navigateTo({ url: '/pages/policies/policies' })
  },

  goToChat() {
    // 创建新空对话或直接进入 AI 聊天
    const chatId = chatStore.createChat('新对话')
    wx.navigateTo({ url: `/pages/chat/chat?chatId=${chatId}` })
  },

  makeCall(e) {
    const phone = e.currentTarget.dataset.phone || '12345'
    wx.makePhoneCall({ phoneNumber: phone, fail() {} })
  },

  onReminderTap() {
    if (this.data.isLoading) return
    const question = this.data.reminderQuestion || '草原生态补贴怎么申报？'
    this.askQuestion(question)
  },
})
