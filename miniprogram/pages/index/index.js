const api = require('../../utils/api')
const recorder = require('../../utils/recorder')

const app = getApp()

Page({
  data: {
    lang: 'zh',
    isRecording: false,
    isLoading: false,
    inputText: '',
    reminder: '草原生态补贴3月底截止申报，别忘了！',

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
  },

  // 切换语言
  switchLang(e) {
    const lang = e.currentTarget.dataset.lang
    this.setData({ lang })
    app.globalData.lang = lang
    wx.setStorageSync('lang', lang)
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
      wx.showLoading({ title: '识别中...' })

      const text = await recorder.uploadAndRecognize(filePath)
      wx.hideLoading()

      if (text) {
        // 识别成功，去问AI
        this.askQuestion(text)
      } else {
        wx.showToast({ title: '没听清，再说一次', icon: 'none' })
        this.setData({ isLoading: false })
      }
    } catch (err) {
      console.error('录音处理失败:', err)
      wx.hideLoading()
      wx.showToast({ title: '录音失败，请重试', icon: 'none' })
      this.setData({ isLoading: false })
    }
  },

  // 核心：向AI提问
  async askQuestion(question) {
    this.setData({ isLoading: true, inputText: '' })

    try {
      const result = await api.askPolicy(question)

      // 跳转到回答页面展示结果
      const answerData = encodeURIComponent(JSON.stringify({
        question,
        answer: result.answer,
        sources: result.sources,
      }))
      wx.navigateTo({
        url: `/pages/answer/answer?data=${answerData}`,
      })
    } catch (err) {
      console.error('问答失败:', err)
      wx.showToast({ title: '查询失败，请检查网络', icon: 'none' })
    } finally {
      this.setData({ isLoading: false })
    }
  },

  // 点击提醒
  onReminderTap() {
    this.askQuestion('草原生态补贴怎么申报？')
  },
})
