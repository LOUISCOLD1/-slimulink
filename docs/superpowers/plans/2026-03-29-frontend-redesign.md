# 牧智通前端重设计 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将微信小程序前端从蓝色简约风全面重构为草原绿金风格，引入豆包式多对话聊天 UI，重设计政策库/电话/设置页。

**Architecture:** 保持现有 miniprogram 目录结构，新增 `pages/chat/chat`（聊天页）和 `pages/chat-list/chat-list`（对话列表页），移除旧的 `pages/answer/answer`。新增 `utils/chat-store.js` 管理对话历史。所有页面样式全部重写为草原绿金主题。

**Tech Stack:** 微信小程序原生（WXML + WXSS + JS），微信基础库 2.25.0+，现有后端 API 不变。

---

## 文件变更总览

| 操作 | 文件路径 | 职责 |
|------|---------|------|
| 重写 | `app.js` | 新增 fontSize / speechRate globalData，onLaunch 读取缓存 |
| 重写 | `app.json` | 新增 chat / chat-list 页面，更新配色 |
| 重写 | `app.wxss` | 全局样式改为草原绿金主题 + 字体大小 CSS 变量 |
| 重写 | `utils/i18n.js` | 新增所有新页面的蒙汉文案 |
| 新增 | `utils/chat-store.js` | 对话历史 CRUD（纯本地 Storage） |
| 重写 | `utils/recorder.js` | 改为点击开始/点击结束模式 |
| 重写 | `utils/api.js` | 保持不变，仅清理死代码 |
| 重写 | `pages/index/index.*` | 新对话首页（banner + 提醒 + 语音 + 热门问题） |
| 新增 | `pages/chat/chat.*` | 聊天对话页（气泡 UI + 语音播放 + 底部输入栏） |
| 新增 | `pages/chat-list/chat-list.*` | 对话列表页（历史记录 + 新建对话） |
| 删除 | `pages/answer/answer.*` | 被 chat 页面替代 |
| 重写 | `pages/policies/policies.*` | 九宫格 + 热门/最新卡片 |
| 重写 | `pages/policy-detail/policy-detail.*` | 保持结构，更新为绿金样式 |
| 重写 | `pages/contacts/contacts.*` | 分类分组 + 收藏置顶 |
| 重写 | `pages/settings/settings.*` | 字体/语速/清除历史/关于 |

---

### Task 1: 全局主题 — app.js / app.json / app.wxss

**Files:**
- Modify: `miniprogram/app.js`
- Modify: `miniprogram/app.json`
- Rewrite: `miniprogram/app.wxss`

- [ ] **Step 1: 更新 app.json — 配色 + 新页面注册**

```json
{
  "pages": [
    "pages/index/index",
    "pages/chat/chat",
    "pages/chat-list/chat-list",
    "pages/policies/policies",
    "pages/policy-detail/policy-detail",
    "pages/contacts/contacts",
    "pages/settings/settings"
  ],
  "window": {
    "navigationBarBackgroundColor": "#064e3b",
    "navigationBarTitleText": "牧智通",
    "navigationBarTextStyle": "white",
    "backgroundColor": "#f0fdf4",
    "backgroundTextStyle": "dark"
  },
  "tabBar": {
    "color": "#999999",
    "selectedColor": "#059669",
    "backgroundColor": "#ffffff",
    "borderStyle": "white",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "问答",
        "iconPath": "static/images/tab-home.png",
        "selectedIconPath": "static/images/tab-home-active.png"
      },
      {
        "pagePath": "pages/policies/policies",
        "text": "政策",
        "iconPath": "static/images/tab-policy.png",
        "selectedIconPath": "static/images/tab-policy-active.png"
      },
      {
        "pagePath": "pages/contacts/contacts",
        "text": "电话",
        "iconPath": "static/images/tab-phone.png",
        "selectedIconPath": "static/images/tab-phone-active.png"
      },
      {
        "pagePath": "pages/settings/settings",
        "text": "设置",
        "iconPath": "static/images/tab-settings.png",
        "selectedIconPath": "static/images/tab-settings-active.png"
      }
    ]
  },
  "style": "v2",
  "sitemapLocation": "sitemap.json"
}
```

