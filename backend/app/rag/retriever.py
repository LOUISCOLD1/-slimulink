"""
RAG 第2步：根据用户问题，从知识库中检索最相关的政策片段

原理：
  用户问 "低保怎么申请"
  → 把这句话也变成向量（一串数字）
  → 在数据库里找"数字最接近"的政策片段
  → 返回最相关的3段政策原文
"""

import logging
import os
import threading

from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from app.core.config import CHROMA_DB_DIR, EMBEDDING_MODEL

logger = logging.getLogger(__name__)

# 全局缓存，避免每次请求都重新加载（线程安全）
_vectordb = None
_embeddings = None
_vectordb_lock = threading.Lock()


def get_vectordb() -> Chroma | None:
    """获取向量数据库实例（懒加载，只加载一次，线程安全）"""
    global _vectordb, _embeddings

    if _vectordb is not None:
        return _vectordb

    with _vectordb_lock:
        # 双重检查
        if _vectordb is not None:
            return _vectordb

        if not os.path.exists(CHROMA_DB_DIR):
            logger.warning("向量数据库不存在，请先运行: python3 -m app.rag.indexer")
            return None

        _embeddings = HuggingFaceEmbeddings(
            model_name=EMBEDDING_MODEL,
            model_kwargs={"device": "cpu"},
        )
        _vectordb = Chroma(
            persist_directory=CHROMA_DB_DIR,
            embedding_function=_embeddings,
        )
        logger.info("向量数据库已加载，共 %d 个片段", _vectordb._collection.count())

    return _vectordb


def search_policies(question: str, lang: str = "zh", top_k: int = 3) -> list[dict]:
    """
    根据用户问题搜索最相关的政策片段

    参数：
        question: 用户的问题，比如 "低保怎么申请"
        lang: 语言，"zh"=汉语，"mn"=蒙语
        top_k: 返回最相关的几条，默认3条

    返回：
        [
            {
                "content": "政策片段内容...",
                "source": "zh_低保政策.txt",
                "policy_name": "低保政策",
                "score": 0.85
            },
            ...
        ]
    """
    vectordb = get_vectordb()
    if vectordb is None:
        return []

    # 搜索时可以按语言过滤
    filter_dict = {"language": lang} if lang else None

    # similarity_search_with_score: 返回最相似的片段 + 相似度分数
    results = vectordb.similarity_search_with_score(
        query=question,
        k=top_k,
        filter=filter_dict,
    )

    policies = []
    for doc, score in results:
        policies.append({
            "content": doc.page_content,
            "source": doc.metadata.get("source", ""),
            "policy_name": doc.metadata.get("policy_name", ""),
            "score": round(float(score), 4),
        })

    return policies


# 测试用：直接运行看看搜索效果
# cd backend && python -m app.rag.retriever
if __name__ == "__main__":
    print("测试政策搜索...")
    results = search_policies("低保每个月多少钱")
    for i, r in enumerate(results):
        print(f"\n--- 第{i+1}条（相似度: {r['score']}）---")
        print(f"来源: {r['source']}")
        print(f"内容: {r['content'][:200]}...")
