const api = require('../../utils/api')
const { t } = require('../../utils/i18n')

const app = getApp()

Page({
  data: {
    lang: 'zh',
    question: '',
    answer: '',
    sources: [],
    isPlaying: false,
    hotlinePhone: '12345',
  },

  // 音频播放器
  _audioContext: null,

  onLoad(options) {
    this.setData({ lang: app.globalData.lang })

    // 优先从 Storage 读取数据（推荐方式，不受URL长度限制）
    const storageData = wx.getStorageSync('answerData')
    if (storageData) {
      this.setData({
        question: storageData.question || '',
        answer: storageData.answer || '',
        sources: storageData.sources || [],
        hotlinePhone: storageData.hotlinePhone || '12345',
      })
      wx.removeStorageSync('answerData')
      return
    }

    // 兼容旧的URL参数方式
    if (options.data) {
      try {
        const data = JSON.parse(decodeURIComponent(options.data))
        this.setData({
          question: data.question || '',
          answer: data.answer || '',
          sources: data.sources || [],
        })
      } catch (e) {
        console.error('解析数据失败:', e)
      }
    }
  },

  onUnload() {
    // 页面关闭时停止播放
    if (this._audioContext) {
      this._audioContext.stop()
    }
  },

  // 播放AI回答的语音
  async playAnswer() {
    if (this.data.isPlaying) {
      // 正在播放就暂停
      if (this._audioContext) {
        this._audioContext.stop()
      }
      this.setData({ isPlaying: false })
      return
    }

    try {
      wx.showLoading({ title: t('generating') })

      // 调后端TTS接口获取语音
      const audioPath = await api.getTTSAudio(this.data.answer)

      wx.hideLoading()

      // 播放
      this._audioContext = wx.createInnerAudioContext()
      this._audioContext.src = audioPath
      this._audioContext.onPlay(() => {
        this.setData({ isPlaying: true })
      })
      this._audioContext.onEnded(() => {
        this.setData({ isPlaying: false })
      })
      this._audioContext.onError((err) => {
        console.error('播放失败:', err)
        this.setData({ isPlaying: false })
        wx.showToast({ title: t('playFail'), icon: 'none' })
      })
      this._audioContext.play()
    } catch (err) {
      wx.hideLoading()
      console.error('TTS失败:', err)
      wx.showToast({ title: t('ttsFail'), icon: 'none' })
    }
  },

  // 继续提问 - 返回首页
  askAgain() {
    wx.navigateBack()
  },

  // 拨打热线（动态号码）
  callHotline() {
    wx.makePhoneCall({
      phoneNumber: this.data.hotlinePhone,
      fail() {
        // 用户取消拨号，不用处理
      },
    })
  },
})