- [ ] **Step 2: 更新 app.js — 新增 fontSize / speechRate / chatHistory 到 globalData**

```js
App({
  globalData: {
    baseUrl: 'http://your-server-ip:80',
    lang: 'zh',
    engine: 'zhipu',
    fontSize: 'large',       // large | xlarge | xxlarge
    speechRate: '+0%',       // -20% | +0% | +20%
  },

  onLaunch() {
    const lang = wx.getStorageSync('lang')
    if (lang) this.globalData.lang = lang
    const baseUrl = wx.getStorageSync('baseUrl')
    if (baseUrl) this.globalData.baseUrl = baseUrl
    const engine = wx.getStorageSync('engine')
    if (engine) this.globalData.engine = engine
    const fontSize = wx.getStorageSync('fontSize')
    if (fontSize) this.globalData.fontSize = fontSize
    const speechRate = wx.getStorageSync('speechRate')
    if (speechRate) this.globalData.speechRate = speechRate
  }
})
```

- [ ] **Step 3: 重写 app.wxss — 草原绿金全局样式 + 字体大小级别**

```css
/* 草原绿金主题 — 全局样式 */
page {
  --green-dark: #064e3b;
  --green-mid: #047857;
  --green-light: #059669;
  --green-bg: #f0fdf4;
  --gold: #fbbf24;
  --gold-bg: #fffbeb;
  --gold-border: #fcd34d;
  --gold-text: #78350f;
  --white: #ffffff;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;
  --border: #d1fae5;
  --shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);

  background-color: var(--green-bg);
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: var(--text-primary);
}

/* 字体大小级别 */
.font-large page, page { font-size: 32rpx; }
.font-xlarge page { font-size: 36rpx; }
.font-xxlarge page { font-size: 40rpx; }

/* 工具类 */
.text-lg { font-size: 36rpx; }
.text-xl { font-size: 40rpx; }
.text-2xl { font-size: 48rpx; }
.text-3xl { font-size: 56rpx; }
.text-bold { font-weight: bold; }
.text-center { text-align: center; }
.text-gray { color: var(--text-secondary); }
.text-green { color: var(--green-light); }
.text-gold { color: var(--gold); }

.container {
  padding: 0;
  min-height: 100vh;
  box-sizing: border-box;
  background: var(--green-bg);
}

.card {
  background: var(--white);
  border-radius: 20rpx;
  padding: 32rpx;
  margin: 16rpx 24rpx;
  box-shadow: var(--shadow);
}

.btn-green {
  background: linear-gradient(135deg, var(--green-light), var(--green-mid));
  color: white;
  border-radius: 16rpx;
  padding: 24rpx 48rpx;
  font-size: 36rpx;
  font-weight: bold;
  text-align: center;
  border: none;
}
.btn-green:active { opacity: 0.85; }

.divider {
  height: 2rpx;
  background: var(--border);
  margin: 24rpx 0;
}

/* 加载状态 */
.loading-state {
  text-align: center;
  padding: 80rpx;
  color: var(--text-secondary);
}
.loading-spinner {
  width: 40rpx; height: 40rpx;
  border: 4rpx solid #e5e7eb;
  border-top: 4rpx solid var(--green-light);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16rpx;
}
@keyframes spin { to { transform: rotate(360deg); } }
```

- [ ] **Step 4: 创建空的 chat 和 chat-list 页面目录（占位，后续任务填充）**

创建文件：
- `miniprogram/pages/chat/chat.js` — 空 Page({})
- `miniprogram/pages/chat/chat.json` — `{"navigationBarTitleText": ""}`
- `miniprogram/pages/chat/chat.wxml` — `<view class="container">chat</view>`
- `miniprogram/pages/chat/chat.wxss` — 空
- `miniprogram/pages/chat-list/chat-list.js` — 空 Page({})
- `miniprogram/pages/chat-list/chat-list.json` — `{"navigationBarTitleText": "我的对话"}`
- `miniprogram/pages/chat-list/chat-list.wxml` — `<view class="container">chat-list</view>`
- `miniprogram/pages/chat-list/chat-list.wxss` — 空

- [ ] **Step 5: 删除旧的 answer 页面目录**

