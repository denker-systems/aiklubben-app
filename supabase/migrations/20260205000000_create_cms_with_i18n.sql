-- ==========================================
-- CMS Tables with i18n support
-- ==========================================

-- CONTENT (courses, resources, platforms, events)
CREATE TABLE IF NOT EXISTS public.content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('kurser', 'resurser', 'plattformar', 'event')),
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  featured_image text,
  level text,
  duration integer DEFAULT 0,
  lessons_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.content_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  locale text NOT NULL CHECK (locale IN ('sv', 'en')),
  title text NOT NULL,
  excerpt text,
  body text,
  UNIQUE(content_id, locale)
);

-- COURSE LESSONS
CREATE TABLE IF NOT EXISTS public.course_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  order_index integer NOT NULL DEFAULT 0,
  duration_minutes integer DEFAULT 10,
  xp_reward integer DEFAULT 10,
  is_locked boolean DEFAULT false,
  prerequisite_lesson_id uuid REFERENCES public.course_lessons(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.course_lesson_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  locale text NOT NULL CHECK (locale IN ('sv', 'en')),
  title text NOT NULL,
  description text,
  UNIQUE(lesson_id, locale)
);

-- LESSON STEPS
CREATE TABLE IF NOT EXISTS public.lesson_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  step_type text NOT NULL CHECK (step_type IN (
    'content', 'multiple_choice', 'fill_blank', 'true_false',
    'reflection', 'highlight', 'word_bank', 'ordering',
    'match_pairs', 'code_snippet', 'video', 'image_choice',
    'category_sort', 'spot_error', 'slider'
  )),
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lesson_step_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id uuid NOT NULL REFERENCES public.lesson_steps(id) ON DELETE CASCADE,
  locale text NOT NULL CHECK (locale IN ('sv', 'en')),
  content jsonb NOT NULL,
  correct_answer text,
  explanation text,
  UNIQUE(step_id, locale)
);

-- NEWS
CREATE TABLE IF NOT EXISTS public.news_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  emoji text NOT NULL DEFAULT '📰',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.news_category_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.news_categories(id) ON DELETE CASCADE,
  locale text NOT NULL CHECK (locale IN ('sv', 'en')),
  name text NOT NULL,
  UNIQUE(category_id, locale)
);

CREATE TABLE IF NOT EXISTS public.news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  image_url text,
  author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  category_id uuid REFERENCES public.news_categories(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.news_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id uuid NOT NULL REFERENCES public.news(id) ON DELETE CASCADE,
  locale text NOT NULL CHECK (locale IN ('sv', 'en')),
  title text NOT NULL,
  summary text,
  body text,
  UNIQUE(news_id, locale)
);

-- ==========================================
-- LOCALIZED VIEWS (flat joins for easy querying)
-- ==========================================

CREATE OR REPLACE VIEW public.content_localized AS
SELECT
  c.id, c.category, c.status, c.featured_image, c.level,
  c.duration, c.lessons_count, c.created_at, c.updated_at,
  ct.locale, ct.title, ct.excerpt, ct.body
FROM public.content c
JOIN public.content_translations ct ON c.id = ct.content_id;

CREATE OR REPLACE VIEW public.course_lessons_localized AS
SELECT
  cl.id, cl.course_id, cl.order_index, cl.duration_minutes,
  cl.xp_reward, cl.is_locked, cl.prerequisite_lesson_id,
  cl.created_at, cl.updated_at,
  clt.locale, clt.title, clt.description
FROM public.course_lessons cl
JOIN public.course_lesson_translations clt ON cl.id = clt.lesson_id;

CREATE OR REPLACE VIEW public.lesson_steps_localized AS
SELECT
  ls.id, ls.lesson_id, ls.step_type, ls.order_index, ls.created_at,
  lst.locale, lst.content, lst.correct_answer, lst.explanation
FROM public.lesson_steps ls
JOIN public.lesson_step_translations lst ON ls.id = lst.step_id;

CREATE OR REPLACE VIEW public.news_localized AS
SELECT
  n.id, n.is_published, n.published_at, n.image_url,
  n.author_id, n.category_id, n.created_at, n.updated_at,
  nt.locale, nt.title, nt.summary, nt.body
FROM public.news n
JOIN public.news_translations nt ON n.id = nt.news_id;

CREATE OR REPLACE VIEW public.news_categories_localized AS
SELECT
  nc.id, nc.emoji, nc.created_at,
  nct.locale, nct.name
