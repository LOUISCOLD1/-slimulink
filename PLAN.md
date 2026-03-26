# 语音翻译软件 - 技术方案（AI驱动版）

## 项目背景

教育系团队提出的语言翻译项目，目标参加校级比赛争取第一名。
从PPT描述来看，类似SOA架构的信息系统，核心功能是**语音实时翻译**。

**核心理念**: 不做普通的"语音→直译→播放"，而是做**AI驱动的智能语音翻译**，
类似Typeless的思路——AI能理解说话人的真实意图，自动过滤口语噪音，输出自然流畅的翻译。

---

## 一、为什么必须用AI驱动？

### 传统翻译API的致命问题

口语和书面语差别巨大。人说话时会有大量填充词、重复、语序混乱：

```
用户说: "呃...就是那个，我想问一下，就是说，明天那个会议是几点来着？"

百度翻译: "Uh... that is, I want to ask, that is to say, what time is that meeting tomorrow?"
腾讯翻译: "Well... that one, I want to ask, that is to say, what time is that meeting tomorrow?"
AI 翻译:  "What time is tomorrow's meeting?"
```

**AI驱动的翻译能做到：**
1. **过滤填充词** - 自动去掉"呃、啊、那个、就是说、嗯"等口语噪音
2. **语义提炼** - 从啰嗦的口语中提取核心意思
3. **语序重组** - 口语语序混乱，AI能重组为目标语言的自然表达
4. **上下文理解** - 根据对话历史理解指代关系（"那个"指什么）
5. **语气保留** - 区分疑问、请求、命令等语气

**这就是比赛的最大亮点和技术差异点。**

---

## 二、国产大模型API成本分析（按量付费，非订阅）

所有国产大模型API都是**按量计费（按token/字符数）**，用多少付多少，不需要订阅。

### 价格对比

| 模型 | 输入价格 | 输出价格 | 翻译100句话成本 | 免费额度 |
|------|---------|---------|---------------|---------|
| **DeepSeek-V3** | ￥1/百万token | ￥2/百万token | **约￥0.01** | 注册送500万token |
| **通义千问Qwen-Plus** | ￥0.8/百万token | ￥2/百万token | 约￥0.01 | 注册送200万token |
| **智谱GLM-4-Flash** | **免费** | **免费** | **￥0** | **完全免费** |
| **Kimi (Moonshot)** | ￥12/百万token | ￥12/百万token | 约￥0.05 | 注册送15元 |
| 百度文心一言 | ￥8/百万token | ￥8/百万token | 约￥0.03 | 有免费额度 |

> **关键数据**: 一句话平均约50个token，翻译一句话成本约 ￥0.0001（万分之一分钱）。
> 整个比赛开发+演示期间，总共也就花几毛钱到几块钱。

### 推荐组合（几乎零成本）

| 优先级 | 方案 | 成本 |
|--------|------|------|
| **首选** | **智谱GLM-4-Flash** | 完全免费，质量够用 |
| **次选** | **DeepSeek-V3** | 注册送500万token，约等于免费 |
| 备选 | 通义千问Qwen-Plus | 注册送额度，极低成本 |

---

## 三、推荐方案：AI驱动智能翻译

### 核心流程

```
用户说话 → 语音识别(STT) → AI智能翻译(LLM) → 语音合成(TTS) → 播放译文

                         AI翻译的内部流程:
                    ┌──────────────────────┐
  原始语音文本 ──→  │ 1. 过滤填充词/口语噪音 │
                    │ 2. 提炼核心语义       │
                    │ 3. 翻译为目标语言      │
                    │ 4. 润色为自然表达      │
                    └──────────────────────┘
                              ↓
                      干净、自然的译文
```

### 技术栈

```
前端: React + TypeScript + Tailwind CSS
后端: Python FastAPI
语音识别: 浏览器 Web Speech API（免费）/ 讯飞语音（备选）
翻译引擎: 智谱GLM-4-Flash（免费）+ DeepSeek-V3（几乎免费）
语音合成: Edge TTS（免费，多语言多音色）
部署: Vercel(前端免费) + 轻量服务器
```

### AI翻译Prompt设计（核心竞争力）

```python
TRANSLATE_PROMPT = """你是一个专业的实时语音翻译助手。

用户的输入是语音识别的原始文本，可能包含：
- 口语填充词（呃、嗯、啊、那个、就是说、basically、you know...）
- 重复和犹豫（我想、我想说的是...）
- 不完整的句子或语序混乱

你的任务：
1. 理解说话人的真实意图
2. 过滤掉所有口语噪音和填充词
3. 翻译为{target_language}
4. 输出自然、地道的译文

只输出翻译结果，不要解释。

{context}
"""
```

### 系统架构（SOA风格）

```
┌─────────────────────────────────────────────┐
│                  前端 Web App                │
│    React + Web Speech API + 音频播放         │
└──────────────────┬──────────────────────────┘
                   │ REST API / WebSocket
┌──────────────────▼──────────────────────────┐
│              API Gateway (FastAPI)           │
├─────────────┬──────────────┬────────────────┤
│  STT 服务   │  AI翻译服务   │  TTS 服务      │
│  Web Speech │  智谱/DeepSeek │  Edge TTS     │
│  API(免费)  │  (免费/极低)   │  (免费)        │
└─────────────┴──────────────┴────────────────┘
         ↑                          ↑
    浏览器原生              Python edge-tts库
```

---

## 四、对比传统方案的优势

