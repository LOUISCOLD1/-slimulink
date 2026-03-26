"""
最简单的用法：把你找到的政策页面URL贴进来，一键爬取

使用方法：
  1. 打开浏览器，去政府网站找政策页面
  2. 把URL复制粘贴到下面的 URLS 列表里
  3. 运行 python scrape_urls.py
  4. 爬到的政策自动保存到 app/data/policies/ 目录

这是最靠谱的方式，因为你自己挑选过URL，确保是有用的政策。
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from scripts.scrape_policies import scrape_url
import time

# ============================================
# 把你找到的政策页面URL贴在这里👇
# ============================================

URLS = [
    # 示例URL（替换成真实的）：

    # 内蒙古自治区人民政府
    # "https://www.nmg.gov.cn/zwgk/zfxxgk/zfxxgkml/zcwj/xxx.html",

    # 内蒙古民政厅
    # "https://mzt.nmg.gov.cn/xxx",

    # 内蒙古农牧厅
    # "https://nmt.nmg.gov.cn/xxx",

    # 内蒙古医保局
    # "https://ybj.nmg.gov.cn/xxx",

    # 内蒙古教育厅
    # "https://jyt.nmg.gov.cn/xxx",

    # 各盟市政府（根据你们的目标地区）
    # 呼伦贝尔: "https://www.hulunbuir.gov.cn/xxx"
    # 锡林郭勒: "https://www.xlgl.gov.cn/xxx"
    # 通辽: "https://www.tongliao.gov.cn/xxx"
    # 赤峰: "https://www.chifeng.gov.cn/xxx"
    # 鄂尔多斯: "https://www.ordos.gov.cn/xxx"
]


# ============================================
# 推荐去这些网站找政策👇
# ============================================

RECOMMENDED_SITES = """
推荐去以下网站找政策（在浏览器打开，搜索相关政策，复制URL到上面的列表）：

1. 内蒙古自治区人民政府 - 政策文件
   https://www.nmg.gov.cn/zwgk/zfxxgk/zfxxgkml/zcwj/

2. 内蒙古民政厅（低保、救助、养老）
   https://mzt.nmg.gov.cn/

3. 内蒙古农牧厅（草原补贴、农机补贴）
   https://nmt.nmg.gov.cn/

4. 内蒙古医保局（医保、新农合）
   https://ybj.nmg.gov.cn/

5. 内蒙古人社厅（社保、就业、创业贷款）
   https://rst.nmg.gov.cn/

6. 内蒙古教育厅（教育补助、助学贷款）
   https://jyt.nmg.gov.cn/

7. 内蒙古住建厅（危房改造）
   https://zfhcxjs.nmg.gov.cn/

8. 内蒙古林草局（草原生态）
   https://lcj.nmg.gov.cn/

9. 各盟市政府网站（搜"惠民政策"、"补贴"等关键词）

操作步骤：
  → 打开上面的网站
  → 搜索关键词（如"低保"、"草原补贴"、"医保"）
  → 找到具体的政策文件页面
  → 复制页面URL
  → 粘贴到本文件的 URLS 列表中
  → 运行 python scrape_urls.py
"""


if __name__ == "__main__":
    if not URLS:
        print("=" * 60)
        print("⚠️  还没有添加URL！")
        print("=" * 60)
        print(RECOMMENDED_SITES)
        print("\n请把政策页面URL添加到 scrape_urls.py 的 URLS 列表中，然后重新运行。")
    else:
        print(f"🚀 开始爬取 {len(URLS)} 个政策页面...\n")
        success = 0
        for url in URLS:
            url = url.strip()
            if url and url.startswith("http"):
                scrape_url(url)
                success += 1
                time.sleep(2)

        print(f"\n✅ 完成！共处理 {success} 个URL")
        print(f"📁 文件保存在: {os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'app', 'data', 'policies'))}")
        print("\n下一步：运行 cd backend && python -m app.rag.indexer 构建知识库")