```bash
rm -rf miniprogram/pages/answer
```

- [ ] **Step 6: Commit**

```bash
git add miniprogram/app.js miniprogram/app.json miniprogram/app.wxss \
  miniprogram/pages/chat/ miniprogram/pages/chat-list/
git rm -r miniprogram/pages/answer/
git commit -m "feat: apply grassland green-gold theme, add chat/chat-list pages, remove answer page"
```

---

### Task 2: 对话存储模块 — utils/chat-store.js

**Files:**
- Create: `miniprogram/utils/chat-store.js`

- [ ] **Step 1: 实现 chat-store.js — 对话历史的 CRUD 操作**

```js
/**
 * 对话历史管理（纯本地 Storage）
 *
 * 数据结构：
 * chatHistory = [
 *   {
 *     id: "chat_1711700000000",
 *     title: "低保政策咨询",
 *     messages: [
 *       { role: "user", content: "低保怎么申请？", time: 1711700000 },
 *       { role: "bot", content: "根据...", sources: [...], time: 1711700005 },
 *     ],
 *     createdAt: 1711700000000,
 *     updatedAt: 1711700005000,
 *   }
 * ]
 */

const STORAGE_KEY = 'chatHistory'

// 获取所有对话（按 updatedAt 倒序）
function getAllChats() {
  const chats = wx.getStorageSync(STORAGE_KEY) || []
  return chats.sort((a, b) => b.updatedAt - a.updatedAt)
}

// 获取单个对话
function getChat(chatId) {
  const chats = wx.getStorageSync(STORAGE_KEY) || []
  return chats.find(c => c.id === chatId) || null
}

// 创建新对话，返回 chatId
function createChat(firstMessage) {
  const chats = wx.getStorageSync(STORAGE_KEY) || []
  const now = Date.now()
  // 从第一条消息自动生成标题（截取前20字）
  const title = firstMessage.length > 20
    ? firstMessage.substring(0, 20) + '...'
    : firstMessage
  const chat = {
    id: 'chat_' + now,
    title,
    messages: [],
    createdAt: now,
    updatedAt: now,
  }
  chats.unshift(chat)
  wx.setStorageSync(STORAGE_KEY, chats)
  return chat.id
}

// 向对话追加消息
function addMessage(chatId, message) {
  const chats = wx.getStorageSync(STORAGE_KEY) || []
  const chat = chats.find(c => c.id === chatId)
  if (!chat) return false
  chat.messages.push({
    ...message,
    time: Math.floor(Date.now() / 1000),
  })
  chat.updatedAt = Date.now()
  wx.setStorageSync(STORAGE_KEY, chats)
  return true
}

// 删除单个对话
function deleteChat(chatId) {
  let chats = wx.getStorageSync(STORAGE_KEY) || []
  chats = chats.filter(c => c.id !== chatId)
  wx.setStorageSync(STORAGE_KEY, chats)
}

// 清除全部对话历史
function clearAllChats() {
  wx.removeStorageSync(STORAGE_KEY)
}

// 获取对话数量
function getChatCount() {
  const chats = wx.getStorageSync(STORAGE_KEY) || []
  return chats.length
}

module.exports = {
  getAllChats,
  getChat,
  createChat,
  addMessage,
  deleteChat,
  clearAllChats,
  getChatCount,
}
```

- [ ] **Step 2: Commit**

```bash
git add miniprogram/utils/chat-store.js
git commit -m "feat: add chat-store module for local conversation history"
```

---

### Task 3: i18n 更新 — 补全所有新页面文案

**Files:**
- Rewrite: `miniprogram/utils/i18n.js`

- [ ] **Step 1: 重写 i18n.js — 按页面分组，覆盖所有用户可见文案**

在现有 i18n.js 基础上追加以下 key（保留现有 key，新增缺失的）：

