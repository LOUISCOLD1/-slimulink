# 牧民智能政策助手 - 后端

## RAG 是什么？一句话解释

> **RAG = 先搜文档，再让AI基于文档回答。**
> 这样AI就不会瞎编了，因为它只能根据你给的政策文件来回答。

### 和直接问ChatGPT的区别

```
直接问ChatGPT:
  用户："内蒙古农村低保标准是多少？"
  ChatGPT："大约每人每年4000-5000元左右..."  ← 瞎编的，数字不对

我们的RAG:
  用户："内蒙古农村低保标准是多少？"
  第1步 → 从知识库搜到《农村低保政策.txt》中的相关段落
  第2步 → 把段落+问题一起发给AI
  AI："根据政策文件，标准为每人每年不低于6500元" ← 基于真实文件，准确
```

### RAG 的三个步骤

```
步骤1: 导入文档（只做一次）
  政策PDF/TXT → 切成小段 → 变成向量 → 存进数据库
  [indexer.py 干这个事]

步骤2: 用户提问时检索
  用户问题 → 变成向量 → 在数据库里找最相似的段落 → 返回Top3
  [retriever.py 干这个事]

步骤3: AI基于文档生成回答
  把Top3段落 + 用户问题 → 拼成Prompt → 发给智谱GLM → 得到回答
  [llm_service.py 干这个事]
```

---

## 快速开始

### 第1步：安装依赖

```bash
cd backend
pip install -r requirements.txt
```

> 第一次安装会比较慢（需要下载向量模型约400MB），之后会缓存。

### 第2步：配置API Key

```bash
cp .env.example .env
# 编辑 .env 文件，填入你的API Key
```

去哪拿API Key：
- **智谱AI（免费）**: https://open.bigmodel.cn → 注册 → API Keys
- **DeepSeek（备选）**: https://platform.deepseek.com → 注册 → API Keys

### 第3步：准备政策文档

把政策文档放到 `app/data/policies/` 目录下：

```
app/data/policies/
├── zh_农村低保政策.txt      ← 已有示例
├── zh_草原生态补贴.txt      ← 已有示例
├── zh_新农合医保.txt        ← 已有示例
├── zh_教育补助.txt          ← 你们自己加
├── zh_创业贷款.txt          ← 你们自己加
├── mn_低保政策.txt          ← 蒙语版本（教育系同学翻译）
└── ...
```

**文件内容就是政策纯文本**，直接从政府网站复制粘贴即可。
文件名格式：`zh_政策名.txt`（汉语）或 `mn_政策名.txt`（蒙语）。

### 第4步：构建知识库

```bash
python -m app.rag.indexer
```

你会看到：
```
==================================================
开始构建政策知识库...
==================================================
✅ 已读取: zh_农村低保政策.txt (486字)
✅ 已读取: zh_草原生态补贴.txt (523字)
✅ 已读取: zh_新农合医保.txt (612字)

📄 共 3 个文档，切成 8 个片段
🔄 正在向量化（第一次会下载模型，请等待）...
✅ 知识库构建完成！共 8 个片段已存入 chroma_db
```

### 第5步：启动服务

```bash
python -m app.main
```

打开浏览器访问 http://localhost:8000 ，看到欢迎信息就说明成功了。

### 第6步：测试问答

```bash
# 测试政策问答
curl -X POST http://localhost:8000/api/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "低保怎么申请？需要什么材料？"}'

# 测试语音合成
curl -X POST http://localhost:8000/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "低保标准为每人每年6500元"}' \
  --output test.mp3

# 测试政策卡片
curl http://localhost:8000/api/policies

# 测试联系电话
curl http://localhost:8000/api/contacts
```

---

## 项目结构

```
backend/
├── .env.example          # 环境变量模板（复制为.env使用）
├── requirements.txt      # Python依赖
├── chroma_db/           # 向量数据库（自动生成，不要删）
├── audio_cache/         # TTS生成的音频缓存
└── app/
    ├── main.py          # FastAPI 入口
    ├── core/
    │   └── config.py    # 配置读取
    ├── routers/         # API 接口
    │   ├── ask.py       # POST /api/ask - 政策问答
    │   ├── tts.py       # POST /api/tts - 文字转语音
    │   ├── policies.py  # GET /api/policies - 政策卡片
    │   └── contacts.py  # GET /api/contacts - 便民电话
    ├── services/        # 业务逻辑
    │   ├── llm_service.py  # AI问答（智谱/DeepSeek）
    │   └── tts_service.py  # 语音合成（Edge TTS）
    ├── rag/             # RAG 核心
    │   ├── indexer.py   # 文档导入（构建知识库）
    │   └── retriever.py # 文档检索（搜索知识库）
    └── data/
        ├── policies/    # 政策文档（.txt文件）
        ├── policy_cards.json  # 政策卡片数据
        └── contacts.json      # 联系电话数据
```

## 添加新政策

1. 把新政策文本放到 `app/data/policies/zh_新政策名.txt`
2. 重新运行 `python -m app.rag.indexer`
3. 如果需要卡片展示，编辑 `app/data/policy_cards.json` 添加一条
4. 重启服务 `python -m app.main`

就这么简单，不需要改任何代码。
