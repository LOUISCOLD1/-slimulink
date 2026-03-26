"""
内蒙古政府政策爬虫

爬取内蒙古自治区政府网站的公开政策文件，保存为txt供RAG使用。

使用方法：
  pip install requests beautifulsoup4
  python scrape_policies.py

爬取的是公开的政府政策信息，合法合规。
"""

import requests
from bs4 import BeautifulSoup
import os
import re
import time
import json

# ============================================
# 配置
# ============================================

# 政策文件保存目录
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "app", "data", "policies")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 请求头，模拟正常浏览器访问
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.9",
}

# 每次请求间隔（秒），别太快，对服务器友好
REQUEST_DELAY = 2

# ============================================
# 爬取目标：内蒙古政府公开政策页面
# ============================================

# 你可以在这里添加更多政策页面URL
# 格式：{"name": "政策名称", "url": "页面地址"}
POLICY_SOURCES = [
    # --- 内蒙古自治区人民政府 - 政策文件 ---
    {
        "name": "内蒙古政府政策文件列表",
        "type": "list",  # list=列表页，需要进入每条详情
        "url": "https://www.nmg.gov.cn/zwgk/zfxxgk/zfxxgkml/zcwj/",
        "list_selector": "a[href*='/art/']",  # 列表中每条政策的链接选择器
        "max_pages": 3,  # 最多爬几页
    },

    # --- 直接指定的政策页面（最靠谱的方式）---
    # 如果你找到了具体的政策页面，直接把URL贴在这里
    # {
    #     "name": "某某政策",
    #     "type": "page",
    #     "url": "https://www.nmg.gov.cn/zwgk/xxx",
    # },
]

# ============================================
# 关键词：和农牧民相关的政策关键词
# 爬到的文章标题必须包含至少一个关键词才会保存
# ============================================

POLICY_KEYWORDS = [
    # 补贴类
    "补贴", "补助", "奖励", "补偿", "资助", "扶持", "惠民",
    # 社会保障类
    "低保", "五保", "特困", "救助", "保障", "养老", "医保",
    "医疗保险", "社会保险", "新农合",
    # 农牧业
    "草原", "牧区", "牧民", "农牧", "畜牧", "草畜", "禁牧",
    "农村", "农业", "种植", "农机",
    # 教育
    "教育", "助学", "上学", "学生", "入学",
    # 就业创业
    "创业", "就业", "贷款", "小额信贷",
    # 住房
    "住房", "危房", "安居",
]


def is_policy_relevant(title: str) -> bool:
    """检查标题是否和农牧民政策相关"""
    return any(kw in title for kw in POLICY_KEYWORDS)


def clean_text(text: str) -> str:
    """清理网页文本"""
    # 去掉多余空白
    text = re.sub(r'\n\s*\n', '\n\n', text)
    text = re.sub(r'[ \t]+', ' ', text)
    # 去掉常见的网页垃圾
    for noise in ["来源：", "发布时间：", "分享到：", "【字体：", "打印", "关闭",
                   "扫一扫", "下载", "相关链接", "Copyright", "版权所有",
                   "主办单位", "承办单位", "网站标识码", "蒙ICP备"]:
        idx = text.find(noise)
        if idx > 0 and idx > len(text) * 0.8:  # 只去掉末尾的垃圾
            text = text[:idx]
    return text.strip()


def fetch_page(url: str) -> BeautifulSoup | None:
    """请求网页并返回解析后的soup"""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        resp.encoding = resp.apparent_encoding  # 自动检测编码
        if resp.status_code == 200:
            return BeautifulSoup(resp.text, "html.parser")
        else:
            print(f"  ⚠️  HTTP {resp.status_code}: {url}")
            return None
    except Exception as e:
        print(f"  ❌ 请求失败: {e}")
        return None


def extract_article_content(soup: BeautifulSoup) -> tuple[str, str]:
    """
    从政策详情页提取标题和正文

    适配大多数政府网站的页面结构
    """
    # 尝试多种标题选择器
    title = ""
    for selector in ["h1", ".article-title", ".news-title", "#title",
                      ".bt", ".content-title", "title"]:
        tag = soup.select_one(selector)
        if tag and tag.get_text(strip=True):
            title = tag.get_text(strip=True)
            break

    # 尝试多种正文选择器
    content = ""
    for selector in [".article-content", ".news-content", "#content",
                      ".TRS_Editor", ".content", ".neirong", ".text",
                      "article", ".article-body", ".main-content"]:
        tag = soup.select_one(selector)
        if tag:
            # 移除脚本和样式
            for s in tag.find_all(["script", "style", "nav", "footer"]):
                s.decompose()
            content = tag.get_text("\n", strip=True)
            if len(content) > 100:  # 正文至少100字才算有效
                break

    # 如果上面都没找到，尝试取最大的文本块
    if len(content) < 100:
        all_divs = soup.find_all("div")
        max_len = 0
        for div in all_divs:
            text = div.get_text("\n", strip=True)
            if len(text) > max_len and len(text) > 100:
                max_len = len(text)
                content = text

    content = clean_text(content)
    return title, content


def save_policy(title: str, content: str, source_url: str):
    """保存政策文件"""
    if not title or len(content) < 50:
        return False

    # 生成安全的文件名
    safe_name = re.sub(r'[<>:"/\\|?*\s]', '_', title)[:60]
    filename = f"zh_{safe_name}.txt"
    filepath = os.path.join(OUTPUT_DIR, filename)

    # 如果已存在就跳过
    if os.path.exists(filepath):
        print(f"  ⏭️  已存在: {filename}")
        return False

    # 在文件开头加上标题和来源
    full_content = f"{title}\n\n{content}\n\n来源：{source_url}"

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(full_content)

    print(f"  ✅ 已保存: {filename} ({len(content)}字)")
    return True


