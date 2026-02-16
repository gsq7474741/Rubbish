# 🗑️ RubbishReview — We only accept rubbish.

> An open peer-review platform for academic failures, negative results, and spectacularly useless research.
>
> 一个以"学术垃圾"为主题的开放投稿与同行评议平台，对标 OpenReview 的核心学术工作流，叠加社区互动。

## 技术栈

- **框架**: Next.js 16 (App Router, Turbopack)
- **UI**: Tailwind CSS 4 + shadcn/ui
- **后端**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **包管理**: pnpm workspace monorepo
- **部署**: Vercel

## 项目结构

```
RubbishReview/
├── apps/
│   └── web/                          # Next.js 主应用
│       ├── src/
│       │   ├── app/
│       │   │   ├── (auth)/           # 登录/注册
│       │   │   ├── (main)/           # 主布局
│       │   │   │   ├── page.tsx              # 首页 (Venue 目录)
│       │   │   │   ├── venues/page.tsx       # Venues 列表
│       │   │   │   ├── venue/[slug]/         # Venue 首页 + 投稿
│       │   │   │   ├── paper/[id]/page.tsx   # 论文 Forum
│       │   │   │   ├── dashboard/page.tsx    # 用户 Dashboard
│       │   │   │   ├── submit/page.tsx       # Venue 选择器
│       │   │   │   ├── profile/[username]/   # 用户主页
│       │   │   │   ├── search/page.tsx       # 搜索
│       │   │   │   └── notifications/        # 通知
│       │   │   └── api/              # API Routes
│       │   ├── components/
│       │   │   ├── ui/               # shadcn/ui 基础组件
│       │   │   ├── layout/           # Navbar + Footer
│       │   │   ├── paper/            # PaperCard, ReviewForm, RebuttalForm
│       │   │   ├── venue/            # VenueHeader, VenueTabs, ActivityFeed
│       │   │   ├── forum/            # ReplyTree, BibtexModal, FilterBar
│       │   │   ├── dashboard/        # DashboardTabs
│       │   │   └── community/        # VoteButton
│       │   └── lib/
│       │       ├── supabase/         # Client/Server/Middleware
│       │       ├── types.ts          # TypeScript 类型
│       │       └── constants.ts      # 常量
│       └── public/                   # 静态资源 (OG Image, favicon)
└── packages/                         # 共享包 (预留)
```

## Venues (学术底刊)

| Venue | 捏他 | 领域 |
|-------|------|------|
| **Notrue** | Nature | 综合 — 收录一切学术垃圾 |
| **Dead Cell** | Cell | 生物 — 养死细胞的心路历程 |
| **Abandoned Materials** | Advanced Materials | 化学 — 收率低于 0.5% 的实验 |
| **Nothing Communication** | IEEE Communications | 通信 — 信噪比为负的研究 |
| **The Fool** | NeurIPS / ICML | 计算机 — 跑不通的代码和过拟合的模型 |
| **Joker of Academics** | Annals of Mathematics | 数学 — 证明了半页发现漏洞的定理 |
| **Silence** | Physical Review Letters | 物理 — 实验结果什么也没说 |

## 快速开始

### 前置条件

- Node.js >= 20
- pnpm >= 9
- Supabase 项目 (免费即可)

### 安装

```bash
git clone <repo-url>
cd RubbishReview
pnpm install

cp apps/web/.env.example apps/web/.env.local
# 编辑 .env.local，填入 Supabase URL 和 Anon Key
```

### 启动开发

```bash
pnpm dev
```

访问 http://localhost:3000

## 核心功能

- **Venue 体系**: 7 个独立学科底刊，各有首页、投稿入口、活动流
- **投稿系统**: Venue 专属投稿，支持 Markdown / PDF / LaTeX
- **评审系统**: 结构化评审 (垃圾程度/无用程度/娱乐价值)，支持开放评审和闭眼盲审
- **评审结果**: 🗑️ Certified Rubbish / ♻️ Recyclable / ❌ Too Good, Rejected
- **论文 Forum**: 嵌套评论树、BibTeX 引用、PDF 下载
- **Dashboard**: 我的投稿 / 我的评审 / 待办任务
- **社区互动**: 评论、投票、Emoji 反应、收藏
- **用户系统**: 个人主页、成就徽章、Karma 积分
- **通知系统**: 站内通知
- **活动日志**: 全局和 Venue 级别的活动流

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/POST | `/api/papers` | 论文列表/创建 |
| GET/PATCH | `/api/papers/[id]` | 论文详情/更新 |
| GET/POST | `/api/papers/[id]/reviews` | 评审列表/提交 |
| POST | `/api/papers/[id]/reviews/[reviewId]/rebuttal` | 提交 Rebuttal |
| GET/POST | `/api/papers/[id]/comments` | 评论列表/发表 (支持嵌套) |
| GET | `/api/papers/search` | 搜索论文 |
| POST | `/api/vote` | 投票 |
| POST | `/api/bookmark` | 收藏 |
| POST | `/api/react` | 表情反应 |
| GET | `/api/venues` | Venue 列表 |
| GET | `/api/venues/[slug]` | Venue 详情 |
| GET | `/api/activity` | 活动日志 |
| GET | `/api/notifications` | 通知列表 |
| PATCH | `/api/notifications/read` | 标记已读 |

## License

MIT
