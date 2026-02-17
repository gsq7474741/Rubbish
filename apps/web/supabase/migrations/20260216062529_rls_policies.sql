
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read venues" ON venues FOR SELECT USING (true);

ALTER TABLE papers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read papers" ON papers FOR SELECT USING (true);
CREATE POLICY "Author insert papers" ON papers FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Author update papers" ON papers FOR UPDATE USING (auth.uid() = author_id);

ALTER TABLE paper_authors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read paper_authors" ON paper_authors FOR SELECT USING (true);
CREATE POLICY "Author manage paper_authors" ON paper_authors FOR ALL USING (
  EXISTS (SELECT 1 FROM papers WHERE papers.id = paper_authors.paper_id AND papers.author_id = auth.uid())
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Reviewer insert reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Reviewer update own reviews" ON reviews FOR UPDATE USING (auth.uid() = reviewer_id);

ALTER TABLE rebuttals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read rebuttals" ON rebuttals FOR SELECT USING (true);
CREATE POLICY "Author insert rebuttals" ON rebuttals FOR INSERT WITH CHECK (auth.uid() = author_id);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read comments" ON comments FOR SELECT USING (true);
CREATE POLICY "User insert comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own votes" ON votes FOR ALL USING (auth.uid() = user_id);

ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read reactions" ON reactions FOR SELECT USING (true);
CREATE POLICY "Own reactions" ON reactions FOR ALL USING (auth.uid() = user_id);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own bookmarks" ON bookmarks FOR ALL USING (auth.uid() = user_id);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read achievements" ON achievements FOR SELECT USING (true);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read user_achievements" ON user_achievements FOR SELECT USING (true);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User insert reports" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read invite_codes" ON invite_codes FOR SELECT USING (true);
CREATE POLICY "Creator manage invite_codes" ON invite_codes FOR INSERT WITH CHECK (auth.uid() = creator_id);
