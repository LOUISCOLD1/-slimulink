import os
from dotenv import load_dotenv

load_dotenv()

# AI 大模型
ZHIPU_API_KEY = os.getenv("ZHIPU_API_KEY", "")
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")

# 讯飞语音
XFYUN_APP_ID = os.getenv("XFYUN_APP_ID", "")
XFYUN_API_KEY = os.getenv("XFYUN_API_KEY", "")

# 服务器
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))

# RAG 配置
CHROMA_DB_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "chroma_db")
POLICY_DOCS_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "policies")
EMBEDDING_MODEL = "shibing624/text2vec-base-chinese"  # 免费中文向量模型
CHUNK_SIZE = 500  # 每个文档片段的字符数
CHUNK_OVERLAP = 50  # 片段之间的重叠字符数