```js
// 新增到 i18n 对象中的 key：

// 首页
newChat: { zh: '开始新对话', mn: 'ᠰᠢᠨ᠎ᠡ ᠶᠠᠷᠢᠯᠴᠠᠯᠭ᠎ᠠ' },
clickToSpeak: { zh: '点击说话', mn: 'ᠳᠠᠷᠤᠵᠤ ᠶᠠᠷᠢ' },
clickToStop: { zh: '点击停止', mn: 'ᠳᠠᠷᠤᠵᠤ ᠵᠣᠭᠰᠣᠬᠤ' },
typeQuestion: { zh: '输入问题...', mn: 'ᠠᠰᠠᠭᠤᠯᠲᠠ ᠪᠢᠴᠢᠬᠦ...' },

// 对话页
playVoice: { zh: '🔊 播放语音', mn: '🔊 ᠳᠠᠭᠤ ᠲᠣᠭᠯᠠᠬᠤ' },
callPhone: { zh: '📞 一键拨打', mn: '📞 ᠤᠲᠠᠰᠤᠳᠠᠬᠤ' },
sourceLabel: { zh: '📄 来源', mn: '📄 ᠡᠬᠢ ᠰᠤᠷᠪᠤᠯᠵᠢ' },

// 对话列表
myChats: { zh: '我的对话', mn: 'ᠮᠢᠨᠦ ᠶᠠᠷᠢᠯᠴᠠᠯᠭ᠎ᠠ' },
noChats: { zh: '还没有对话，去提个问题吧', mn: 'ᠶᠠᠷᠢᠯᠴᠠᠯᠭ᠎ᠠ ᠪᠠᠢᠬᠤ ᠦᠭᠡᠢ' },
messagesCount: { zh: '条对话', mn: 'ᠶᠠᠷᠢᠯᠴᠠᠯᠭ᠎ᠠ' },

// 政策库
policyLibrary: { zh: '政策大全', mn: 'ᠲᠥᠷᠥ ᠵᠢᠷᠤᠮ' },
hotPolicies: { zh: '🔥 热门政策', mn: '🔥 ᠬᠠᠯᠠᠭᠤᠨ ᠲᠥᠷᠥ ᠵᠢᠷᠤᠮ' },
latestPolicies: { zh: '📄 最新政策', mn: '📄 ᠰᠢᠨ᠎ᠡ ᠲᠥᠷᠥ ᠵᠢᠷᠤᠮ' },
viewAll: { zh: '查看全部 ›', mn: 'ᠪᠦᠭᠦᠳᠡ ᠦᠵᠡᠬᠦ ›' },
moreCategories: { zh: '更多', mn: 'ᠪᠦᠭᠦᠳᠡ' },

// 电话页
favoriteContacts: { zh: '⭐ 常用号码', mn: '⭐ ᠪᠠᠢᠩᠭᠤ ᠤᠲᠠᠰᠤ' },

// 设置页
fontSizeSetting: { zh: '🔤 字体大小', mn: '🔤 ᠦᠰᠦᠭ ᠤᠨ ᠶᠡᠬᠡ ᠪᠠᠭ᠎ᠠ' },
fontLarge: { zh: '大', mn: 'ᠶᠡᠬᠡ' },
fontXlarge: { zh: '特大', mn: 'ᠣᠨᠴᠠ ᠶᠡᠬᠡ' },
fontXxlarge: { zh: '超大', mn: 'ᠮᠠᠰᠢ ᠶᠡᠬᠡ' },
speechRateSetting: { zh: '🔊 语音语速', mn: '🔊 ᠳᠠᠭᠤᠨ ᠤ ᠬᠤᠷᠳᠤ' },
speedSlow: { zh: '慢速', mn: 'ᠤᠳᠠᠭᠠᠨ' },
speedNormal: { zh: '正常', mn: 'ᠬᠡᠪ ᠤᠨ' },
speedFast: { zh: '快速', mn: 'ᠬᠤᠷᠳᠤᠨ' },
clearHistory: { zh: '🗑️ 清除对话历史', mn: '🗑️ ᠶᠠᠷᠢᠯᠴᠠᠯᠭ᠎ᠠ ᠠᠷᠢᠯᠭᠠᠬᠤ' },
clearHistoryConfirm: { zh: '确定要清除所有对话记录吗？', mn: 'ᠪᠦᠬᠦ ᠶᠠᠷᠢᠯᠴᠠᠯᠭ᠎ᠠ ᠶᠢ ᠠᠷᠢᠯᠭᠠᠬᠤ ᠤᠤ?' },
clearDone: { zh: '已清除', mn: 'ᠠᠷᠢᠯᠭᠠᠪᠠ' },
version: { zh: '版本', mn: 'ᠬᠡᠪᠯᠡᠯ' },
```

