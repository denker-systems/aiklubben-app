-- Create lesson system tables

-- Course Lessons table
CREATE TABLE IF NOT EXISTS public.course_lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    duration_minutes INTEGER DEFAULT 10,
    xp_reward INTEGER DEFAULT 10,
    is_locked BOOLEAN DEFAULT false,
    prerequisite_lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Lesson Steps table
CREATE TABLE IF NOT EXISTS public.lesson_steps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lesson_id UUID NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
    step_type TEXT NOT NULL CHECK (step_type IN ('content', 'multiple_choice', 'fill_blank', 'true_false', 'reflection')),
    order_index INTEGER NOT NULL DEFAULT 0,
    content JSONB NOT NULL,
    correct_answer TEXT,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User Lesson Progress table
CREATE TABLE IF NOT EXISTS public.user_lesson_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    current_step_index INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    total_steps INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    xp_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, lesson_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_course_lessons_course_id ON public.course_lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_order ON public.course_lessons(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_lesson_steps_lesson_id ON public.lesson_steps(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_steps_order ON public.lesson_steps(lesson_id, order_index);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_id ON public.user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_lesson_id ON public.user_lesson_progress(lesson_id);

-- Enable Row Level Security
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for course_lessons (public read)
CREATE POLICY "Anyone can view lessons"
    ON public.course_lessons FOR SELECT
    USING (true);

CREATE POLICY "Only admins can insert lessons"
    ON public.course_lessons FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Only admins can update lessons"
    ON public.course_lessons FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- RLS Policies for lesson_steps (public read)
CREATE POLICY "Anyone can view steps"
    ON public.lesson_steps FOR SELECT
    USING (true);

CREATE POLICY "Only admins can insert steps"
    ON public.lesson_steps FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Only admins can update steps"
    ON public.lesson_steps FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- RLS Policies for user_lesson_progress (users can only see/modify their own)
CREATE POLICY "Users can view their own progress"
    ON public.user_lesson_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
    ON public.user_lesson_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
    ON public.user_lesson_progress FOR UPDATE
    USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_course_lessons_updated_at
    BEFORE UPDATE ON public.course_lessons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_lesson_progress_updated_at
    BEFORE UPDATE ON public.user_lesson_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample lesson data for testing (optional - can be removed in production)
-- This creates a sample lesson for the first course
DO $$
DECLARE
    sample_course_id UUID;
    sample_lesson_id UUID;
BEGIN
    -- Get first course ID
    SELECT id INTO sample_course_id FROM public.content WHERE category = 'kurser' LIMIT 1;
    
    IF sample_course_id IS NOT NULL THEN
        -- Create a sample lesson
        INSERT INTO public.course_lessons (
            course_id, title, description, order_index, duration_minutes, xp_reward
        ) VALUES (
            sample_course_id,
            'Introduktion till AI',
            'Lär dig grunderna i artificiell intelligens',
            1,
            5,
            10
        ) RETURNING id INTO sample_lesson_id;
        
        -- Create sample steps for the lesson
        INSERT INTO public.lesson_steps (lesson_id, step_type, order_index, content, correct_answer, explanation) VALUES
        -- Step 1: Content
        (sample_lesson_id, 'content', 1, 
         '{"title": "Vad är AI?", "body": "Artificiell intelligens (AI) är förmågan hos maskiner att utföra uppgifter som normalt kräver mänsklig intelligens, såsom att lära sig, resonera och lösa problem.", "image_url": null}'::jsonb,
         NULL, NULL),
        
        -- Step 2: Multiple Choice
        (sample_lesson_id, 'multiple_choice', 2,
         '{"question": "Vad står AI för?", "options": ["Automatisk Information", "Artificiell Intelligens", "Avancerad Internet", "Analog Integration"]}'::jsonb,
         '1', 'AI står för Artificiell Intelligens - förmågan hos maskiner att simulera mänsklig intelligens.'),
        
        -- Step 3: True/False
        (sample_lesson_id, 'true_false', 3,
         '{"statement": "Maskininlärning är en del av AI."}'::jsonb,
         'true', 'Ja, maskininlärning är en viktig underkategori av artificiell intelligens.'),
        
        -- Step 4: Fill Blank
        (sample_lesson_id, 'fill_blank', 4,
         '{"text": "ChatGPT är ett exempel på en ___ modell.", "alternatives": ["språk", "language", "LLM"]}'::jsonb,
         'språk', 'ChatGPT är en Large Language Model (LLM) - en stor språkmodell.'),
        
        -- Step 5: Reflection
        (sample_lesson_id, 'reflection', 5,
         '{"prompt": "Hur skulle du vilja använda AI i ditt dagliga liv?", "placeholder": "Skriv dina tankar här...", "min_words": 10}'::jsonb,
         NULL, NULL);
    END IF;
END $$;
