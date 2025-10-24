-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create exams table
CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  course_code TEXT NOT NULL,
  students_count INTEGER NOT NULL DEFAULT 0,
  duration INTEGER NOT NULL DEFAULT 120,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own exams"
  ON public.exams FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own exams"
  ON public.exams FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exams"
  ON public.exams FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exams"
  ON public.exams FOR DELETE
  USING (auth.uid() = user_id);

-- Create rooms table
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 0,
  building TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rooms"
  ON public.rooms FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own rooms"
  ON public.rooms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rooms"
  ON public.rooms FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rooms"
  ON public.rooms FOR DELETE
  USING (auth.uid() = user_id);

-- Create timeslots table
CREATE TABLE public.timeslots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.timeslots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own timeslots"
  ON public.timeslots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own timeslots"
  ON public.timeslots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own timeslots"
  ON public.timeslots FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own timeslots"
  ON public.timeslots FOR DELETE
  USING (auth.uid() = user_id);

-- Create schedules table
CREATE TABLE public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  timeslot_id UUID NOT NULL REFERENCES public.timeslots(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(exam_id),
  UNIQUE(room_id, timeslot_id)
);

ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own schedules"
  ON public.schedules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own schedules"
  ON public.schedules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own schedules"
  ON public.schedules FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own schedules"
  ON public.schedules FOR DELETE
  USING (auth.uid() = user_id);

-- Enable realtime for schedules
ALTER PUBLICATION supabase_realtime ADD TABLE public.schedules;