FROM public.news_categories nc
JOIN public.news_category_translations nct ON nc.id = nct.category_id;

-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_content_category ON public.content(category);
CREATE INDEX IF NOT EXISTS idx_content_status ON public.content(status);
CREATE INDEX IF NOT EXISTS idx_content_translations_locale ON public.content_translations(locale);
CREATE INDEX IF NOT EXISTS idx_content_translations_content ON public.content_translations(content_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_course ON public.course_lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_order ON public.course_lessons(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_course_lesson_translations_locale ON public.course_lesson_translations(locale);
CREATE INDEX IF NOT EXISTS idx_lesson_steps_lesson ON public.lesson_steps(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_steps_order ON public.lesson_steps(lesson_id, order_index);
CREATE INDEX IF NOT EXISTS idx_lesson_step_translations_locale ON public.lesson_step_translations(locale);
CREATE INDEX IF NOT EXISTS idx_news_published ON public.news(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_translations_locale ON public.news_translations(locale);
CREATE INDEX IF NOT EXISTS idx_news_category_translations_locale ON public.news_category_translations(locale);

-- ==========================================
-- RLS POLICIES
-- ==========================================
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lesson_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_step_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_category_translations ENABLE ROW LEVEL SECURITY;

-- Public read for all content
CREATE POLICY "Public read content" ON public.content FOR SELECT USING (true);
CREATE POLICY "Public read content_translations" ON public.content_translations FOR SELECT USING (true);
CREATE POLICY "Public read course_lessons" ON public.course_lessons FOR SELECT USING (true);
CREATE POLICY "Public read course_lesson_translations" ON public.course_lesson_translations FOR SELECT USING (true);
CREATE POLICY "Public read lesson_steps" ON public.lesson_steps FOR SELECT USING (true);
CREATE POLICY "Public read lesson_step_translations" ON public.lesson_step_translations FOR SELECT USING (true);
CREATE POLICY "Public read news" ON public.news FOR SELECT USING (true);
CREATE POLICY "Public read news_translations" ON public.news_translations FOR SELECT USING (true);
CREATE POLICY "Public read news_categories" ON public.news_categories FOR SELECT USING (true);
CREATE POLICY "Public read news_category_translations" ON public.news_category_translations FOR SELECT USING (true);

-- Admin write policies
CREATE POLICY "Admin write content" ON public.content FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin write content_translations" ON public.content_translations FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin write course_lessons" ON public.course_lessons FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin write course_lesson_translations" ON public.course_lesson_translations FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin write lesson_steps" ON public.lesson_steps FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin write lesson_step_translations" ON public.lesson_step_translations FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin write news" ON public.news FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin write news_translations" ON public.news_translations FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin write news_categories" ON public.news_categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin write news_category_translations" ON public.news_category_translations FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ==========================================
-- GRANTS
-- ==========================================

-- Views
GRANT SELECT ON public.content_localized TO anon, authenticated;
GRANT SELECT ON public.course_lessons_localized TO anon, authenticated;
GRANT SELECT ON public.lesson_steps_localized TO anon, authenticated;
GRANT SELECT ON public.news_localized TO anon, authenticated;
GRANT SELECT ON public.news_categories_localized TO anon, authenticated;

-- Base tables (read)
GRANT SELECT ON public.content TO anon, authenticated;
GRANT SELECT ON public.content_translations TO anon, authenticated;
GRANT SELECT ON public.course_lessons TO anon, authenticated;
GRANT SELECT ON public.course_lesson_translations TO anon, authenticated;
GRANT SELECT ON public.lesson_steps TO anon, authenticated;
GRANT SELECT ON public.lesson_step_translations TO anon, authenticated;
GRANT SELECT ON public.news TO anon, authenticated;
GRANT SELECT ON public.news_translations TO anon, authenticated;
GRANT SELECT ON public.news_categories TO anon, authenticated;
GRANT SELECT ON public.news_category_translations TO anon, authenticated;

-- Base tables (write for authenticated, admin policy handles authorization)
GRANT INSERT, UPDATE, DELETE ON public.content TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.content_translations TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.course_lessons TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.course_lesson_translations TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.lesson_steps TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.lesson_step_translations TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.news TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.news_translations TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.news_categories TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.news_category_translations TO authenticated;

-- Updated_at triggers
CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON public.content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_lessons_updated_at BEFORE UPDATE ON public.course_lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON public.news
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
