/**
 * 录音管理器
 * 封装微信录音API，录完自动上传识别
 */

const recorderManager = wx.getRecorderManager()

// 录音配置
const RECORD_OPTIONS = {
  duration: 60000,       // 最长60秒
  sampleRate: 16000,     // 16kHz采样率
  numberOfChannels: 1,   // 单声道
  encodeBitRate: 48000,
  format: 'mp3',         // MP3格式
}

let _onStopCallback = null

// 录音结束时的回调
recorderManager.onStop((res) => {
  if (_onStopCallback) {
    _onStopCallback(res.tempFilePath)
  }
})

recorderManager.onError((err) => {
  console.error('录音错误:', err)
  wx.showToast({ title: '录音失败', icon: 'none' })
})

/**
 * 开始录音
 */
function startRecord() {
  // 先检查录音权限
  wx.authorize({
    scope: 'scope.record',
    success() {
      recorderManager.start(RECORD_OPTIONS)
    },
    fail() {
      wx.showModal({
        title: '需要录音权限',
        content: '请在设置中允许使用麦克风',
        confirmText: '去设置',
        success(res) {
          if (res.confirm) {
            wx.openSetting()
          }
        },
      })
    },
  })
}

/**
 * 停止录音
 * @returns {Promise<string>} 录音文件临时路径
 */
function stopRecord() {
  return new Promise((resolve) => {
    _onStopCallback = (filePath) => {
      resolve(filePath)
      _onStopCallback = null
    }
    recorderManager.stop()
  })
}

/**
 * 上传录音文件到后端做语音识别
 * @param {string} filePath - 录音文件路径
 * @returns {Promise<string>} 识别出的文字
 */
function uploadAndRecognize(filePath) {
  const app = getApp()
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `${app.globalData.baseUrl}/api/stt`,
      filePath,
      name: 'audio',
      formData: {
        lang: app.globalData.lang,
      },
      success(res) {
        if (res.statusCode === 200) {
          const data = JSON.parse(res.data)
          resolve(data.text || '')
        } else {
          reject(new Error('语音识别失败'))
        }
      },
      fail(err) {
        reject(err)
      },
    })
  })
}

module.exports = {
  startRecord,
  stopRecord,
  uploadAndRecognize,
}
