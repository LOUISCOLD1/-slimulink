const { t } = require('./i18n')

const recorderManager = wx.getRecorderManager()

const RECORD_OPTIONS = {
  duration: 60000,
  sampleRate: 16000,
  numberOfChannels: 1,
  encodeBitRate: 48000,
  format: 'mp3',
}

let _isRecording = false
let _onStopCallback = null

recorderManager.onStop((res) => {
  _isRecording = false
  if (_onStopCallback) {
    _onStopCallback(res.tempFilePath)
    _onStopCallback = null
  }
})

recorderManager.onError((err) => {
  _isRecording = false
  console.error('录音错误:', err)
  wx.showToast({ title: t('recordFail'), icon: 'none' })
})

/**
 * 切换录音状态（点击开始/点击结束）
 * @returns {Promise<string|null>} 停止时返回文件路径，开始时返回 null
 */
function toggleRecord() {
  if (_isRecording) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        _onStopCallback = null
        reject(new Error('停止录音超时'))
      }, 10000)

      _onStopCallback = (filePath) => {
        clearTimeout(timer)
        resolve(filePath)
      }
      recorderManager.stop()
    })
  } else {
    return new Promise((resolve) => {
      wx.authorize({
        scope: 'scope.record',
        success() {
          recorderManager.start(RECORD_OPTIONS)
          _isRecording = true
          resolve(null)
        },
        fail() {
          wx.showModal({
            title: t('needRecordPermission'),
            content: t('allowMicrophone'),
            confirmText: t('goSettings'),
            success(res) {
              if (res.confirm) wx.openSetting()
            },
          })
          resolve(null)
        },
      })
    })
  }
}

function isRecording() {
  return _isRecording
}

function uploadAndRecognize(filePath) {
  const app = getApp()
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `${app.globalData.baseUrl}/api/stt`,
      filePath,
      name: 'audio',
      formData: { lang: app.globalData.lang },
      success(res) {
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(res.data)
            resolve({ text: data.text || '', error: data.error || '' })
          } catch (e) {
            reject(new Error('服务器返回数据格式异常'))
          }
        } else {
          reject(new Error(t('networkError')))
        }
      },
      fail(err) { reject(err) },
    })
  })
}

module.exports = {
  toggleRecord,
  isRecording,
  uploadAndRecognize,
}