- [ ] **Step 2: Commit**

```bash
git add miniprogram/utils/i18n.js
git commit -m "feat: add all new i18n keys for chat UI, policy grid, settings"
```

---

### Task 4: 录音模块改造 — 点击开始/点击结束

**Files:**
- Rewrite: `miniprogram/utils/recorder.js`

- [ ] **Step 1: 重写 recorder.js — 改为 toggle 模式**

核心变更：
- 移除 `startRecord()` 返回 Promise 的权限检查
- 新增 `toggleRecord()` 统一入口：未录音时开始，录音中时停止并返回结果
- 保留 `uploadAndRecognize()` 不变

```js
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
    // 正在录音 → 停止
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
    // 未录音 → 检查权限并开始
    return new Promise((resolve, reject) => {
      wx.authorize({
        scope: 'scope.record',
        success() {
          recorderManager.start(RECORD_OPTIONS)
          _isRecording = true
          resolve(null) // null 表示"已开始录音"
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
```

- [ ] **Step 2: Commit**

```bash
git add miniprogram/utils/recorder.js
git commit -m "feat: refactor recorder to click-to-start/click-to-stop toggle mode"
```

---

### Task 5: 新对话首页 — pages/index

**Files:**
- Rewrite: `miniprogram/pages/index/index.js`
- Rewrite: `miniprogram/pages/index/index.wxml`
- Rewrite: `miniprogram/pages/index/index.wxss`
- Modify: `miniprogram/pages/index/index.json`

- [ ] **Step 1: 更新 index.json — 自定义导航栏标题**

```json
{
  "navigationBarTitleText": "ᠮᠠᠯᠵᠢᠬᠤ ᠲᠣᠩ · 牧智通"
}
```

- [ ] **Step 2: 重写 index.wxml — banner + 提醒条 + 语音卡片 + 热门问题**

完整 WXML 包含：
- 绿色 banner（标题 + 蒙文 + 波浪装饰）
- 金色提醒条（来自 API config，可点击提问）
- 白色语音卡片（"想了解什么政策？" + 大录音按钮 + 蒙文）
- 文字输入行（输入框 + 发送按钮）
- 热门问题列表（金色左边框）
- 右上角用 `navigationBarTitleText` 实现，📝 用页面内按钮浮动

- [ ] **Step 3: 重写 index.wxss — 草原绿金样式**

包含 banner 渐变、波浪 SVG 伪元素、录音按钮（绿色圆形+金色边框）、录音中脉冲动画（红色）、提醒条金色样式、热门问题金色左边框。

- [ ] **Step 4: 重写 index.js — 逻辑改造**

核心逻辑：
- `onMicTap()` 使用 `recorder.toggleRecord()` 实现点击录音
- 录音完成后调用 `uploadAndRecognize` → `api.askPolicy` → 创建新对话并跳转 chat 页
- `onTextSubmit()` / `onHotQuestion()` 同理：创建对话 → 跳转 chat
- `goToChatList()` 跳转到 `/pages/chat-list/chat-list`
- 使用 `chat-store.createChat()` 和 `addMessage()` 管理数据

- [ ] **Step 5: Commit**

```bash
git add miniprogram/pages/index/
git commit -m "feat: redesign index page with grassland theme, banner, toggle-record"
```

---

### Task 6: 聊天对话页 — pages/chat

**Files:**
- Create: `miniprogram/pages/chat/chat.js`
- Create: `miniprogram/pages/chat/chat.wxml`
- Create: `miniprogram/pages/chat/chat.wxss`
- Create: `miniprogram/pages/chat/chat.json`

- [ ] **Step 1: chat.json — 设置动态标题**

```json
{
  "navigationBarTitleText": "",
  "navigationBarBackgroundColor": "#064e3b",
  "navigationBarTextStyle": "white"
}
```

- [ ] **Step 2: chat.wxml — 聊天气泡 UI + 底部输入栏**

