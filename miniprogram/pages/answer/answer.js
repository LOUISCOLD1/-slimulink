const api = require('../../utils/api')

Page({
  data: {
    question: '',
    answer: '',
    sources: [],
    isPlaying: false,
  },

  // 音频播放器
  _audioContext: null,

  onLoad(options) {
    // 优先从 Storage 读取数据（推荐方式，不受URL长度限制）
    const storageData = wx.getStorageSync('answerData')
    if (storageData) {
      this.setData({
        question: storageData.question || '',
        answer: storageData.answer || '',
        sources: storageData.sources || [],
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
      wx.showLoading({ title: '生成语音...' })

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
        wx.showToast({ title: '播放失败', icon: 'none' })
      })
      this._audioContext.play()
    } catch (err) {
      wx.hideLoading()
      console.error('TTS失败:', err)
      wx.showToast({ title: '语音生成失败', icon: 'none' })
    }
  },

  // 继续提问 - 返回首页
  askAgain() {
    wx.navigateBack()
  },

  // 拨打热线
  callHotline() {
    wx.makePhoneCall({
      phoneNumber: '12345',
      fail() {
        // 用户取消拨号，不用处理
      },
    })
  },
})
