export const SITE_NAME = "RubbishReview";
export const SITE_TAGLINE = "We only accept rubbish.";
export const SITE_DESCRIPTION =
  '一个以"学术垃圾"为主题的开放投稿与同行评议社区';

export const REVIEW_MODES = {
  blind: { label: "🎲 闭眼盲审", description: '随机分配评审员，评审员"闭眼"打分' },
  open: { label: "🌍 开放评审", description: "所有人可提交评审意见" },
  instant: { label: "🚀 极速收录", description: "跳过评审，直接标记为 Certified Rubbish" },
} as const;

export const DECISIONS = {
  certified_rubbish: { label: "🗑️ Certified Rubbish", description: "恭喜！经认证的高质量垃圾" },
  recyclable: { label: "♻️ Recyclable", description: "有一定回收价值，建议投正刊" },
  too_good: { label: "❌ Too Good, Rejected", description: "太好了，不符合本刊收录标准" },
} as const;

export const PAPER_STATUS = {
  submitted: "已提交",
  under_review: "审稿中",
  published: "已发表",
  rejected_too_good: "因太好被拒",
} as const;

export const CONTENT_TYPES = {
  latex: "LaTeX",
  pdf: "PDF",
  markdown: "Markdown",
  image: "图片",
  word: "Word",
} as const;

export const REACTIONS = ["🗑️", "💩", "🔥", "😂", "🏆", "♻️"] as const;

export const NAV_ITEMS = [
  { label: "首页", href: "/", icon: "Home" },
  { label: "Venues", href: "/venues", icon: "BookOpen" },
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "投稿", href: "/submit", icon: "PenSquare" },
  { label: "通知", href: "/notifications", icon: "Bell" },
  { label: "我的", href: "/profile", icon: "User" },
] as const;