结构：
- `scroll-view` 包裹消息列表，自动滚动到底部
- 用户消息：右侧绿色气泡
- AI 消息：左侧白色气泡 + 🤖 头像 + 结构化内容 + "🔊 播放语音" 按钮 + "📞 一键拨打" + "📄 来源"
- 加载中动画（AI 正在思考...）
- 底部固定输入栏：`<input>` + 🎙️ 麦克风按钮

- [ ] **Step 3: chat.wxss — 聊天页样式**

包含：用户气泡（绿色右对齐，圆角）、AI 气泡（白色左对齐，阴影）、bot 头像（深绿圆形）、播放语音标签（绿色背景胶囊）、底部输入栏固定定位、录音中脉冲动画。

- [ ] **Step 4: chat.js — 聊天逻辑**

核心逻辑：
- `onLoad(options)` 从 `options.chatId` 加载对话历史
- `sendMessage(text)` — 调用 `api.askPolicy()` + `chat-store.addMessage()`
- `onMicTap()` — `recorder.toggleRecord()` 录音 → 识别 → 发送
- `playVoice(e)` — `api.getTTSAudio()` + `wx.createInnerAudioContext()`，复用单实例，播放完 destroy
- `callPhone(e)` — `wx.makePhoneCall()`
- `scrollToBottom()` — 消息列表自动滚动
- `onLoad` 时设置导航栏标题为对话 title

- [ ] **Step 5: Commit**

```bash
git add miniprogram/pages/chat/
git commit -m "feat: add chat page with bubble UI, voice playback, bottom input bar"
```

---

### Task 7: 对话列表页 — pages/chat-list

**Files:**
- Create: `miniprogram/pages/chat-list/chat-list.js`
- Create: `miniprogram/pages/chat-list/chat-list.wxml`
- Create: `miniprogram/pages/chat-list/chat-list.wxss`
- Modify: `miniprogram/pages/chat-list/chat-list.json`

- [ ] **Step 1: chat-list.json**

```json
{
  "navigationBarTitleText": "我的对话",
  "navigationBarBackgroundColor": "#064e3b",
  "navigationBarTextStyle": "white"
}
```

- [ ] **Step 2: chat-list.wxml — 对话列表 UI**

结构：
- 顶部绿色"＋ 开始新对话"大按钮
- 对话卡片列表：每张卡片包含 icon + 标题 + 预览文本 + 时间 + 消息数 badge
- 左滑删除（使用 `movable-view` 或 `bindlongpress` 弹出确认）
- 空状态："还没有对话，去提个问题吧"

- [ ] **Step 3: chat-list.wxss — 列表样式**

- [ ] **Step 4: chat-list.js — 列表逻辑**

- `onShow()` 每次显示时从 `chat-store.getAllChats()` 刷新列表
- `onChatTap(e)` 跳转到 `/pages/chat/chat?chatId=xxx`
- `onNewChat()` 跳转回 `/pages/index/index`（switchTab）
- `onDeleteChat(e)` 确认后调用 `chat-store.deleteChat()`
- 时间格式化：今天显示"HH:mm"，昨天显示"昨天"，更早显示"M月D日"

- [ ] **Step 5: Commit**

```bash
git add miniprogram/pages/chat-list/
git commit -m "feat: add chat-list page with history, delete, time formatting"
```

---

### Task 8: 政策库重设计 — pages/policies

**Files:**
- Rewrite: `miniprogram/pages/policies/policies.js`
- Rewrite: `miniprogram/pages/policies/policies.wxml`
- Rewrite: `miniprogram/pages/policies/policies.wxss`
- Modify: `miniprogram/pages/policies/policies.json`

- [ ] **Step 1: policies.json**

```json
{
  "navigationBarTitleText": "政策大全 · ᠲᠥᠷᠥ ᠵᠢᠷᠤᠮ",
  "navigationBarBackgroundColor": "#064e3b",
  "navigationBarTextStyle": "white",
  "enablePullDownRefresh": true
}
```

- [ ] **Step 2: 重写 policies.wxml — 搜索 + 九宫格 + 分区卡片**

