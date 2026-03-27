/**
 * 后端API封装
 * 小程序所有和后端的通信都走这里
 */

const app = getApp()

/**
 * 通用请求方法
 */
function request(path, data = {}, method = 'GET') {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${app.globalData.baseUrl}${path}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
      },
      success(res) {
        if (res.statusCode === 200) {
          resolve(res.data)
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`))
        }
      },
      fail(err) {
        reject(new Error(`网络错误: ${err.errMsg}`))
      },
    })
  })
}

/**
 * 政策问答
 * @param {string} question - 问题文本
 * @returns {Promise<{answer: string, sources: string[]}>}
 */
function askPolicy(question) {
  return request('/api/ask', {
    question,
    lang: app.globalData.lang,
    engine: app.globalData.engine,
  }, 'POST')
}

/**
 * 文字转语音 - 返回音频文件的临时URL
 * @param {string} text - 要转语音的文字
 * @returns {Promise<string>} 音频文件临时路径
 */
function textToSpeech(text) {
  return new Promise((resolve, reject) => {
    const downloadTask = wx.downloadFile({
      url: `${app.globalData.baseUrl}/api/tts`,
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      success(res) {
        if (res.statusCode === 200) {
          resolve(res.tempFilePath)
        } else {
          reject(new Error('语音合成失败'))
        }
      },
      fail(err) {
        reject(err)
      },
    })
  })
}

/**
 * 用POST请求下载TTS音频（微信downloadFile不支持POST body，换个方式）
 */
function getTTSAudio(text) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${app.globalData.baseUrl}/api/tts`,
      method: 'POST',
      data: { text, voice: 'zh_female', rate: '+0%' },
      header: { 'Content-Type': 'application/json' },
      responseType: 'arraybuffer',
      success(res) {
        if (res.statusCode === 200) {
          // 保存到临时文件
          const fs = wx.getFileSystemManager()
          const filePath = `${wx.env.USER_DATA_PATH}/tts_${Date.now()}.mp3`
          fs.writeFile({
            filePath,
            data: res.data,
            encoding: 'binary',
            success() {
              resolve(filePath)
            },
            fail(err) {
              reject(err)
            },
          })
        } else {
          reject(new Error('语音合成失败'))
        }
      },
      fail(err) {
        reject(err)
      },
    })
  })
}

/**
 * 获取政策卡片列表
 * @param {string} category - 分类筛选（可选）
 */
function getPolicies(category) {
  const path = category ? `/api/policies?category=${category}` : '/api/policies'
  return request(path)
}

/**
 * 获取单条政策详情
 */
function getPolicyDetail(id) {
  return request(`/api/policies/${id}`)
}

/**
 * 获取联系电话列表
 */
function getContacts() {
  return request('/api/contacts')
}

/**
 * 获取应用动态配置（提醒、热线等）
 */
function getConfig() {
  return request('/api/config')
}

module.exports = {
  askPolicy,
  getTTSAudio,
  getPolicies,
  getPolicyDetail,
  getContacts,
  getConfig,
}
