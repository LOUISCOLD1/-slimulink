/**
 * 双语文案（中文 + 蒙古语）
 * 所有用户可见的提示文字都在这里维护
 */

const i18n = {
  // 录音相关
  recording: { zh: '正在录音...', mn: 'ᠪᠢᠴᠢᠵᠦ ᠪᠠᠢᠨ᠎ᠠ...' },
  recognizing: { zh: '识别中...', mn: 'ᠲᠠᠨᠢᠵᠤ ᠪᠠᠢᠨ᠎ᠠ...' },
  recordFail: { zh: '录音失败，请重试', mn: 'ᠪᠢᠴᠢᠯᠭᠡ ᠠᠮᠵᠢᠯᠲᠠ ᠦᠭᠡᠢ᠂ ᠳᠠᠬᠢᠨ ᠣᠷᠣᠯᠳᠤᠨ᠎ᠠ ᠤᠤ' },
  notHeard: { zh: '没听清，再说一次', mn: 'ᠰᠣᠨᠣᠰᠳᠠᠬᠰᠠᠨ ᠦᠭᠡᠢ᠂ ᠳᠠᠬᠢᠨ ᠬᠡᠯᠡᠨ᠎ᠡ ᠦᠦ' },

  // 查询相关
  queryFail: { zh: '查询失败，请检查网络', mn: 'ᠬᠠᠢᠯᠲᠠ ᠠᠮᠵᠢᠯᠲᠠ ᠦᠭᠡᠢ᠂ ᠰᠦᠯᠵᠢᠶ᠎ᠡ ᠶᠢ ᠰᠢᠯᠭᠠᠨ᠎ᠠ ᠤᠤ' },
  querying: { zh: '正在查询政策...', mn: 'ᠲᠥᠷᠥ ᠵᠢᠷᠤᠮ ᠬᠠᠢᠵᠤ ᠪᠠᠢᠨ᠎ᠠ...' },

  // TTS相关
  generating: { zh: '生成语音...', mn: 'ᠳᠠᠭᠤ ᠦᠢᠯᠡᠳᠪᠦᠷᠢᠯᠡᠵᠦ ᠪᠠᠢᠨ᠎ᠠ...' },
  playFail: { zh: '播放失败', mn: 'ᠲᠣᠭᠯᠠᠬᠤ ᠠᠮᠵᠢᠯᠲᠠ ᠦᠭᠡᠢ' },
  ttsFail: { zh: '语音生成失败', mn: 'ᠳᠠᠭᠤ ᠦᠢᠯᠡᠳᠪᠦᠷᠢᠯᠡᠬᠦ ᠠᠮᠵᠢᠯᠲᠠ ᠦᠭᠡᠢ' },

  // 加载相关
  loadFail: { zh: '加载失败', mn: 'ᠠᠴᠢᠶᠠᠯᠠᠬᠤ ᠠᠮᠵᠢᠯᠲᠠ ᠦᠭᠡᠢ' },

  // 通用
  networkError: { zh: '网络错误，请稍后重试', mn: 'ᠰᠦᠯᠵᠢᠶ᠎ᠡ ᠠᠯᠳᠠᠭ᠎ᠠ᠂ ᠳᠠᠬᠢᠨ ᠣᠷᠣᠯᠳᠤᠨ᠎ᠠ ᠤᠤ' },

  // 权限
  needRecordPermission: { zh: '需要录音权限', mn: 'ᠪᠢᠴᠢᠯᠭᠡ ᠶᠢᠨ ᠡᠷᠬᠡ ᠬᠡᠷᠡᠭᠲᠡᠢ' },
  allowMicrophone: { zh: '请在设置中允许使用麦克风', mn: 'ᠲᠣᠬᠢᠷᠭᠠᠯ ᠳᠤ ᠮᠢᠺᠷᠣᠹᠣᠨ ᠢ ᠵᠥᠪᠰᠢᠶᠡᠷᠡᠨ᠎ᠡ ᠦᠦ' },
  goSettings: { zh: '去设置', mn: 'ᠲᠣᠬᠢᠷᠭᠠᠯ ᠷᠤ ᠣᠴᠢᠬᠤ' },

  // 政策页
  searchPlaceholder: { zh: '搜索政策...', mn: 'ᠲᠥᠷᠥ ᠵᠢᠷᠤᠮ ᠬᠠᠢᠬᠤ...' },
  noPolicies: { zh: '暂无相关政策', mn: 'ᠬᠣᠯᠪᠣᠭᠳᠠᠬᠤ ᠲᠥᠷᠥ ᠵᠢᠷᠤᠮ ᠪᠠᠢᠬᠤ ᠦᠭᠡᠢ' },
  allCategories: { zh: '全部', mn: 'ᠪᠦᠭᠦᠳᠡ' },
  viewDetail: { zh: '查看详情 →', mn: 'ᠳᠡᠯᠭᠡᠷᠡᠩᠭᠦᠢ →' },

  // 电话页
  phoneTitle: { zh: '便民电话', mn: 'ᠠᠷᠠᠳ ᠤᠨ ᠤᠲᠠᠰᠤ' },
  phoneSubtitle: { zh: '点击即可直接拨打', mn: 'ᠳᠠᠷᠤᠪᠠᠯ ᠤᠲᠠᠰᠤᠳᠠᠬᠤ ᠪᠣᠯᠤᠨ᠎ᠠ' },
  noContacts: { zh: '暂无联系电话', mn: 'ᠤᠲᠠᠰᠤ ᠪᠠᠢᠬᠤ ᠦᠭᠡᠢ' },
  callBtn: { zh: '拨打', mn: 'ᠤᠲᠠᠰᠤᠳᠠᠬᠤ' },

  // 回答页
  disclaimer: {
    zh: '以上信息仅供参考，具体以当地最新政策为准。如有疑问，建议拨打政务热线12345咨询。',
    mn: 'ᠳᠡᠭᠡᠷᠡᠬᠢ ᠮᠡᠳᠡᠭᠡᠯᠡᠯ ᠵᠥᠪᠬᠡᠨ ᠯᠠᠪᠯᠠᠯᠲᠠ ᠪᠣᠯᠬᠤ ᠪᠥᠭᠡᠳ ᠣᠷᠣᠨ ᠨᠤᠲᠤᠭ ᠤᠨ ᠰᠢᠨ᠎ᠡ ᠲᠥᠷᠥ ᠵᠢᠷᠤᠮ ᠢᠶᠠᠷ ᠪᠠᠷᠢᠮᠲᠠ ᠪᠣᠯᠭᠠᠨ᠎ᠠ ᠤᠤ᠃ ᠠᠰᠠᠭᠤᠯᠲᠠ ᠪᠠᠢᠪᠠᠯ 12345 ᠤᠲᠠᠰᠤ ᠪᠠᠷ ᠯᠠᠪᠯᠠᠨ᠎ᠠ ᠤᠤ᠃'
  },
  askAgain: { zh: '继续提问', mn: 'ᠦᠷᠭᠦᠯᠵᠢᠯᠡᠨ ᠠᠰᠠᠭᠤᠬᠤ' },
  callHotline: { zh: '拨打12345', mn: '12345 ᠤᠲᠠᠰᠤᠳᠠᠬᠤ' },
}

/**
 * 获取当前语言的文案
 * @param {string} key - 文案key
 * @returns {string} 对应语言的文案
 */
function t(key) {
  const app = getApp()
  const lang = (app && app.globalData && app.globalData.lang) || 'zh'
  const item = i18n[key]
  if (!item) return key
  return item[lang] || item['zh'] || key
}

module.exports = { t, i18n }