结构：
- 搜索框（蒙汉双语 placeholder）
- 4×2 八宫格分类（每个：彩色渐变图标 + 中文名 + 蒙文名）
- "🔥 热门政策" section header + 政策卡片（带"热门" badge）
- "📄 最新政策" section header + 政策卡片
- 点击分类筛选对应政策
- 点击卡片跳转 policy-detail

- [ ] **Step 3: 重写 policies.wxss — 九宫格 + 卡片绿金样式**

八宫格用 CSS Grid 4列，每个 icon 渐变背景（补贴金色、医保蓝色、教育紫色、草原绿色等）。卡片样式带金色标签（money/deadline/where）。

- [ ] **Step 4: 重写 policies.js — 分区逻辑**

- `loadPolicies()` 加载后自动标记 `isHot`（前3条）和 `isNew`（最近更新的）
- `onCategoryTap()` 按分类筛选
- `filterPolicies()` 同时搜索中文和蒙文字段
- 离线缓存逻辑保持不变

- [ ] **Step 5: Commit**

```bash
git add miniprogram/pages/policies/
git commit -m "feat: redesign policies page with category grid and hot/latest sections"
```

---

### Task 9: 政策详情页更新 — pages/policy-detail

**Files:**
- Rewrite: `miniprogram/pages/policy-detail/policy-detail.wxml`
- Rewrite: `miniprogram/pages/policy-detail/policy-detail.wxss`
- Modify: `miniprogram/pages/policy-detail/policy-detail.js`

- [ ] **Step 1: 更新 policy-detail.json**

```json
{
  "navigationBarBackgroundColor": "#064e3b",
  "navigationBarTextStyle": "white"
}
```

- [ ] **Step 2: 重写样式和模板为绿金主题**

- 标题卡片：绿色背景
- 金额卡片：金色背景
- 材料列表：绿色勾号
- 拨号按钮：绿色渐变
- "问AI"按钮改为跳转到 chat 页面（创建新对话并预填问题）

- [ ] **Step 3: 更新 policy-detail.js**

`askAboutPolicy()` 改为：创建新对话 → 预填问题 → 跳转 `/pages/chat/chat?chatId=xxx&prefill=xxx`

- [ ] **Step 4: Commit**

```bash
git add miniprogram/pages/policy-detail/
git commit -m "feat: restyle policy-detail page with green-gold theme"
```

---

### Task 10: 便民电话页重设计 — pages/contacts

**Files:**
- Rewrite: `miniprogram/pages/contacts/contacts.js`
- Rewrite: `miniprogram/pages/contacts/contacts.wxml`
- Rewrite: `miniprogram/pages/contacts/contacts.wxss`

- [ ] **Step 1: contacts.wxml — 收藏区 + 分类分组**

结构：
- 页面标题（蒙汉双语）
- "⭐ 常用号码" 分组（收藏的号码）
- 按 `category` 分组：村级 / 乡镇 / 旗县 / 热线
- 每个卡片：名称（蒙汉） + 描述 + ⭐收藏按钮 + 📞拨打按钮
- 空状态处理

- [ ] **Step 2: contacts.wxss — 绿金主题卡片**

- [ ] **Step 3: contacts.js — 收藏逻辑**

- `favoriteContacts` 存 Storage，类型为 phone 字符串数组
- `toggleFavorite(e)` 切换收藏状态
- 加载时把收藏的号码排到最前面单独分组
- `makeCall(e)` 带 fail 回调

- [ ] **Step 4: Commit**

```bash
git add miniprogram/pages/contacts/
git commit -m "feat: redesign contacts with favorites and category grouping"
```

---

### Task 11: 设置页重设计 — pages/settings

**Files:**
- Rewrite: `miniprogram/pages/settings/settings.js`
- Rewrite: `miniprogram/pages/settings/settings.wxml`
- Rewrite: `miniprogram/pages/settings/settings.wxss`

- [ ] **Step 1: settings.wxml — 完整设置项**

结构：
- 🌐 语言切换（中文 / ᠮᠣᠩᠭᠣᠯ ᠬᠡᠯᠡ）
- 🤖 AI引擎（智谱 / DeepSeek）
- 🔤 字体大小（大 / 特大 / 超大）三按钮选择
- 🔊 语音语速（慢速 / 正常 / 快速）三按钮选择
- 🗑️ 清除对话历史（红色描边按钮，弹窗确认）
- 📱 关于牧智通（蒙汉双语介绍 + 版本号）

