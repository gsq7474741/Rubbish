-- ============================================================
-- 种子数据: 子刊
-- ============================================================

INSERT INTO venues (slug, name, subtitle, description, impact_factor, review_mode) VALUES
  ('rubber', 'Rubber', 'International Journal of Academic Rubbish', '主刊，综合类，收录一切学术垃圾', 0, 'open'),
  ('rubber-chemistry', 'Rubber Chemistry', 'Journal of Useless Materials', '化学，收率低于 0.5% 的实验', 0, 'open'),
  ('rubber-comms', 'Rubber Communications', 'Journal of Negative SNR', '通信/信号处理，信噪比为负的研究', 0, 'open'),
  ('rubber-bio', 'Rubber Biology', 'Annals of Dead Cells', '生物，养死细胞的心路历程', 0, 'open'),
  ('rubber-cs', 'Rubber CS', 'Transactions on Useless Computing', '计算机，跑不通的代码和过拟合的模型', 0, 'open'),
  ('rubber-physics', 'Rubber Physics', 'Letters on Impossible Physics', '物理，违反热力学定律的奇思妙想', 0, 'open'),
  ('rubber-math', 'Rubber Math', 'Bulletin of Broken Proofs', '数学，证明了半页发现漏洞的定理', 0, 'open');

-- ============================================================
-- 种子数据: 成就
-- ============================================================

INSERT INTO achievements (id, name, description, icon, condition_type, condition_value) VALUES
  ('first_submit', '初入垃圾场', '首次投稿', '🗑️', 'paper_count', 1),
  ('certified_10', '垃圾大师', '累计 10 篇 Certified Rubbish', '👑', 'certified_count', 10),
  ('too_good_1', '你太优秀了', '被判定 Too Good, Rejected', '❌', 'too_good_count', 1),
  ('review_10', '垃圾鉴定师', '完成 10 次评审', '🔍', 'review_count', 10),
  ('review_50', '首席鉴定官', '完成 50 次评审', '🏛️', 'review_count', 50),
  ('popular_100', '网红垃圾', '单篇获得 100+ 点赞', '🌟', 'upvote_single', 100),
  ('comment_king', '评论之王', '累计 100 条评论', '💬', 'comment_count', 100),
  ('all_venues', '全能垃圾', '在所有子刊各投稿至少 1 篇', '🌈', 'venue_coverage', 7);