def scrape_policy_page(url: str, name: str = ""):
    """爬取单个政策详情页"""
    print(f"\n📄 正在爬取: {name or url}")
    soup = fetch_page(url)
    if not soup:
        return

    title, content = extract_article_content(soup)
    if title and content:
        save_policy(title, content, url)
    else:
        print(f"  ⚠️  未能提取到有效内容")


def scrape_policy_list(source: dict):
    """爬取政策列表页，再进入每条详情"""
    print(f"\n📋 正在爬取列表: {source['name']}")
    print(f"   URL: {source['url']}")

    soup = fetch_page(source["url"])
    if not soup:
        return

    # 找到所有政策链接
    selector = source.get("list_selector", "a")
    links = soup.select(selector)
    print(f"   找到 {len(links)} 条链接")

    saved_count = 0
    max_items = source.get("max_pages", 3) * 20  # 大约每页20条

    for link in links[:max_items]:
        href = link.get("href", "")
        title = link.get_text(strip=True)

        if not href or not title:
            continue

        # 补全相对URL
        if href.startswith("/"):
            from urllib.parse import urljoin
            href = urljoin(source["url"], href)
        elif not href.startswith("http"):
            continue

        # 检查标题是否和农牧民相关
        if not is_policy_relevant(title):
            continue

        print(f"\n  → {title}")
        time.sleep(REQUEST_DELAY)  # 礼貌延迟

        detail_soup = fetch_page(href)
        if detail_soup:
            _, content = extract_article_content(detail_soup)
            if content and len(content) > 50:
                if save_policy(title, content, href):
                    saved_count += 1

    print(f"\n   ✅ 本列表共保存 {saved_count} 条政策")


# ============================================
# 通用爬虫：爬取任意URL的政策内容
# ============================================

def scrape_url(url: str):
    """
    爬取任意政策页面URL

    用法：
        from scrape_policies import scrape_url
        scrape_url("https://www.nmg.gov.cn/xxx/xxx.html")

    或者命令行：
        python scrape_policies.py https://url1 https://url2 ...
    """
    scrape_policy_page(url)


def scrape_search(keyword: str, site: str = "nmg.gov.cn"):
    """
    通过百度搜索爬取指定关键词的政策

    用法：
        from scrape_policies import scrape_search
        scrape_search("内蒙古农村低保标准2024")
    """
    print(f"\n🔍 搜索: {keyword} site:{site}")

    search_url = f"https://www.baidu.com/s?wd={keyword}+site:{site}"
    soup = fetch_page(search_url)
    if not soup:
        print("  搜索请求失败")
        return

    # 提取搜索结果中的链接
    results = soup.select("h3.t a")
    print(f"   找到 {len(results)} 条搜索结果")

    for result in results[:10]:
        href = result.get("href", "")
        title = result.get_text(strip=True)

        if not href:
            continue

        # 百度的链接需要跳转获取真实URL
        try:
            real_resp = requests.head(href, headers=HEADERS, timeout=10, allow_redirects=True)
            real_url = real_resp.url
        except Exception:
            continue

        if site not in real_url:
            continue

        print(f"\n  → {title}")
        time.sleep(REQUEST_DELAY)
        scrape_policy_page(real_url, title)


# ============================================
# 批量爬取：一次爬取多个关键词
# ============================================

# 推荐搜索的关键词列表
SEARCH_KEYWORDS = [
    "内蒙古 农村低保 标准 2024",
    "内蒙古 草原生态保护补助 奖励",
    "内蒙古 城乡居民医疗保险 缴费",
    "内蒙古 农村危房改造 补助",
    "内蒙古 教育资助 政策",
    "内蒙古 创业担保贷款",
    "内蒙古 养老保险 农牧民",
    "内蒙古 残疾人 补贴",
    "内蒙古 草畜平衡 补贴",
]


def scrape_all():
    """批量爬取所有配置的来源"""
    print("=" * 60)
    print("🚀 开始爬取内蒙古农牧民相关政策")
    print("=" * 60)

    # 1. 爬取配置的政策源
    for source in POLICY_SOURCES:
        if source.get("type") == "list":
            scrape_policy_list(source)
        else:
            scrape_policy_page(source["url"], source["name"])
        time.sleep(REQUEST_DELAY)

    # 2. 通过搜索引擎爬取
    print("\n" + "=" * 60)
    print("🔍 通过搜索引擎查找更多政策...")
    print("=" * 60)

    for keyword in SEARCH_KEYWORDS:
        scrape_search(keyword)
        time.sleep(REQUEST_DELAY * 2)  # 搜索引擎要更慢一点

    # 统计结果
    txt_files = [f for f in os.listdir(OUTPUT_DIR) if f.endswith(".txt")]
    print("\n" + "=" * 60)
    print(f"✅ 爬取完成！共保存 {len(txt_files)} 个政策文件")
    print(f"📁 文件位置: {os.path.abspath(OUTPUT_DIR)}")
    print("=" * 60)
    print("\n下一步：运行 python -m app.rag.indexer 构建知识库")


# ============================================
# 命令行入口
# ============================================

if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1:
        # 如果传了URL参数，只爬指定URL
        # python scrape_policies.py https://url1 https://url2
        for url in sys.argv[1:]:
            if url.startswith("http"):
                scrape_url(url)
            else:
                # 当作关键词搜索
                scrape_search(url)
            time.sleep(REQUEST_DELAY)
    else:
        # 不传参数就全量爬取
        scrape_all()
