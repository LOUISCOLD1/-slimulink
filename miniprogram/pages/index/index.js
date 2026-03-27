const api = require('../../utils/api')
const recorder = require('../../utils/recorder')
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
    hotlinePhone: '12345',

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

    // 检查是否有从政策详情页预填的问题
    const prefillQuestion = wx.getStorageSync('prefillQuestion')
    if (prefillQuestion) {
      wx.removeStorageSync('prefillQuestion')
      this.setData({ inputText: prefillQuestion })
    }
  },

  onShow() {
    // 每次显示页面时检查是否有预填问题
    const prefillQuestion = wx.getStorageSync('prefillQuestion')
    if (prefillQuestion) {
      wx.removeStorageSync('prefillQuestion')
      this.setData({ inputText: prefillQuestion })
    }
  },

  // 加载动态配置（提醒、热线）
  async loadConfig() {
    try {
      const config = await api.getConfig()
      // 缓存到本地
      wx.setStorageSync('appConfig', config)
      this.applyConfig(config)
    } catch (err) {
      // 网络失败时用本地缓存
      const cached = wx.getStorageSync('appConfig')
      if (cached) {
        this.applyConfig(cached)
      }
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
    if (config.hotline) {
      this.setData({ hotlinePhone: config.hotline.phone || '12345' })
    }
  },

  // 切换语言
  switchLang(e) {
    const lang = e.currentTarget.dataset.lang
    this.setData({ lang })
    app.globalData.lang = lang
    wx.setStorageSync('lang', lang)
    // 刷新提醒文案
    const config = wx.getStorageSync('appConfig')
    if (config) this.applyConfig(config)
  },

  // 文字输入
  onInput(e) {
    this.setData({ inputText: e.detail.value })
  },

  // 文字提交
  onTextSubmit() {
    const question = this.data.inputText.trim()
    if (!question) return
    this.askQuestion(question)
  },

  // 点击热门问题
  onHotQuestion(e) {
    const question = e.currentTarget.dataset.question
    this.askQuestion(question)
  },

  // 开始录音
  onRecordStart() {
    this.setData({ isRecording: true })
    recorder.startRecord()
    // 震动反馈
    wx.vibrateShort({ type: 'medium' })
  },

  // 停止录音
  async onRecordEnd() {
    if (!this.data.isRecording) return
    this.setData({ isRecording: false })

    try {
      // 停止录音，获取文件
      const filePath = await recorder.stopRecord()

      // 上传录音做语音识别
      this.setData({ isLoading: true })
      wx.showLoading({ title: t('recognizing') })

      const text = await recorder.uploadAndRecognize(filePath)
      wx.hideLoading()

      if (text) {
        // 识别成功，去问AI
        this.askQuestion(text)
      } else {
        wx.showToast({ title: t('notHeard'), icon: 'none' })
        this.setData({ isLoading: false })
      }
    } catch (err) {
      console.error('录音处理失败:', err)
      wx.hideLoading()
      wx.showToast({ title: t('recordFail'), icon: 'none' })
      this.setData({ isLoading: false })
    }
  },

  // 核心：向AI提问
  async askQuestion(question) {
    this.setData({ isLoading: true, inputText: '' })

    try {
      const result = await api.askPolicy(question)

      // 用 Storage 传递数据，避免URL参数过长被截断
      wx.setStorageSync('answerData', {
        question,
        answer: result.answer,
        sources: result.sources,
        hotlinePhone: this.data.hotlinePhone,
      })
      wx.navigateTo({
        url: '/pages/answer/answer',
      })
    } catch (err) {
      console.error('问答失败:', err)
      wx.showToast({ title: t('queryFail'), icon: 'none' })
    } finally {
      this.setData({ isLoading: false })
    }
  },

  // 点击提醒
  onReminderTap() {
    const question = this.data.reminderQuestion || '草原生态补贴怎么申报？'
    this.askQuestion(question)
  },
})
