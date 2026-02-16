# Rubber — 产品设计文档

> "We only accept rubbish." — 一个让科研人放下焦虑、拥抱失败的学术社区平台
>
> 命名灵感：Rubber = Rubbish 的变体，致敬 Nature / Science 的「单词即品牌」命名风格

---

## 1. 产品定位

### 1.1 一句话描述

Rubber（源自 Rubbish 的谐音变体，致敬 Nature / Science 的单词品牌命名）——一个以"学术垃圾"为主题的开放投稿与同行评议社区，对标 OpenReview 的核心学术工作流，叠加 Reddit/即刻式的轻社交互动，为科研人提供发表失败实验、吐槽科研日常、进行非严肃学术讨论的空间。

### 1.2 核心用户画像

| 角色 | 描述 | 核心需求 |
|------|------|---------|
| 投稿者 | 硕博研究生、博后、青年教师 | 发表被拒稿件/失败实验/科研吐槽，获得共鸣 |
| 评审员 | 任何注册用户（无资质门槛） | 以搞笑方式"审稿"，参与社区互动 |
| 围观者 | 对科研文化感兴趣的泛学术群体 | 浏览有趣内容，收藏/转发 |
| 子刊主编 | 社区活跃用户，自荐或推选 | 管理特定学科板块，策划特色活动 |

### 1.3 与 OpenReview 的对比

| 维度 | OpenReview | Rubber |
|------|-----------|-----------------|
| 定位 | 严肃学术评审 | 娱乐解压社区 |
| 投稿门槛 | PDF 论文 | LaTeX (首选, 基于 arXiv 模板) / PDF / Markdown / 图片 |
| 评审制度 | 指派审稿人、盲审 | 开放评审、"闭眼盲审"等趣味模式 |
| 评审结果 | Accept / Reject | 🗑️ Certified Rubbish / ♻️ Too Good, Rejected |
| 互动模式 | 结构化评审讨论 | 自由评论 + 点赞 + 收藏 + 表情回应 |
| 社区功能 | 无 | 用户主页、成就系统、排行榜 |

---

## 2. 信息架构

```
Rubber
├── 🏠 首页 (Feed)
│   ├── 推荐 (算法推荐 + 编辑精选)
│   ├── 最新投稿
│   ├── 热门讨论
│   └── 各子刊 Tab 切换
│
├── 📝 投稿 (Submit)
│   ├── 选择子刊 (Rubber Chemistry / Communications / ...)
│   ├── 填写元数据 (标题/摘要/关键词/作者)
│   ├── 上传内容 (LaTeX 在线编辑 / PDF / Markdown / 图片)
│   └── 选择评审模式
│
├── 📄 论文详情页 (Paper View)
│   ├── 论文内容展示 (PDF 预览 / 正文渲染)
│   ├── 元数据 (作者/日期/子刊/标签)
│   ├── 评审区 (结构化评审意见)
│   │   ├── 官方评审 (Rating + 文字意见)
│   │   └── 作者回复 (Rebuttal)
│   ├── 自由讨论区 (开放评论)
│   └── 互动栏 (点赞/收藏/分享/表情反应)
│
├── 📚 子刊 (Venues)
│   ├── 子刊主页 (介绍/规则/主编团队)
│   ├── 投稿列表 (按状态筛选)
│   └── 子刊排行榜
│
├── 👤 用户中心 (Profile)
│   ├── 个人主页 (投稿/评审/成就)
│   ├── 收藏夹
│   ├── 通知中心
│   └── 设置
│
└── 🔍 搜索 & 发现
    ├── 全文搜索
    ├── 标签浏览
    └── 排行榜 (最佳垃圾 / 最佳评审 / 活跃用户)
```

---

## 3. 核心流程设计

### 3.1 投稿流程

```
投稿者创建稿件
    │
    ▼
选择子刊 + 填写元数据
    │
    ▼
上传内容 (LaTeX / PDF / Markdown / 图片)
    │
    ▼
选择评审模式 ──┬── 🎲 闭眼盲审 (随机分配评审员，评审员"闭眼"打分)
               ├── 🌍 开放评审 (所有人可提交评审意见)
               └── 🚀 极速收录 (跳过评审，直接标记为 Certified Rubbish)
    │
    ▼
稿件进入对应子刊 (状态: Under Review / Open for Discussion / Published)
    │
    ▼
评审完成 → 结果公布
    ├── 🗑️ Certified Rubbish (恭喜！经认证的高质量垃圾)
    ├── ♻️ Recyclable (有一定回收价值，建议投正刊)
    └── ❌ Too Good, Rejected (太好了，不符合本刊收录标准)
```

### 3.2 评审流程 (对标 OpenReview)

```
评审员打开待审稿件
    │
    ▼
填写结构化评审表 ──┬── 垃圾程度评分 (1-10, 10 为顶级垃圾)
                   ├── 无用程度评分 (1-10)
                   ├── 娱乐价值评分 (1-10)
                   ├── 摘要评审意见 (文字)
                   ├── 优点 (Strengths)
                   ├── 缺点 (Weaknesses) ← 在这里是褒义
                   └── 总体推荐 (Certified Rubbish / Recyclable / Too Good)
    │
    ▼
评审意见公开 (可选匿名 / 实名)
    │
    ▼
作者可提交 Rebuttal (反驳 / 自嘲回复)
    │
    ▼
社区可对评审意见 点赞/评论
```

#### 3.2.1 评审决定机制

**自动决定规则 (闭眼盲审 & 开放评审)**

| 条件 | 结果 |
|------|------|
| ≥ 2 份评审且多数推荐一致 | 自动采纳多数意见作为最终决定 |
| ≥ 2 份评审但无多数一致 (如 3 人各不同) | 标记为 "争议中", 由子刊主编裁定 |
| 仅 1 份评审且超过 14 天无新评审 | 自动转为开放评审, 延长 7 天 |
| 开放评审模式: ≥ 3 份评审 | 取多数意见; 若无多数则取平均垃圾分最高的推荐 |
| 极速收录模式 | 跳过评审, 直接标记为 Certified Rubbish |

**子刊主编裁定权**

- 主编可在任何时候手动覆盖自动决定 (需填写裁定理由)
- 主编裁定后, 系统发送通知给作者和所有评审员
- 裁定理由公开展示在评审区

**冷启动阶段特殊规则**

- 子刊活跃评审员 < 5 人时: 闭眼盲审自动降级为开放评审
- 新用户 (karma < 10) 的评审权重为 0.5, 避免低质量评审主导结果
- 主编可手动指派评审员, 不受 karma 加权随机限制

### 3.3 社区互动流程

```
任何用户浏览论文详情页
    │
    ├── 在评审区下方自由评论 (不需要填写结构化评审表)
    ├── 使用 Emoji 反应 (🗑️💩🔥😂🏆♻️)
    ├── 点赞 (Up / Down)
    ├── 收藏到个人收藏夹
    ├── 分享链接 / 生成分享卡片
    └── @提及其他用户
```

---

## 4. 页面设计要点

### 4.1 首页 Feed

- **布局**: 双栏瀑布流 (桌面端) / 单栏卡片流 (移动端)
- **卡片信息**: 标题、子刊标签、摘要前两行、垃圾评分、互动数据 (评论数/点赞数)
- **筛选**: 全部 / 按子刊 / 按评审状态 / 按时间
- **排序**: 热门 (综合评分+互动) / 最新 / 最高垃圾分 / 编辑精选

### 4.2 论文详情页

左侧 70%：论文内容渲染区

- LaTeX 投稿: 展示编译后的 PDF (服务端预编译, `react-pdf` 渲染)
- PDF 投稿: 使用 `react-pdf` 或 `pdf.js` 预览
- Markdown 内容: 直接渲染 (支持 KaTeX 数学公式)
- 图片内容: 画廊展示

