"""
RAG 第1步：把政策文档导入向量数据库

原理很简单：
1. 读取 data/policies/ 目录下的所有 .txt 文件
2. 把每个文件切成小段（每段约500字）
3. 用AI把每段文字变成一串数字（向量/embedding）
4. 存进 Chroma 向量数据库

之后用户提问时，就能通过"数字相似度"找到最相关的政策片段。
"""

import logging
import os
import glob
from langchain.text_splitter import RecursiveCharacterTextSplitter

logger = logging.getLogger(__name__)
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from app.core.config import CHROMA_DB_DIR, POLICY_DOCS_DIR, EMBEDDING_MODEL, CHUNK_SIZE, CHUNK_OVERLAP


def get_embeddings():
    """加载中文向量模型（第一次会自动下载，约400MB，之后会缓存）"""
    return HuggingFaceEmbeddings(
        model_name=EMBEDDING_MODEL,
        model_kwargs={"device": "cpu"},  # 用CPU就行，不需要GPU
    )


def load_policy_files() -> list[dict]:
    """
    读取 data/policies/ 下所有 .txt 文件

    文件命名规则：
      zh_低保政策.txt      → 汉语政策
      mn_低保政策.txt      → 蒙语政策
      zh_草原补贴.txt      → 汉语政策

    文件内容就是政策的纯文本，直接从政府网站复制粘贴即可。
    """
    documents = []
    txt_files = glob.glob(os.path.join(POLICY_DOCS_DIR, "*.txt"))

    if not txt_files:
        logger.warning("在 %s 下没有找到 .txt 文件", POLICY_DOCS_DIR)
        logger.warning("请先把政策文档放进去，格式：zh_政策名.txt 或 mn_政策名.txt")
        return []

    for filepath in txt_files:
        filename = os.path.basename(filepath)
        # 从文件名判断语言：zh_ 开头是汉语，mn_ 开头是蒙语
        if filename.startswith("zh_"):
            lang = "zh"
        elif filename.startswith("mn_"):
            lang = "mn"
        else:
            lang = "zh"  # 默认汉语

        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read().strip()

        if content:
            documents.append({
                "content": content,
                "metadata": {
                    "source": filename,
                    "language": lang,
                    "policy_name": filename.replace("zh_", "").replace("mn_", "").replace(".txt", ""),
                },
            })
            logger.info("已读取: %s (%d字)", filename, len(content))

    return documents


def build_vector_db():
    """
    核心函数：把政策文档切片并存入向量数据库

    运行一次就行，之后只要政策没变就不需要重新运行。
    新增政策文档后重新运行即可更新。
    """
    logger.info("=" * 50)
    logger.info("开始构建政策知识库...")
    logger.info("=" * 50)

    # 第1步：读取所有政策文件
    documents = load_policy_files()
    if not documents:
        return None

    # 第2步：把长文档切成小段
    # 为什么要切？因为AI一次只能处理有限的文字，
    # 而且小段更容易精确匹配用户的问题
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\n\n", "\n", "。", "；", " "],  # 优先在段落/句子边界切
    )

    all_chunks = []
    all_metadatas = []

    for doc in documents:
        chunks = splitter.split_text(doc["content"])
        for chunk in chunks:
            all_chunks.append(chunk)
            all_metadatas.append(doc["metadata"])

    logger.info("共 %d 个文档，切成 %d 个片段", len(documents), len(all_chunks))

    # 第3步：向量化并存入数据库
    logger.info("正在向量化（第一次会下载模型，请等待）...")
    embeddings = get_embeddings()

    # 如果已有旧数据库，先删掉重建
    if os.path.exists(CHROMA_DB_DIR):
        import shutil
        shutil.rmtree(CHROMA_DB_DIR)

    vectordb = Chroma.from_texts(
        texts=all_chunks,
        metadatas=all_metadatas,
        embedding=embeddings,
        persist_directory=CHROMA_DB_DIR,
    )

    logger.info("知识库构建完成！共 %d 个片段已存入 %s", len(all_chunks), CHROMA_DB_DIR)
    return vectordb


# 直接运行这个文件就能构建知识库：
# cd backend && python -m app.rag.indexer
if __name__ == "__main__":
    build_vector_db()
