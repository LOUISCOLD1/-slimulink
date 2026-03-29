const api = require('../../utils/api')
const recorder = require('../../utils/recorder')
const chatStore = require('../../utils/chat-store')
const { t } = require('../../utils/i18n')

const app = getApp()

Page({
  data: {
    lang: 'zh',
    chatId: '',
    messages: [],
    inputText: '',
    isThinking: false,
    isRecording: false,
    playingIndex: -1,
    scrollToId: '',
  },

  _audioContext: null,

  onLoad(options) {
    const chatId = options.chatId
    if (!chatId) {
      wx.navigateBack()
      return
    }

    this.setData({ lang: app.globalData.lang, chatId })

    const chat = chatStore.getChat(chatId)
    if (chat) {
      wx.setNavigationBarTitle({ title: chat.title })
      this.setData({ messages: chat.messages })
      this.scrollToBottom()
    }
  },

  onUnload() {
    if (this._audioContext) {
      this._audioContext.destroy()
      this._audioContext = null
    }
  },

  onInput(e) {
    this.setData({ inputText: e.detail.value })
  },

  onSend() {
    const text = this.data.inputText.trim()
    if (!text || this.data.isThinking) return
    this.setData({ inputText: '' })
    this.sendMessage(text)
  },

  async onMicTap() {
    if (this.data.isThinking) return

    const result = await recorder.toggleRecord()

    if (result === null) {
      this.setData({ isRecording: recorder.isRecording() })
      if (recorder.isRecording()) {
        wx.vibrateShort({ type: 'medium' })
      }
      return
    }

    this.setData({ isRecording: false })

    try {
      wx.showLoading({ title: t('recognizing') })
      const sttResult = await recorder.uploadAndRecognize(result)
      wx.hideLoading()

      if (sttResult.text) {
        this.sendMessage(sttResult.text)
      } else {
        wx.showToast({ title: sttResult.error || t('notHeard'), icon: 'none' })
      }
    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: t('recordFail'), icon: 'none' })
    }
  },

  async sendMessage(text) {
    // 添加用户消息到UI和存储
    const messages = this.data.messages
    messages.push({ role: 'user', content: text })
    chatStore.addMessage(this.data.chatId, { role: 'user', content: text })
    this.setData({ messages, isThinking: true })
    this.scrollToBottom()

    try {
      const result = await api.askPolicy(text)
      const botMsg = {
        role: 'bot',
        content: result.answer,
        sources: result.sources || [],
      }

      messages.push(botMsg)
      chatStore.addMessage(this.data.chatId, botMsg)
      this.setData({ messages, isThinking: false })
      this.scrollToBottom()
    } catch (err) {
      this.setData({ isThinking: false })
      wx.showToast({ title: t('queryFail'), icon: 'none' })
    }
  },

  async playVoice(e) {
    const index = e.currentTarget.dataset.index
    const text = e.currentTarget.dataset.text

    // 如果正在播放同一条，停止
    if (this.data.playingIndex === index) {
      if (this._audioContext) {
        this._audioContext.stop()
        this._audioContext.destroy()
        this._audioContext = null
      }
      this.setData({ playingIndex: -1 })
      return
    }

    try {
      wx.showLoading({ title: t('generating') })
      const audioPath = await api.getTTSAudio(text)
      wx.hideLoading()

      if (this._audioContext) {
        this._audioContext.destroy()
      }
      this._audioContext = wx.createInnerAudioContext()
      this._audioContext.src = audioPath

      this._audioContext.onPlay(() => {
        this.setData({ playingIndex: index })
      })
      this._audioContext.onEnded(() => {
        this.setData({ playingIndex: -1 })
      })
      this._audioContext.onError(() => {
        this.setData({ playingIndex: -1 })
        wx.showToast({ title: t('playFail'), icon: 'none' })
      })
      this._audioContext.play()
    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: t('ttsFail'), icon: 'none' })
    }
  },

  scrollToBottom() {
    const len = this.data.messages.length
    const id = this.data.isThinking ? 'msg-thinking' : `msg-${len - 1}`
    setTimeout(() => {
      this.setData({ scrollToId: id })
    }, 100)
  },
})