右侧 30%：侧边栏

- 论文元数据卡片
- 互动按钮 (点赞/收藏/分享)
- 垃圾评分雷达图
- 相关推荐

下方全宽：评审 & 讨论 Tab 切换

- Tab 1: 正式评审 (结构化，类 OpenReview)
- Tab 2: 自由讨论 (类 Reddit 评论树)

### 4.3 投稿页

- 分步表单 (Step 1: 选子刊 → Step 2: 填信息 → Step 3: 上传内容 → Step 4: 选评审模式 → Step 5: 预览提交)
- **LaTeX 在线编辑器 (首选)**: 基于 Rubber 模板 (arXiv 模板修改), 支持中文 (xeCJK), 实时预览编译后 PDF
- Markdown 编辑器 (轻量替代, 推荐 Tiptap, 支持 KaTeX 公式)
- PDF 拖拽上传 (已有编译好的 PDF 可直接上传)
- 图片上传 (快速投稿模式)
- 实时预览 (LaTeX 模式: 编译后 PDF; Markdown 模式: 即时渲染)

### 4.4 用户 Profile

- 投稿统计 (总投稿数 / Certified Rubbish 数 / 被拒数)
- 评审统计
- 成就徽章墙
- 个人动态时间线
- 收藏夹

### 4.5 移动端适配方案

移动端是核心使用场景 (科研人通勤/摸鱼时浏览), MVP 阶段即需重点设计。

**全局适配原则:**

- 采用 Mobile-First 响应式设计, 断点: `sm:640px` / `md:768px` / `lg:1024px`
- 底部 Tab 导航栏 (移动端) 替代顶部 Navbar: 首页 / 投稿 / 搜索 / 通知 / 我的
- 所有触摸目标 ≥ 44px, 按钮间距 ≥ 8px

**各页面移动端差异:**

| 页面 | 桌面端 | 移动端 |
|------|--------|--------|
| 首页 Feed | 双栏瀑布流 | 单栏卡片流, 下拉刷新 + 无限滚动 |
| 论文详情 | 左 70% 内容 + 右 30% 侧边栏 | 全宽内容, 侧边栏信息折叠到顶部卡片; 互动栏固定底部浮动 |
| 投稿页 | 5 步表单横向展示 | 全屏分步表单, 每步独占一屏, 底部"下一步"按钮 |
| 评审表单 | 左右分栏 (论文 + 表单) | 论文预览折叠, 评审表单全屏; 可上滑查看论文 |
| PDF 预览 | 内嵌 react-pdf 渲染 | 提供"在新标签页打开 PDF"按钮 (移动端 PDF 内嵌体验差) |
| LaTeX 编辑 | 左右分栏 (编辑器 + PDF 预览) | 不推荐移动端编辑 LaTeX; 提供"上传 .tex 文件"入口, 编辑建议跳转桌面端 |
| Markdown 编辑 | Tiptap 富文本编辑器 | 简化工具栏, 仅保留常用格式; 支持纯 Markdown 文本输入模式 |

**移动端投稿简化流程:**

```
移动端投稿入口 (底部 Tab "+" 按钮)
    │
    ├── 快速投稿 (推荐): 标题 + 图片/文字, 跳过 PDF 上传
    │   → 自动选择"极速收录"模式, 降低投稿门槛
    │
    └── 完整投稿: 跳转标准 5 步表单
        → PDF 上传改为"从文件选择", 不支持拖拽
```

### 4.6 SEO 与社交分享 (MVP 即需)

论文详情页是 Rubber 最核心的可分享内容, 必须在 MVP 阶段就具备良好的 SEO 和社交分享体验。

**动态 OG Meta Tags (Next.js App Router `generateMetadata`):**