- [ ] **Step 2: settings.wxss — 绿金主题设置页**

选项按钮组：选中时绿色高亮 + 金色边框。清除按钮：红色描边。

- [ ] **Step 3: settings.js — 完整设置逻辑**

```js
const { t } = require('../../utils/i18n')
const chatStore = require('../../utils/chat-store')

const app = getApp()

Page({
  data: {
    lang: 'zh',
    engine: 'zhipu',
    fontSize: 'large',
    speechRate: '+0%',
  },

  onLoad() {
    this.setData({
      lang: app.globalData.lang,
      engine: app.globalData.engine,
      fontSize: app.globalData.fontSize,
      speechRate: app.globalData.speechRate,
    })
  },

  setLang(e) {
    const lang = e.currentTarget.dataset.lang
    this.setData({ lang })
    app.globalData.lang = lang
    wx.setStorageSync('lang', lang)
  },

  setEngine(e) {
    const engine = e.currentTarget.dataset.engine
    this.setData({ engine })
    app.globalData.engine = engine
    wx.setStorageSync('engine', engine)
  },

  setFontSize(e) {
    const fontSize = e.currentTarget.dataset.size
    this.setData({ fontSize })
    app.globalData.fontSize = fontSize
    wx.setStorageSync('fontSize', fontSize)
  },

  setSpeechRate(e) {
    const speechRate = e.currentTarget.dataset.rate
    this.setData({ speechRate })
    app.globalData.speechRate = speechRate
    wx.setStorageSync('speechRate', speechRate)
  },

  clearHistory() {
    wx.showModal({
      title: t('clearHistory'),
      content: t('clearHistoryConfirm'),
      success(res) {
        if (res.confirm) {
          chatStore.clearAllChats()
          wx.showToast({ title: t('clearDone'), icon: 'success' })
        }
      },
    })
  },
})
```

- [ ] **Step 4: Commit**

```bash
git add miniprogram/pages/settings/
git commit -m "feat: redesign settings with font size, speech rate, clear history"
```

---

### Task 12: 集成测试 + 最终清理

**Files:**
- 全部页面

- [ ] **Step 1: 检查所有页面跳转路径正确**

验证路由：
- index → chat（`wx.navigateTo`）
- index → chat-list（`wx.navigateTo`）
- chat-list → chat（`wx.navigateTo`）
- chat-list → index（`wx.switchTab`）
- policies → policy-detail（`wx.navigateTo`）
- policy-detail → chat（`wx.navigateTo`）
- 所有 tabBar 页面互相切换

- [ ] **Step 2: 验证对话流程完整链路**

1. 首页点击热门问题 → 创建对话 → 跳转 chat 页 → 显示 AI 回答
2. chat 页继续追问 → 新消息追加到气泡列表
3. 返回首页 → 点击 📝 → 看到对话列表 → 点击回到对话
4. 删除对话 → 列表更新

- [ ] **Step 3: 验证录音流程**

1. 点击麦克风 → 按钮变红+脉冲
2. 再次点击 → 停止录音 → 识别 → 发送

- [ ] **Step 4: 删除不再使用的旧文件和引用**

确认 `pages/answer` 已完全移除，没有残留的 `navigateTo('/pages/answer/...')`。

- [ ] **Step 5: 最终提交**

```bash
git add -A
git commit -m "feat: complete frontend redesign — grassland green-gold theme with chat UI"
git push origin claude/voice-translation-plan-Qj7hu
```

---

## 执行顺序依赖

```
Task 1 (全局主题) ──┐
Task 2 (chat-store) ─┼─→ Task 5 (首页) ─→ Task 6 (聊天页) ─→ Task 7 (对话列表)
Task 3 (i18n) ───────┤
Task 4 (recorder) ───┘
                      ├─→ Task 8 (政策库) ─→ Task 9 (政策详情)
                      ├─→ Task 10 (电话)
                      ├─→ Task 11 (设置)
                      └─→ Task 12 (集成测试)
```

Task 1-4 可以并行执行，Task 5-11 依赖 Task 1-4 完成，Task 12 最后执行。
