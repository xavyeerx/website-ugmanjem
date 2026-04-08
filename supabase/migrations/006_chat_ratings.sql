-- ============================================
-- Chat Ratings Table
-- Menyimpan umpan balik pengguna terhadap jawaban chatbot
-- Rating: 4 skala kategorikal sesuai batasan penelitian BAB 1
-- very_helpful (4), helpful (3), not_helpful (2), very_not_helpful (1)
-- ============================================

CREATE TABLE chat_ratings (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    question    TEXT NOT NULL,
    answer      TEXT NOT NULL,
    rating      TEXT NOT NULL CHECK (rating IN ('very_helpful', 'helpful', 'not_helpful', 'very_not_helpful')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index untuk query analitik distribusi rating dan time-series
CREATE INDEX idx_chat_ratings_rating  ON chat_ratings (rating);
CREATE INDEX idx_chat_ratings_created ON chat_ratings (created_at DESC);

-- RLS: pengguna anonim bisa INSERT, hanya authenticated yang bisa SELECT
ALTER TABLE chat_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_insert_rating"
    ON chat_ratings FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "allow_read_rating"
    ON chat_ratings FOR SELECT
    TO authenticated
    USING (true);