```typescript
// app/(main)/paper/[id]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const paper = await getPaper(params.id);
  const venue = await getVenue(paper.venue_id);

  return {
    title: `${paper.title} | Rubber`,
    description: paper.abstract?.slice(0, 160) || '一篇经认证的学术垃圾',
    openGraph: {
      title: paper.title,
      description: paper.abstract?.slice(0, 160),
      type: 'article',
      url: `https://rubber.pub/paper/${paper.id}`,
      images: [`/api/og/paper?id=${paper.id}`],  // 动态 OG Image
      siteName: 'Rubber',
    },
    twitter: {
      card: 'summary_large_image',
      title: paper.title,
      description: paper.abstract?.slice(0, 160),
      images: [`/api/og/paper?id=${paper.id}`],
    },
  };
}
```

**动态 OG Image 生成 (Vercel OG / `@vercel/og`):**

```typescript
// app/api/og/paper/route.tsx
import { ImageResponse } from '@vercel/og';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paperId = searchParams.get('id');
  const paper = await getPaper(paperId);

  return new ImageResponse(
    (
      <div style={{ display: 'flex', flexDirection: 'column', width: '1200px', height: '630px',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', padding: '60px', color: 'white' }}>
        <div style={{ fontSize: 24, opacity: 0.7 }}>🗑️ Rubber · {paper.venue_name}</div>
        <div style={{ fontSize: 48, fontWeight: 'bold', marginTop: 20, lineClamp: 3 }}>{paper.title}</div>
        <div style={{ fontSize: 24, opacity: 0.6, marginTop: 'auto' }}>
          垃圾评分: {paper.avg_rubbish_score}/10 · {paper.review_count} 份评审 · {paper.upvote_count} 点赞
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

**各页面 SEO 策略:**

| 页面 | title 模板 | 索引策略 |
|------|-----------|---------|
| 首页 | `Rubber — We only accept rubbish` | index, follow |
| 论文详情 | `{paper.title} \| Rubber` | index, follow (核心 SEO 页面) |
| 子刊主页 | `{venue.name} \| Rubber` | index, follow |
| 用户主页 | `{username} 的垃圾档案 \| Rubber` | index, nofollow |
| 搜索页 | `搜索: {query} \| Rubber` | noindex, follow |
| 投稿页 | `投稿 \| Rubber` | noindex, nofollow |

**结构化数据 (JSON-LD):**

论文详情页输出 `ScholarlyArticle` 结构化数据, 提升搜索引擎理解:

```json
{
  "@context": "https://schema.org",
  "@type": "ScholarlyArticle",
  "headline": "论文标题",
  "author": [{ "@type": "Person", "name": "作者名" }],
  "datePublished": "2026-01-01",
  "publisher": { "@type": "Organization", "name": "Rubber" }
}
```

---

## 5. 数据模型设计 (Supabase / PostgreSQL)

### 5.1 核心表结构

```sql
-- ============================================================
-- 用户系统
-- ============================================================

-- 用户表 (扩展 Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  institution TEXT,           -- 机构/学校
  research_field TEXT,        -- 研究领域
  title TEXT,                 -- 头衔 (如 "首席垃圾鉴定师")
  karma INTEGER DEFAULT 0,   -- 社区积分
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 子刊系统 (Venues)
-- ============================================================

CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,               -- URL 标识, 如 "rubber-chemistry"
  name TEXT NOT NULL,                       -- 如 "Rubber Chemistry"
  subtitle TEXT,                            -- 如 "International Journal of Useless Materials"
  description TEXT,
  cover_image_url TEXT,
  logo_url TEXT,
  impact_factor NUMERIC DEFAULT 0,         -- 永远为 0 的影响因子
  accepting_submissions BOOLEAN DEFAULT true,
  review_mode TEXT DEFAULT 'open',         -- 'open' | 'blind' | 'instant'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 子刊编辑团队
CREATE TABLE venue_editors (
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'editor',              -- 'chief_editor' | 'editor'
  PRIMARY KEY (venue_id, user_id)
);

-- ============================================================
-- 投稿系统 (Papers / Submissions)
-- ============================================================

CREATE TABLE papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number SERIAL,                            -- 自增稿件编号
  venue_id UUID REFERENCES venues(id),
  author_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  abstract TEXT,
  keywords TEXT[],                          -- PostgreSQL 数组
  content_type TEXT NOT NULL,               -- 'latex' | 'pdf' | 'markdown' | 'image'
  content_markdown TEXT,                    -- Markdown 正文 (如适用)
  content_latex TEXT,                       -- LaTeX 源码 (如适用)
  latex_template TEXT DEFAULT 'rubber',     -- LaTeX 模板: 'rubber' (默认) | 'rubber-cn' (中文)
  latex_compile_status TEXT,                -- 'pending' | 'compiling' | 'success' | 'error'
  latex_compile_log TEXT,                   -- 编译日志 (错误时展示给用户)
  latex_source_url TEXT,                    -- LaTeX 源文件包 URL (.zip, Supabase Storage)
  pdf_url TEXT,                             -- PDF 文件 URL (编译产物或直接上传)
  image_urls TEXT[],                        -- 图片 URL 数组

  -- 评审相关
  review_mode TEXT DEFAULT 'open',          -- 'open' | 'blind' | 'instant'
  status TEXT DEFAULT 'submitted',          -- 'submitted' | 'under_review' | 'published' | 'rejected_too_good'
  decision TEXT,                            -- 'certified_rubbish' | 'recyclable' | 'too_good'
  decision_at TIMESTAMPTZ,

  -- 统计 (用触发器或定时任务维护)
  upvote_count INTEGER DEFAULT 0,
  downvote_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  bookmark_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  review_count INTEGER DEFAULT 0,

  -- 评审聚合评分 (由触发器在 reviews 表变更时自动更新)
  avg_rubbish_score NUMERIC(3,1) DEFAULT 0,       -- 平均垃圾程度
  avg_uselessness_score NUMERIC(3,1) DEFAULT 0,   -- 平均无用程度
  avg_entertainment_score NUMERIC(3,1) DEFAULT 0, -- 平均娱乐价值
  hot_score NUMERIC DEFAULT 0,                    -- 热门排序分 (定时任务更新)

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 共同作者关联表 (替代 JSONB, 支持反向查询 "某用户参与的所有论文")
CREATE TABLE paper_authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id UUID REFERENCES papers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,  -- 平台内用户 (可选)
  name TEXT NOT NULL,                     -- 显示名 (平台外作者也可填写)
  institution TEXT,                       -- 机构
  email TEXT,                             -- 联系邮箱 (可选)
  position INTEGER DEFAULT 0,            -- 作者排序位置
  is_corresponding BOOLEAN DEFAULT false, -- 是否通讯作者
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (paper_id, position)
);

CREATE INDEX paper_authors_user_idx ON paper_authors(user_id);
CREATE INDEX paper_authors_paper_idx ON paper_authors(paper_id);

-- 全文搜索索引 (英文; 中文方案见 6.4 节)
CREATE INDEX papers_search_idx ON papers
  USING GIN (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(abstract,'')));

-- 触发器: 评审提交/更新时自动刷新 papers 聚合评分
CREATE OR REPLACE FUNCTION update_paper_review_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE papers SET
    review_count = (SELECT count(*) FROM reviews WHERE paper_id = COALESCE(NEW.paper_id, OLD.paper_id)),
    avg_rubbish_score = (SELECT ROUND(AVG(rubbish_score)::numeric, 1) FROM reviews WHERE paper_id = COALESCE(NEW.paper_id, OLD.paper_id)),
    avg_uselessness_score = (SELECT ROUND(AVG(uselessness_score)::numeric, 1) FROM reviews WHERE paper_id = COALESCE(NEW.paper_id, OLD.paper_id)),
    avg_entertainment_score = (SELECT ROUND(AVG(entertainment_score)::numeric, 1) FROM reviews WHERE paper_id = COALESCE(NEW.paper_id, OLD.paper_id)),
    updated_at = now()
  WHERE id = COALESCE(NEW.paper_id, OLD.paper_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_review_stats
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_paper_review_stats();

-- ============================================================
-- 评审系统 (Reviews) — 对标 OpenReview
-- ============================================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id UUID REFERENCES papers(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES profiles(id),
  is_anonymous BOOLEAN DEFAULT false,

  -- 结构化评分
  rubbish_score INTEGER CHECK (rubbish_score BETWEEN 1 AND 10),     -- 垃圾程度
  uselessness_score INTEGER CHECK (uselessness_score BETWEEN 1 AND 10), -- 无用程度
  entertainment_score INTEGER CHECK (entertainment_score BETWEEN 1 AND 10), -- 娱乐价值

  -- 文字评审
  summary TEXT,                 -- 总结
  strengths TEXT,               -- 优点
  weaknesses TEXT,              -- "缺点" (褒义)
  recommendation TEXT,          -- 'certified_rubbish' | 'recyclable' | 'too_good'

  -- 互动统计
  upvote_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 作者回复 (Rebuttal)
CREATE TABLE rebuttals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 社区互动 (Comments / Reactions / Bookmarks)
-- ============================================================

-- 自由评论 (支持嵌套回复)
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id UUID REFERENCES papers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  parent_id UUID REFERENCES comments(id),  -- 嵌套回复
  content TEXT NOT NULL,
  upvote_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 投票 (论文 + 评论 + 评审)
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL,               -- 'paper' | 'comment' | 'review'
  target_id UUID NOT NULL,
  value SMALLINT NOT NULL CHECK (value IN (-1, 1)),  -- +1 或 -1
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, target_type, target_id)
);

-- 表情反应
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL,               -- 'paper' | 'comment'
  target_id UUID NOT NULL,
  emoji TEXT NOT NULL,                     -- '🗑️' | '💩' | '🔥' | '😂' | '🏆' | '♻️'
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, target_type, target_id, emoji)
);

-- 收藏
CREATE TABLE bookmarks (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  paper_id UUID REFERENCES papers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, paper_id)
);

-- ============================================================
-- 成就系统
-- ============================================================

CREATE TABLE achievements (
  id TEXT PRIMARY KEY,                     -- 如 'first_rubbish', 'review_master'
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,                               -- Emoji 或图标 URL
  condition_type TEXT,                     -- 触发条件类型
  condition_value INTEGER                  -- 触发阈值
);

CREATE TABLE user_achievements (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id TEXT REFERENCES achievements(id),
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, achievement_id)
);

-- ============================================================
-- 通知系统
-- ============================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,                      -- 'new_review' | 'new_comment' | 'decision' | 'achievement' | 'mention'
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,                               -- 跳转链接
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 5.2 Row Level Security (RLS) 策略要点

```sql
-- 论文: 所有人可读, 作者可改自己的
ALTER TABLE papers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON papers FOR SELECT USING (true);
CREATE POLICY "Author insert" ON papers FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Author update" ON papers FOR UPDATE USING (auth.uid() = author_id);

-- 评审: 所有人可读, 评审员可写自己的
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON reviews FOR SELECT USING (true);
CREATE POLICY "Reviewer insert" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- 通知: 只能看自己的
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

-- 投票: 防止重复投票由 UNIQUE 约束保证
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own votes" ON votes FOR ALL USING (auth.uid() = user_id);
```

---

## 6. 技术架构

### 6.1 技术选型

```
┌─────────────────────────────────────────────────────────┐
│                     用户浏览器                            │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Vercel (前端托管 + Edge Functions)            │
│                                                         │
│  Next.js 15 (App Router)                                │
│  ├── 页面 SSR / ISR (首页 Feed / 论文详情)                │
│  ├── API Routes → Supabase Client                       │
│  └── Edge Middleware (鉴权 / 限流)                        │
│                                                         │
│  UI: Tailwind CSS + shadcn/ui                           │
│  LaTeX 编辑: CodeMirror 6 (LaTeX 语法高亮)               │
│  Markdown: Tiptap (KaTeX 公式支持)                       │
│  PDF 预览: react-pdf (pdf.js)                            │
└──────────────────────┬──────────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│   Supabase   │ │ Supabase │ │   Supabase   │
│  PostgreSQL  │ │ Storage  │ │   Auth       │
│              │ │          │ │              │
│ - 所有业务表  │ │ - PDF    │ │ - Email/密码  │
│ - 全文搜索   │ │ - 图片    │ │ - GitHub OAuth│
│ - RLS 权限   │ │ - 头像    │ │ - Google OAuth│
│ - Realtime   │ │          │ │              │
└──────────────┘ └──────────┘ └──────────────┘
          │
          ▼
┌──────────────────────────────────────────┐
│           Supabase Edge Functions         │
│                                          │
│  - 投稿后触发通知                          │
│  - 评审完成后计算评分                       │
│  - 成就解锁检查                            │
│  - 定时任务: 热门排序更新                    │
└──────────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────────┐
│        LaTeX 编译服务 (Docker)             │
│                                          │
│  - TeX Live 完整发行版 (含 xeCJK 中文支持)  │
│  - 接收 .tex 源码 → xelatex 编译 → 返回 PDF│
│  - 部署: Railway / Fly.io / 自建 VPS       │
│  - API: POST /compile {tex, template}     │
└──────────────────────────────────────────┘

外部服务:
  ├── Resend — 邮件通知 (评审结果 / 周报)
  ├── Upstash Redis — 限流 / 缓存热门 Feed
  ├── Vercel Analytics — 流量监控
  └── LaTeX 编译后端 — Docker (TeX Live + xelatex)
```

### 6.2 关键技术决策

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 框架 | Next.js 15 (App Router) | SSR + ISR + API Routes 一站式, Vercel 原生支持 |
| 数据库 | Supabase (PostgreSQL) | 内置 Auth/Storage/Realtime, 免费额度够 MVP |
| 文件存储 | Supabase Storage | 与数据库同平台, 自动 CDN |
| 认证 | Supabase Auth | 开箱即用, 支持 OAuth, 与 RLS 无缝集成 |
| 实时功能 | Supabase Realtime | 评论实时推送, 无需额外 WebSocket 服务 |
| 部署 | Vercel | 与 Next.js 深度集成, 自动预览部署 |
| CSS | Tailwind + shadcn/ui | 开发速度快, 组件质量高 |
| LaTeX 编辑器 | CodeMirror 6 + @codemirror/lang-latex | 轻量、语法高亮、自动补全, 可嵌入 Web |
| LaTeX 编译 | 自建 Docker (TeX Live + xelatex) | 支持中文 (xeCJK), 完整宏包; 部署于 Railway/Fly.io |
| LaTeX 模板 | 基于 arXiv 模板修改的 Rubber 模板 | 保持学术严肃感, 增加 Rubber 品牌元素和中文支持 |
| Markdown 编辑 | Tiptap + KaTeX | 可扩展, 支持 Markdown 快捷键 + 数学公式 |
| PDF 渲染 | react-pdf | 成熟稳定, 基于 pdf.js |
| 邮件 | Resend | 开发体验好, 免费额度 3000/月 |
| 缓存/限流 | Upstash Redis | Serverless Redis, 按用量付费 |
| 搜索 | PostgreSQL GIN + tsvector | MVP 阶段够用, 后期可迁移 Algolia |

### 6.3 目录结构

```
rubber/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (main)/
│   │   ├── page.tsx              # 首页 Feed
│   │   ├── paper/
│   │   │   ├── [id]/page.tsx     # 论文详情
│   │   │   └── submit/page.tsx   # 投稿页
│   │   ├── venue/
│   │   │   └── [slug]/page.tsx   # 子刊主页
│   │   ├── profile/
│   │   │   └── [username]/page.tsx
│   │   ├── search/page.tsx
│   │   └── notifications/page.tsx
│   ├── api/                      # API Routes
│   │   ├── papers/route.ts
│   │   ├── reviews/route.ts
│   │   ├── comments/route.ts
│   │   ├── latex/
│   │   │   ├── compile/route.ts  # LaTeX 编译 (调用编译服务)
│   │   │   └── template/route.ts # 获取 LaTeX 模板
│   │   └── webhooks/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                       # shadcn/ui 组件
│   ├── paper/
│   │   ├── PaperCard.tsx         # Feed 中的论文卡片
│   │   ├── PaperViewer.tsx       # PDF/Markdown/LaTeX 渲染
│   │   ├── LatexEditor.tsx       # LaTeX 在线编辑器 (CodeMirror 6)
│   │   ├── LatexPreview.tsx      # LaTeX 编译预览 (PDF)
│   │   ├── ReviewForm.tsx        # 结构化评审表单
│   │   ├── ReviewCard.tsx        # 评审意见展示
│   │   ├── RebuttalForm.tsx      # 作者回复
│   │   └── SubmitForm.tsx        # 投稿多步表单
│   ├── community/
│   │   ├── CommentThread.tsx     # 嵌套评论
│   │   ├── VoteButton.tsx        # 投票组件
│   │   ├── ReactionBar.tsx       # 表情反应
│   │   ├── BookmarkButton.tsx    # 收藏
│   │   └── ShareCard.tsx         # 分享卡片生成
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   └── profile/
│       ├── AchievementBadge.tsx
│       └── StatsCard.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # 浏览器端 Supabase 客户端
│   │   ├── server.ts             # 服务端 Supabase 客户端
│   │   └── middleware.ts         # Auth 中间件
│   ├── latex/
│   │   ├── compiler.ts           # LaTeX 编译服务客户端 (调用 Docker API)
│   │   ├── templates.ts          # 模板加载与管理
│   │   └── validators.ts         # LaTeX 源码安全校验
│   ├── utils.ts
│   └── constants.ts
├── templates/                     # LaTeX 模板文件
│   ├── rubber/                    # 英文模板 (基于 arXiv 修改)
│   │   ├── rubber.cls            # Rubber 文档类
│   │   ├── rubber.sty            # 样式包
│   │   ├── rubber-logo.pdf       # Logo 资源
│   │   └── template.tex          # 模板示例文件
│   └── rubber-cn/                 # 中文模板 (xeCJK)
│       ├── rubber-cn.cls         # 中文文档类
│       ├── rubber-cn.sty         # 中文样式包 (xeCJK 配置)
│       └── template-cn.tex       # 中文模板示例文件
├── latex-service/                 # LaTeX 编译服务 (独立部署)
│   ├── Dockerfile                # TeX Live + xelatex + 中文字体
│   ├── server.ts                 # HTTP API 服务 (Hono / Express)
│   ├── compile.ts                # 编译逻辑 (沙箱执行)
│   └── fonts/                    # 中文字体 (Noto Sans CJK 等)
├── supabase/
│   ├── migrations/               # 数据库迁移文件
│   │   └── 001_initial_schema.sql
│   ├── functions/                # Edge Functions
│   │   ├── on-paper-submit/      # 投稿后触发 (含 LaTeX 编译)
│   │   ├── on-review-submit/
│   │   └── update-hot-ranking/
│   └── seed.sql                  # 初始数据 (子刊、成就等)
├── public/
│   ├── og/                       # OG Image 模板
│   └── badges/                   # 成就图标
├── middleware.ts                  # Vercel Edge Middleware
├── next.config.ts
├── tailwind.config.ts
├── package.json
└── .env.local
```

### 6.4 搜索方案 (含中文支持)

PostgreSQL 内置 `tsvector` 仅支持英文分词，而 Rubber 的核心用户群体为中文科研人，需要中文全文搜索能力。

**分阶段方案：**

| 阶段 | 方案 | 说明 |
|------|------|------|
| MVP | PostgreSQL `LIKE` + `tsvector` 双路搜索 | 英文走 tsvector GIN 索引; 中文走 `ILIKE '%关键词%'` + `pg_trgm` 三元组索引 (模糊匹配, 性能可接受到 10 万条) |
| Phase 2 | Meilisearch (自托管) 或 Supabase 内置搜索 | Meilisearch 原生支持中文分词, 亚秒级响应, Docker 部署简单; 可用 Meilisearch Cloud 免费层 (10K 文档) |
| Phase 4 | Algolia / Typesense | 如需更强的搜索分析和推荐能力 |

**MVP 阶段中文搜索实现：**

```sql
-- 启用 pg_trgm 扩展 (Supabase 已预装)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 三元组索引, 支持中文模糊搜索
CREATE INDEX papers_title_trgm_idx ON papers USING GIN (title gin_trgm_ops);
CREATE INDEX papers_abstract_trgm_idx ON papers USING GIN (abstract gin_trgm_ops);
```

```typescript
// 搜索 API: 中英文双路
async function searchPapers(query: string) {
  const isChineseQuery = /[\u4e00-\u9fa5]/.test(query);

  if (isChineseQuery) {
    // 中文: pg_trgm 模糊匹配
    return supabase
      .from('papers')
      .select('*')
      .or(`title.ilike.%${query}%,abstract.ilike.%${query}%`)
      .order('hot_score', { ascending: false })
      .limit(20);
  } else {
    // 英文: tsvector 全文搜索
    return supabase
      .from('papers')
      .select('*')
      .textSearch('title_abstract_fts', query) // 需配置 Supabase 全文搜索列
      .order('hot_score', { ascending: false })
      .limit(20);
  }
}
```

### 6.5 实时功能与降级方案

Supabase Realtime 免费层限制 200 并发连接, 需要降级策略。

| 场景 | 方案 |
|------|------|
| 并发 < 200 | Supabase Realtime 订阅 notifications 表, 实时推送 |
| 并发 ≥ 200 | 自动降级为轮询模式: 前端每 30 秒 GET /api/notifications/unread-count |
| 评论实时更新 | 仅论文详情页活跃用户订阅该 paper_id 的评论变更, 离开页面即取消订阅 |
| 规模化后 | 迁移至 Supabase Pro (500 并发) 或自建 WebSocket (Socket.io + Redis Pub/Sub) |

**前端实现：**

```typescript
// 自动降级: Realtime → Polling
function useNotifications(userId: string) {
  const channel = supabase.channel(`notifications:${userId}`);
  const [fallbackPolling, setFallbackPolling] = useState(false);

  useEffect(() => {
    channel
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => handleNewNotification(payload.new))
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') setFallbackPolling(true);
      });

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  // 降级轮询
  useEffect(() => {
    if (!fallbackPolling) return;
    const interval = setInterval(() => fetchUnreadCount(), 30000);
    return () => clearInterval(interval);
  }, [fallbackPolling]);
}
```

### 6.6 LaTeX 编译方案

#### 6.6.1 Rubber LaTeX 模板

基于 arXiv 标准模板修改，保持学术论文的严肃排版，同时融入 Rubber 品牌元素。提供英文和中文两套模板。

**英文模板 (`rubber.cls`) 基础结构：**

```latex
% rubber.cls — Rubber 英文论文模板
% 基于 article 类修改, 参考 arXiv 常用排版规范
\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{rubber}[2026/01/01 Rubber Paper Template]

\LoadClass[11pt, a4paper, twocolumn]{article}

% 核心宏包
\RequirePackage[utf8]{inputenc}
\RequirePackage[T1]{fontenc}
\RequirePackage{amsmath, amssymb, amsthm}   % 数学环境
\RequirePackage{graphicx}                    % 图片
\RequirePackage{hyperref}                    % 超链接
\RequirePackage{natbib}                      % 参考文献
\RequirePackage{booktabs}                    % 表格
\RequirePackage{algorithm2e}                 % 算法
\RequirePackage{xcolor}

% Rubber 品牌配色
\definecolor{rubberPrimary}{HTML}{1a1a2e}
\definecolor{rubberAccent}{HTML}{e94560}

% 页眉: Rubber 品牌标识
\RequirePackage{fancyhdr}
\pagestyle{fancy}
\fancyhf{}
\fancyhead[L]{\small\textcolor{rubberPrimary}{\textit{Rubber} — We only accept rubbish.}}
\fancyhead[R]{\small\thepage}
\fancyfoot[C]{\small\textcolor{gray}{Certified Rubbish \texttrademark}}

% 标题样式
\renewcommand{\maketitle}{%
  \twocolumn[%
    \begin{center}
      {\Large\bfseries\@title\par}
      \vskip 0.5em
      {\normalsize\@author\par}
      \vskip 0.5em
      {\small\@date\par}
      \vskip 1em
      \hrule
      \vskip 1em
    \end{center}
  ]%
}
```

**中文模板 (`rubber-cn.cls`) 关键差异：**

```latex
% rubber-cn.cls — Rubber 中文论文模板
% 基于 rubber.cls, 增加 xeCJK 中文支持
\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{rubber-cn}[2026/01/01 Rubber Chinese Paper Template]

\LoadClass[11pt, a4paper, twocolumn]{article}

% 中文支持 (必须使用 xelatex 编译)
\RequirePackage{xeCJK}
\setCJKmainfont{Noto Serif CJK SC}          % 正文宋体
\setCJKsansfont{Noto Sans CJK SC}           % 无衬线黑体
\setCJKmonofont{Noto Sans Mono CJK SC}      % 等宽字体

% 中文标点和排版优化
\RequirePackage{indentfirst}                 % 首段缩进
\setlength{\parindent}{2em}                  % 缩进 2 字符

% 中文摘要环境
\renewenvironment{abstract}{%
  \begin{center}
    \textbf{摘\quad 要}
  \end{center}
  \small
}{}

% 中文关键词
\newcommand{\keywords}[1]{%
  \vskip 0.5em
  \noindent\textbf{关键词：}#1
}

% 其余继承英文模板的品牌元素和排版规范
% ...
```

**模板使用示例 (用户看到的初始内容)：**

```latex
\documentclass{rubber}        % 英文投稿
% \documentclass{rubber-cn}   % 中文投稿

\title{Why My Experiment Failed: A Comprehensive Study of Nothing}
\author{Anonymous Researcher \\ Department of Useless Studies}
\date{\today}

\begin{document}
\maketitle

\begin{abstract}
We present a thorough investigation into why absolutely nothing worked.
Our results confirm that failure is, indeed, the only reliable outcome.
\end{abstract}

\section{Introduction}
It all started when the funding ran out...

\section{Methods}
We tried everything. Nothing worked.

\section{Results}
See title.

\section{Conclusion}
We conclude that this paper is certified rubbish.

\bibliographystyle{plainnat}
\bibliography{references}

\end{document}
```

#### 6.6.2 LaTeX 编译服务

**架构：独立 Docker 微服务，通过 HTTP API 接收 LaTeX 源码并返回编译后的 PDF。**

```
前端 (CodeMirror 编辑器)
    │
    ▼ POST /api/latex/compile
Next.js API Route (代理 + 鉴权 + 限流)
    │
    ▼ POST /compile
LaTeX 编译服务 (Docker)
    │
    ├── 1. 接收 .tex 源码 + 模板名
    ├── 2. 写入临时目录 (每次编译独立沙箱)
    ├── 3. 复制对应模板文件 (.cls, .sty, 字体)
    ├── 4. 执行 xelatex (超时 60 秒, 内存限制 512MB)
    ├── 5. 如有 .bib → 执行 bibtex → 再次 xelatex × 2
    ├── 6. 成功 → 返回 PDF (二进制)
    ├── 7. 失败 → 返回编译日志 (错误信息)
    └── 8. 清理临时目录
```

**编译服务 Dockerfile：**

```dockerfile
FROM texlive/texlive:latest

# 安装中文字体
RUN apt-get update && apt-get install -y \
    fonts-noto-cjk \
    fonts-noto-cjk-extra \
    && rm -rf /var/lib/apt/lists/*

# 安装 Node.js (API 服务)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

WORKDIR /app
COPY package.json server.ts compile.ts ./
RUN npm install

# 复制 Rubber 模板
COPY templates/ /app/templates/

EXPOSE 3001
CMD ["npx", "tsx", "server.ts"]
```

**编译 API 接口：**

```typescript
// latex-service/server.ts
import { Hono } from 'hono';

const app = new Hono();

app.post('/compile', async (c) => {
  const { tex, template = 'rubber', paperId } = await c.req.json();

  // 安全校验: 禁止危险命令
  if (/\\(input|include|write18|immediate|openout)/.test(tex)) {
    return c.json({ error: '包含不允许的 LaTeX 命令' }, 400);
  }

  const result = await compileLaTeX(tex, template);

  if (result.success) {
    return new Response(result.pdf, {
      headers: { 'Content-Type': 'application/pdf' },
    });
  } else {
    return c.json({
      error: 'Compilation failed',
      log: result.log.slice(-2000),  // 返回最后 2000 字符的日志
    }, 422);
  }
});
```

**安全沙箱措施：**

| 措施 | 说明 |
|------|------|
| 命令白名单 | 禁止 `\write18`、`\input{/etc/...}` 等危险命令 |
| 超时限制 | 单次编译最长 60 秒, 超时自动 kill |
| 内存限制 | 每次编译 512MB 上限 (Docker `--memory`) |
| 临时目录隔离 | 每次编译使用独立 `/tmp/compile-{uuid}/`, 完成后删除 |
| 网络隔离 | 编译容器禁止外网访问 (`--network=none`) |
| 频率限制 | 每用户每分钟最多 5 次编译请求 (Upstash Redis) |

#### 6.6.3 前端 LaTeX 编辑体验

**编辑器功能 (CodeMirror 6)：**

- LaTeX 语法高亮 (`@codemirror/lang-latex` 或自定义 Lezer 语法)
- 自动补全: `\begin{` → 自动补全环境名 + `\end{}`
- 括号匹配: `{}`, `[]`, `$$`
- 快捷键: `Ctrl+B` 加粗, `Ctrl+I` 斜体, `Ctrl+M` 插入数学环境
- 错误标注: 编译失败时在对应行号标红

**编辑器布局 (桌面端)：**

```
┌──────────────────────────────────────────────────────┐
│  模板选择: [Rubber 英文 ▼] [Rubber 中文]  [上传 .tex]  │
├─────────────────────────┬────────────────────────────┤
│                         │                            │
│   CodeMirror 编辑器      │    PDF 预览 (react-pdf)     │
│   (LaTeX 源码)           │    (编译后实时更新)          │
│                         │                            │
│                         │                            │
├─────────────────────────┴────────────────────────────┤
│  [编译] [下载 .tex] [下载 PDF]    编译状态: ✅ 成功     │
└──────────────────────────────────────────────────────┘
```

**编译触发策略：**

- **手动编译**: 点击"编译"按钮或 `Ctrl+Enter`
- **自动编译 (可选)**: 停止输入 3 秒后自动触发 (debounce), 用户可在设置中关闭
- **提交时编译**: 投稿提交前强制编译一次, 确保 PDF 可用

#### 6.6.4 LaTeX 投稿的完整流程

```
用户选择 "LaTeX" 内容类型
    │
    ├── 选择模板: Rubber 英文 / Rubber 中文
    │
    ▼
在线编辑器加载模板初始内容
    │
    ▼
用户编辑 LaTeX 源码 (或上传本地 .tex 文件)
    │
    ▼
点击"编译预览" → 调用编译服务
    │
    ├── 成功 → 右侧展示 PDF 预览
    │          用户继续编辑或提交
    │
    └── 失败 → 展示编译错误日志
               编辑器标注错误行号
               用户修改后重新编译
    │
    ▼
用户点击"提交"
    │
    ▼
系统执行最终编译 → 存储:
    ├── LaTeX 源码 → content_latex 字段
    ├── 源文件包 (.zip) → Supabase Storage (latex_source_url)
    ├── 编译后 PDF → Supabase Storage (pdf_url)
    └── 编译状态 → latex_compile_status = 'success'
```

---

## 7. 功能模块详细设计

### 7.1 投稿模块

**投稿表单 (多步骤)**

```
Step 1: 选择子刊
  → 卡片式选择, 展示各子刊简介和当前征稿状态

Step 2: 基本信息
  → 标题 (必填, 建议 < 200 字)
  → 摘要 (必填, 建议 < 500 字)
  → 关键词 (Tag 输入, 最多 5 个)
  → 共同作者 (可选, 可邀请平台用户或填写外部作者)

Step 3: 上传内容
  → 内容类型切换: LaTeX (推荐) / PDF / Markdown / 图片
  → LaTeX: 选择模板 (Rubber 英文 / Rubber 中文) → 在线编辑器 (CodeMirror 6)
           支持上传本地 .tex 文件; 编译预览 (xelatex → PDF); 详见 §6.6
  → PDF: 拖拽上传, 最大 20MB, 上传至 Supabase Storage
  → Markdown: Tiptap 编辑器, 支持 KaTeX 数学公式
  → 图片: 多图上传, 支持拖拽排序 (快速投稿模式)

Step 4: 评审偏好
  → 闭眼盲审: 系统随机分配 2-3 位评审员
  → 开放评审: 任何人可提交评审
  → 极速收录: 跳过评审, 直接 Certified Rubbish

Step 5: 预览 & 提交
  → 渲染最终效果预览
  → 确认提交 (提交后标题/内容不可修改, 可追加勘误)
```

**文件上传流程**

```
用户选择文件
  │
  ▼
前端校验 (类型 + 大小)
  │
  ▼
调用 Supabase Storage API 上传
  → 路径: papers/{paper_id}/{filename}
  → 设置为 public bucket (论文公开访问)
  │
  ▼
获取 public URL → 写入 papers 表
```

### 7.2 评审模块

**结构化评审表单**

```typescript
interface ReviewFormData {
  // 评分 (滑块组件, 1-10)
  rubbishScore: number;       // 垃圾程度: 1=几乎不垃圾 10=登峰造极的垃圾
  uselessnessScore: number;   // 无用程度: 1=略有用处 10=对人类毫无贡献
  entertainmentScore: number; // 娱乐价值: 1=无聊至极 10=笑到头掉

  // 文字评审
  summary: string;            // 一句话总结这篇垃圾
  strengths: string;          // 亮点 (为什么它是好垃圾?)
  weaknesses: string;         // 不足 (哪里还不够垃圾?)

  // 推荐决定
  recommendation: 'certified_rubbish' | 'recyclable' | 'too_good';

  // 选项
  isAnonymous: boolean;       // 是否匿名评审
}
```

**评审展示**

- 评分用雷达图 (Recharts) 可视化
- 文字评审折叠展示, 默认展开摘要
- 作者 Rebuttal 紧跟在对应评审下方
- 评审可被其他用户点赞

**评审分配 (闭眼盲审模式)**

```
新投稿选择闭眼盲审
  │
  ▼
Supabase Edge Function 触发
  │
  ▼
从该子刊活跃用户中排除作者及共同作者
  │
  ▼
按 karma 值加权随机选取 2-3 位评审员
  │
  ▼
发送通知邮件 + 站内通知
  │
  ▼
评审员在 7 天内提交评审 (超时自动转为开放评审)
```

### 7.3 社区互动模块

**评论系统**

- 嵌套回复 (最多 3 层, 超过后扁平化显示)
- 支持 Markdown 语法
- 支持 @提及用户 (触发通知)
- 排序: 最热 / 最新 / 最早

**投票系统**

- 论文 / 评审 / 评论 均可投票 (+1 / -1)
- 使用乐观更新 (Optimistic UI), 请求失败回滚
- 防刷: 每用户每目标唯一投票 (数据库 UNIQUE 约束)

**Emoji 反应**

- 预设 6 个反应: 🗑️ 💩 🔥 😂 🏆 ♻️
- 点击切换, 显示计数和头像列表
- 实现: 单独的 reactions 表, 前端聚合显示

**收藏**

- 一键收藏, 收藏列表在个人主页查看
- 支持按子刊 / 时间排序

### 7.4 成就系统

| 成就 ID | 名称 | 图标 | 解锁条件 |
|---------|------|------|---------|
| first_submit | 初入垃圾场 | 🗑️ | 首次投稿 |
| certified_10 | 垃圾大师 | 👑 | 累计 10 篇 Certified Rubbish |
| too_good_1 | 你太优秀了 | ❌ | 被判定 "Too Good, Rejected" |
| review_10 | 垃圾鉴定师 | 🔍 | 完成 10 次评审 |
| review_50 | 首席鉴定官 | 🏛️ | 完成 50 次评审 |
| popular_100 | 网红垃圾 | 🌟 | 单篇获得 100+ 点赞 |
| comment_king | 评论之王 | 💬 | 累计 100 条评论 |
| all_venues | 全能垃圾 | 🌈 | 在所有子刊各投稿至少 1 篇 |

**触发机制**: Supabase Database Webhook → Edge Function → 检查条件 → 解锁成就 + 发送通知

### 7.5 通知系统

| 通知类型 | 触发条件 | 渠道 |
|---------|---------|------|
| 新评审 | 你的论文收到新评审 | 站内 + 邮件 |
| 新评论 | 你的论文/评审收到新评论 | 站内 |
| @提及 | 有人在评论中 @你 | 站内 |
| 评审邀请 | 被分配为评审员 | 站内 + 邮件 |
| 决定公布 | 你的论文有了评审结果 | 站内 + 邮件 |
| 成就解锁 | 解锁新成就 | 站内 |

**实现**: Supabase Realtime 订阅 notifications 表, 前端实时弹窗。邮件通过 Resend API 在 Edge Function 中发送。

---

## 8. 子刊 (Venues) 体系

### 8.1 预设子刊

| 子刊 | Slug | 定位 |
|------|------|------|
| Rubber | `rubber` | 主刊, 综合类, 收录一切学术垃圾 |
| Rubber Chemistry | `rubber-chemistry` | 化学, 收率低于 0.5% 的实验 |
| Rubber Communications | `rubber-comms` | 通信/信号处理, 信噪比为负的研究 |
| Rubber Biology | `rubber-bio` | 生物, 养死细胞的心路历程 |
| Rubber CS | `rubber-cs` | 计算机, 跑不通的代码和过拟合的模型 |
| Rubber Physics | `rubber-physics` | 物理, 违反热力学定律的奇思妙想 |
| Rubber Math | `rubber-math` | 数学, 证明了半页发现漏洞的定理 |

### 8.2 子刊自治

- 每个子刊有 1 名主编 + 若干编辑
- 主编可自定义: 子刊描述、封面、征稿要求、评审规则
- 主编可置顶/精选稿件
- 新子刊申请: 用户提交申请 → 平台管理员审核

---

## 9. API 设计 (Next.js API Routes)

### 9.1 主要端点

```
Papers:
  GET    /api/papers              — 列表 (分页/筛选/排序)
  GET    /api/papers/[id]         — 详情
  POST   /api/papers              — 创建投稿
  PATCH  /api/papers/[id]         — 更新 (仅作者, 仅限元数据)
  DELETE /api/papers/[id]         — 删除 (仅作者, 仅限 submitted 状态)

Reviews:
  GET    /api/papers/[id]/reviews — 某论文的所有评审
  POST   /api/papers/[id]/reviews — 提交评审
  POST   /api/reviews/[id]/rebuttal — 提交 Rebuttal

Comments:
  GET    /api/papers/[id]/comments — 某论文的评论树
  POST   /api/papers/[id]/comments — 发表评论
  DELETE /api/comments/[id]        — 删除评论 (仅作者)

Interactions:
  POST   /api/vote                 — 投票 (upsert)
  POST   /api/react                — 表情反应 (toggle)
  POST   /api/bookmark             — 收藏 (toggle)

Venues:
  GET    /api/venues               — 子刊列表
  GET    /api/venues/[slug]        — 子刊详情 + 投稿列表

Users:
  GET    /api/users/[username]     — 用户公开信息
  PATCH  /api/users/me             — 更新个人资料

LaTeX:
  POST   /api/latex/compile         — 编译 LaTeX 源码 → 返回 PDF (代理编译服务)
  GET    /api/latex/template/[name] — 获取模板内容 (rubber / rubber-cn)
  GET    /api/latex/source/[paperId]— 获取论文 LaTeX 源码 (仅作者)

Notifications:
  GET    /api/notifications        — 通知列表
  PATCH  /api/notifications/read   — 标记已读
```

### 9.2 Feed 排序算法

```typescript
// 热门排序: 改良 Reddit Hot Ranking
function hotScore(paper: Paper): number {
  const score = paper.upvote_count - paper.downvote_count;
  const order = Math.log10(Math.max(Math.abs(score), 1));
  const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
  const ageHours = (Date.now() - paper.created_at.getTime()) / 3600000;

  // 垃圾评分加成: 平均垃圾分越高, 排名越靠前
  const rubbishBonus = (paper.avg_rubbish_score || 5) / 10;

  return sign * order + rubbishBonus - ageHours / 24;
}
```

---

## 10. 开发路线图

### Phase 0: 种子准备 (1-2 周)

**目标: 上线前内容不为空**

- [ ] 邀请 5-10 位科研 KOL, 预先投稿 20-30 篇种子内容
- [ ] 预写 3-5 篇示范性评审
- [ ] 撰写"投稿指南"置顶帖 (幽默风格)
- [ ] 准备首批邀请码 (定向发放)

### Phase 1: MVP (4-6 周, 1-2 人)

**目标: 能投稿、能评审、能评论、能传播**

- [ ] 项目初始化 (Next.js + Supabase + Vercel)
- [ ] 用户认证 (Supabase Auth, Email + GitHub OAuth)
- [ ] 邀请码注册机制 (冷启动阶段限制注册)
- [ ] 用户 Profile 基础页面
- [ ] Rubber LaTeX 模板开发 (英文 rubber.cls + 中文 rubber-cn.cls, 基于 arXiv 模板)
- [ ] LaTeX 编译服务 (Docker: TeX Live + xelatex + 中文字体, 部署 Railway/Fly.io)
- [ ] 投稿流程 (LaTeX 在线编辑 + Markdown + PDF 上传)
- [ ] LaTeX 在线编辑器 (CodeMirror 6, 语法高亮 + 编译预览)
- [ ] 共同作者关联 (paper_authors 表)
- [ ] 论文详情页 (LaTeX 编译 PDF / 直传 PDF / Markdown 渲染)
- [ ] 开放评审 (结构化评审表单 + 展示 + 评审聚合评分触发器)
- [ ] 评审决定自动判定逻辑 (≥2 评审多数一致 → 自动出结果)
- [ ] 自由评论 (嵌套 2 层)
- [ ] 点赞 (论文 + 评论)
- [ ] 首页 Feed (最新排序)
- [ ] 3 个预设子刊
- [ ] Mobile-First 响应式适配 (底部 Tab 导航 + 移动端快速投稿)
- [ ] 基础 SEO: 每页动态 OG meta tags (title / description / image)
- [ ] 基础内容审核: 关键词黑名单 + OpenAI Moderation API 自动过滤
- [ ] 举报功能 (reports 表 + 举报按钮)

### Phase 2: 社区增强 (4 周)

- [ ] 收藏功能
- [ ] Emoji 反应
- [ ] 通知系统 (站内, Realtime + 轮询降级)
- [ ] 搜索功能 (英文 tsvector + 中文 pg_trgm 双路搜索)
- [ ] 热门排序算法 (hot_score 定时更新)
- [ ] 闭眼盲审模式 (随机分配评审员, 冷启动降级为开放评审)
- [ ] 作者 Rebuttal
- [ ] 评审邀请邮件 (Resend)
- [ ] 分享卡片生成 (OG Image, Vercel OG)
- [ ] 半开放注册 (取消邀请码, 新增入门任务)
- [ ] 社区公约页面

### Phase 3: 成长飞轮 (4 周)

- [ ] 成就系统
- [ ] 用户 Karma 积分
- [ ] 子刊管理后台 (主编功能: 裁定权 / 置顶 / 精选)
- [ ] 新子刊申请流程
- [ ] 排行榜 (最佳垃圾 / 最佳评审员 / 活跃用户)
- [ ] 邮件周报 (本周精选垃圾)
- [ ] PWA 支持
- [ ] 国际化 (中/英)
- [ ] 管理后台: 审核队列 Dashboard

### Phase 4: 规模化 (持续)

- [ ] 搜索迁移至 Meilisearch / Algolia
- [ ] 评审员推荐算法 (基于研究领域)
- [ ] API 开放 (供第三方集成)
- [ ] 移动端 App (React Native / Expo)
- [ ] 数据分析面板 (投稿趋势/学科分布)
- [ ] WebSocket 自建方案替代 Supabase Realtime (如需)

---

## 11. 成本估算 (MVP 阶段)

| 服务 | 免费额度 | 预估月费 (用户 < 1000) |
|------|---------|----------------------|
| Vercel (Hobby) | 100GB 带宽, 无限部署 | $0 |
| Supabase (Free) | 500MB 数据库, 1GB 存储, 50K MAU | $0 |
| Resend (Free) | 3000 封/月 | $0 |
| Upstash Redis (Free) | 10K 请求/天 | $0 |
| LaTeX 编译服务 | Railway Free (500h/月) 或 Fly.io Free (3 shared VMs) | $0~$5 |
| 域名 | — | ~$12/年 |
| **总计 (MVP)** | | **~$5/月** |

**规模化后 (1万+ 用户):**

| 服务 | 套餐 | 月费 |
|------|------|------|
| Vercel Pro | | $20 |
| Supabase Pro | 8GB 数据库, 100GB 存储 | $25 |
| Resend Pro | 50K 封/月 | $20 |
| Upstash Pro | | $10 |
| LaTeX 编译服务 | Railway/Fly.io (2 vCPU, 2GB RAM) | $15 |
| **总计** | | **~$90/月** |

---

## 12. 注意事项

### 12.1 法律合规

- 在网站显著位置添加 Disclaimer: "本平台为娱乐社区，非正规学术出版物"
- 用户协议中明确: 投稿内容不构成正式学术发表
- 如面向国内用户: 需要 ICP 备案 (可用境外服务器规避, 但影响访问速度)
- 内容审核: 设置举报机制, 人工审核队列

### 12.2 社区运营

#### 12.2.1 冷启动策略

**Phase 0: 种子内容预填 (上线前 1-2 周)**

- 团队成员 + 邀请的 5-10 位科研 KOL 预先投稿 20-30 篇高质量"垃圾"
- 涵盖各子刊, 确保用户首次访问时 Feed 不为空
- 预写 3-5 篇示范性评审, 展示评审系统的玩法和调性
- 准备 1 篇"投稿指南"置顶帖, 用幽默风格介绍平台规则

**Phase 1: 邀请制内测 (前 2-4 周)**

- 上线初期采用邀请码注册, 每位用户获得 3 个邀请码
- 邀请码数据表:

```sql
CREATE TABLE invite_codes (
  code TEXT PRIMARY KEY,                    -- 6位随机码
  creator_id UUID REFERENCES profiles(id),
  used_by UUID REFERENCES profiles(id),
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '30 days',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

- 首批邀请码定向发放给: 小红书 Rubbish 社区活跃用户、即刻科研话题 KOL、Twitter/X 学术圈博主
- 每位受邀用户自动获得 20 karma 初始积分 (可立即参与评审)

**Phase 2: 半开放注册 (4-8 周)**

- 开放 GitHub / Google OAuth 注册, 但新用户需完成"入门任务"解锁投稿权限:
  - 任务 1: 完善个人资料 (机构 + 研究领域)
  - 任务 2: 对任意 1 篇论文发表评论
  - 任务 3: 对任意 1 篇论文提交评审
- 完成入门任务后获得 10 karma + "初入垃圾场" 成就

**Phase 3: 全面开放**

- 取消邀请码限制, 保留入门任务机制
- 新用户投稿频率限制: 前 7 天最多 2 篇/天

**传播策略**

- 每篇论文自动生成分享卡片 (含标题 + 垃圾评分 + 二维码), 方便社交媒体传播
- 每周自动生成"本周最佳垃圾 Top 5"榜单, 可一键分享
- 鼓励用户将被拒稿件投稿时附上原始审稿意见截图, 形成对比效果

#### 12.2.2 内容审核方案

**三层审核机制:**

```
投稿/评论提交
    │
    ▼
第一层: 自动过滤 (即时)
    ├── 关键词黑名单 (政治敏感/色情/人身攻击)
    ├── OpenAI Moderation API (免费, 支持中英文)
    ├── 重复内容检测 (标题相似度 > 90% 拦截)
    │
    ▼ 通过
第二层: 社区自治 (持续)
    ├── 任何用户可举报 (选择原因: 垃圾广告/人身攻击/抄袭/不当内容/其他)
    ├── 同一内容被 ≥ 3 人举报 → 自动隐藏 + 进入人工审核队列
    ├── 子刊主编可直接隐藏/删除本刊内容
    │
    ▼ 争议内容
第三层: 平台管理员 (人工)
    ├── 审核队列 Dashboard (管理后台)
    ├── 处理结果: 恢复 / 删除 / 封禁用户
    └── 申诉通道: 用户可对处理结果提出申诉
```

**举报系统数据表:**

```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES profiles(id),
  target_type TEXT NOT NULL,              -- 'paper' | 'comment' | 'review' | 'user'
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,                   -- 'spam' | 'harassment' | 'plagiarism' | 'inappropriate' | 'other'
  description TEXT,                       -- 补充说明
  status TEXT DEFAULT 'pending',          -- 'pending' | 'resolved_delete' | 'resolved_dismiss' | 'resolved_ban'
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX reports_status_idx ON reports(status);
CREATE INDEX reports_target_idx ON reports(target_type, target_id);
```

**社区公约要点:**

- 允许: 失败实验、被拒稿件、科研吐槽、学术幽默、非严肃讨论
- 禁止: 人身攻击、歧视言论、真实隐私泄露、商业广告、抄袭他人内容
- 灰色地带: 对具体导师/机构的吐槽 → 要求匿名化处理, 不得出现真实姓名

### 12.3 "Rubber" 品牌

- 品牌名 Rubber 取自 Rubbish 的谐音变体, 致敬 Nature / Science 的命名风格——一个单词即品牌
- 建议与小红书上的原始 Rubbish 社区创作者沟通, 获得认可或合作
- 可考虑开源整个项目, 与社区共建
- 域名建议: rubber.pub / rubber.science / rubberjournal.org