| 对比项 | 传统翻译API（百度/腾讯） | AI驱动翻译（本方案） |
|--------|----------------------|-------------------|
| 口语填充词处理 | 原样翻译，效果差 | **自动过滤，输出干净** |
| 语序重组 | 不处理 | **自动重组为自然表达** |
| 上下文理解 | 无上下文 | **记忆对话历史** |
| 语气保留 | 机械翻译 | **理解并保留说话语气** |
| 长句处理 | 逐句直译 | **理解整体意思后翻译** |
| 创新性 | 无（人人都能调API） | **AI驱动，有技术亮点** |
| 成本 | 免费 | **也几乎免费** |

---

## 五、开发计划（2-3周）

### 第1周：核心功能
- [ ] 搭建项目框架（前端React + 后端FastAPI）
- [ ] 实现语音录制（Web Speech API）
- [ ] 集成AI翻译引擎（智谱GLM-4-Flash / DeepSeek）
- [ ] 设计翻译Prompt（口语过滤+语义提炼+自然翻译）
- [ ] 集成 Edge TTS 实现语音合成
- [ ] 完成基础翻译链路：说话→识别→AI翻译→播报

### 第2周：功能完善
- [ ] 对话上下文记忆（AI记住之前说了什么）
- [ ] 双人对话模式（面对面翻译场景）
- [ ] 多语言支持（中英日韩法德等）
- [ ] 翻译历史记录和回放
- [ ] UI美化：显示原文→清理后文本→译文 三栏对比

### 第3周：比赛准备
- [ ] 对比Demo：同一句话，传统翻译 vs AI翻译 并排展示
- [ ] 性能优化（流式输出，降低延迟）
- [ ] 异常处理和稳定性测试
- [ ] 准备演示Demo和PPT

---

## 六、差异化亮点（拿分关键）

1. **AI口语净化** - 自动去除"呃啊嗯那个"等填充词，这是核心卖点
2. **三栏对比展示** - 原始语音文本 → AI净化后文本 → 翻译结果，直观展示AI价值
3. **对比演示** - 同一句口语，传统API翻译 vs AI翻译并排对比，效果高下立判
4. **上下文记忆** - AI记住对话历史，翻译更准（比如"它"指什么）
5. **双人实时对话** - 两人面对面，各说各的语言，AI实时翻译

---

## 七、成本估算

| 项目 | 费用 |
|------|------|
| Web Speech API（语音识别） | 免费（浏览器原生） |
| 智谱GLM-4-Flash（AI翻译） | **完全免费** |
| DeepSeek-V3（备选翻译） | 注册送500万token ≈ 免费 |
| Edge TTS（语音合成） | 免费 |
| 前端部署（Vercel） | 免费 |
| 后端服务器 | 免费（学生优惠） |
| **总计** | **￥0 ~ ￥几块钱** |

> 即使免费额度用完，DeepSeek翻译1000句话也只要￥0.1（一毛钱）。
> 这不是订阅制，是按量付费，用多少扣多少，没有月费。

---

## 八、技术风险与应对

| 风险 | 应对策略 |
|------|---------|
| AI翻译延迟（1-2秒） | 流式输出(streaming)，边生成边显示 |
| 免费API限流 | 多引擎自动切换（智谱→DeepSeek→通义千问） |
| 语音识别不准 | 显示识别文本，允许手动修正后再翻译 |
| 比赛现场网络差 | 准备录屏备份 + 提前缓存常见演示句 |
| AI输出不稳定 | Prompt工程优化 + 输出格式约束 |

---

## 九、API接入示例

### 智谱GLM-4-Flash（免费，推荐首选）

```python
from zhipuai import ZhipuAI

client = ZhipuAI(api_key="your_key")  # 注册即获取

def ai_translate(text: str, target_lang: str, context: list = []):
    messages = [
        {"role": "system", "content": f"""你是实时语音翻译助手。
将口语文本翻译为{target_lang}。自动过滤填充词(呃/嗯/那个/就是说等)，
提炼核心语义，输出自然地道的译文。只输出译文。"""},
        *context,  # 历史对话上下文
        {"role": "user", "content": text}
    ]
    response = client.chat.completions.create(
        model="glm-4-flash",  # 免费模型
        messages=messages,
        stream=True  # 流式输出，降低延迟
    )
    result = ""
    for chunk in response:
        if chunk.choices[0].delta.content:
            result += chunk.choices[0].delta.content
            yield chunk.choices[0].delta.content  # 流式返回
```

### DeepSeek-V3（极低成本备选）

```python
from openai import OpenAI  # DeepSeek兼容OpenAI SDK

client = OpenAI(
    api_key="your_key",
    base_url="https://api.deepseek.com"
)

def ai_translate_deepseek(text: str, target_lang: str):
    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {"role": "system", "content": f"语音翻译助手。过滤口语噪音，翻译为{target_lang}。只输出译文。"},
            {"role": "user", "content": text}
        ],
        stream=True
    )
    for chunk in response:
        if chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content
```

---

## 总结

**用AI大模型做翻译引擎，而非传统翻译API**——这是本项目的核心竞争力。

- 成本：智谱GLM-4-Flash完全免费，DeepSeek几乎免费，都是按量付费非订阅
- 效果：AI能过滤口语噪音、理解上下文、输出自然译文，远超传统API
- 比赛亮点：演示时做一个"传统翻译 vs AI翻译"的对比，效果一目了然
- 开发量：2-3周，两个CS同学完全够

两个CS同学分工建议：
- 同学A：前端 + 语音识别 + TTS + UI交互
- 同学B：后端 + AI翻译引擎 + Prompt优化 + 多引擎切换
