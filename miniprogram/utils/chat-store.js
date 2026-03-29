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

function getAllChats() {
  const chats = wx.getStorageSync(STORAGE_KEY) || []
  return chats.sort((a, b) => b.updatedAt - a.updatedAt)
}

function getChat(chatId) {
  const chats = wx.getStorageSync(STORAGE_KEY) || []
  return chats.find(c => c.id === chatId) || null
}

function createChat(firstMessage) {
  const chats = wx.getStorageSync(STORAGE_KEY) || []
  const now = Date.now()
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

function deleteChat(chatId) {
  let chats = wx.getStorageSync(STORAGE_KEY) || []
  chats = chats.filter(c => c.id !== chatId)
  wx.setStorageSync(STORAGE_KEY, chats)
}

function clearAllChats() {
  wx.removeStorageSync(STORAGE_KEY)
}

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
