# 牧智通 - 微信小程序前端

## 快速开始

### 1. 安装微信开发者工具

下载地址：https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html

### 2. 导入项目

1. 打开微信开发者工具
2. 选择「导入项目」
3. 目录选择本项目的 `miniprogram/` 文件夹
4. AppID 填测试号或你自己申请的小程序AppID
5. 点击「导入」

### 3. 配置后端地址

打开 `app.js`，修改 `baseUrl` 为你的后端服务器地址：

```js
globalData: {
  baseUrl: 'http://你的服务器IP:80',
}
```

或者在小程序的「设置」页面输入服务器地址。

### 4. 开发调试

在开发者工具中点击「编译」即可预览。

> **注意**：开发阶段请在开发者工具的「详情」→「本地设置」中勾选：
> - 「不校验合法域名」（否则无法调用本地/HTTP后端）

### 5. TabBar图标

`static/images/` 下需要8个图标文件（普通+选中状态各4个）。
你可以用任何图标，推荐从 https://www.iconfont.cn 下载。

需要的文件：
- tab-home.png / tab-home-active.png
- tab-policy.png / tab-policy-active.png
- tab-phone.png / tab-phone-active.png
- tab-settings.png / tab-settings-active.png

图标尺寸：81x81 像素，PNG格式。

## 页面说明

| 页面 | 路径 | 功能 |
|------|------|------|
| 首页 | pages/index | 语音/文字问答，热门问题 |
| 回答页 | pages/answer | 展示AI回答，语音播放 |
| 政策库 | pages/policies | 政策卡片列表，分类筛选 |
| 政策详情 | pages/policy-detail | 大字版政策详情，蒙汉对照 |
| 便民电话 | pages/contacts | 一键拨号 |
| 设置 | pages/settings | 语言切换、AI引擎、服务器地址 |
