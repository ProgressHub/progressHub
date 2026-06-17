-- 
-- Student Learning Tracker
-- Production-Ready SQL Schema & Migration Script
-- Designed for Supabase PostgreSQL Database with Row Level Security (RLS)
-- 

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. TABLES DESIGN
-- ==========================================

-- PROFILES (Syncs with Supabase Auth users)
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    role text not null check (role in ('student', 'teacher')),
    full_name text not null,
    email text not null unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PERSONAL TASKS (Personal microtodo planner for students)
create table if not exists public.tasks (
    id uuid default gen_random_uuid() primary key,
    student_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    subject text not null,
    due_date date not null,
    status text not null check (status in ('pending', 'completed')) default 'pending',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CLASSROOM ASSIGNMENTS (Teacher posts assignments, resources, study guides)
create table if not exists public.assignments (
    id uuid default gen_random_uuid() primary key,
    teacher_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    subject text not null,
    deadline timestamp with time zone not null,
    description text,
    file_url text, -- Supabase Storage download link
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- DAILY ATTENDANCE ROLL (Teacher marks daily, students check history)
create table if not exists public.attendance (
    id uuid default gen_random_uuid() primary key,
    student_id uuid references public.profiles(id) on delete cascade not null,
    subject text not null,
    date date not null,
    status text not null check (status in ('present', 'absent', 'late')),
    unique (student_id, subject, date) -- Avoid duplication roll calls per subject slot
);

-- QUIZZES (MCQ Exam profiles published by teachers)
create table if not exists public.quizzes (
    id uuid default gen_random_uuid() primary key,
    teacher_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    subject text not null,
    duration_minutes integer not null default 15 check (duration_minutes > 0),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- QUIZ QUESTIONS (MCQ question catalogs linked to quiz)
create table if not exists public.quiz_questions (
    id uuid default gen_random_uuid() primary key,
    quiz_id uuid references public.quizzes(id) on delete cascade not null,
    question text not null,
    option_a text not null,
    option_b text not null,
    option_c text not null,
    option_d text not null,
    correct_answer text not null check (correct_answer in ('A', 'B', 'C', 'D'))
);

-- QUIZ ATTEMPTS (Automatic evaluated student exam grades archives)
create table if not exists public.quiz_attempts (
    id uuid default gen_random_uuid() primary key,
    quiz_id uuid references public.quizzes(id) on delete cascade not null,
    student_id uuid references public.profiles(id) on delete cascade not null,
    score integer not null check (score >= 0 and score <= 100),
    attempted_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- NOTIFICATIONS (In-app reminders alerts inbox)
create table if not exists public.notifications (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    message text not null,
    is_read boolean not null default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 2. PERFORMANCE INDEXS
-- ==========================================
create index if not exists idx_tasks_student_id on public.tasks(student_id);
create index if not exists idx_assignments_subject on public.assignments(subject);
create index if not exists idx_attendance_student_id on public.attendance(student_id);
create index if not exists idx_quiz_questions_quiz_id on public.quiz_questions(quiz_id);
create index if not exists idx_quiz_attempts_student_id on public.quiz_attempts(student_id);
create index if not exists idx_notifications_user_id on public.notifications(user_id);

-- ==========================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.assignments enable row level security;
alter table public.attendance enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.notifications enable row level security;

-- Profiles: Anyone authenticated can view other members directory but only edit own row
create policy "Allow profile read access" on public.profiles 
    for select using (auth.role() = 'authenticated');
create policy "Allow individual profile update" on public.profiles 
    for update using (auth.uid() = id);

-- Tasks: Students only read and write own tasks
create policy "Students command own tasks" on public.tasks 
    for all using (auth.uid() = student_id);

-- Assignments: Anyone view select, but only Teachers can insert/update/delete
create policy "Read assignments" on public.assignments 
    for select using (auth.role() = 'authenticated');
create policy "Teachers create assignments" on public.assignments 
    for insert with check (
        exists (select 1 from public.profiles where id = auth.uid() and role = 'teacher')
    );

-- Attendance: Students can view; Teachers can insert & select
create policy "Read attendance" on public.attendance 
    for select using (auth.role() = 'authenticated');
create policy "Teachers record attendance" on public.attendance 
    for insert with check (
        exists (select 1 from public.profiles where id = auth.uid() and role = 'teacher')
    );

-- Quizzes: Read to all; modifications for teachers only
create policy "View quizzes" on public.quizzes 
    for select using (auth.role() = 'authenticated');
create policy "Teachers create quizzes" on public.quizzes 
    for insert with check (
        exists (select 1 from public.profiles where id = auth.uid() and role = 'teacher')
    );

create policy "View questions" on public.quiz_questions 
    for select using (auth.role() = 'authenticated');
create policy "Teachers edit questions" on public.quiz_questions 
    for insert with check (
        exists (select 1 from public.profiles where id = auth.uid() and role = 'teacher')
    );

-- Quiz Attempts: Students of the attempt or Teachers can read; Students can write own scores
create policy "View attempts" on public.quiz_attempts 
    for select using (
        auth.uid() = student_id or 
        exists (select 1 from public.profiles where id = auth.uid() and role = 'teacher')
    );
create policy "Students save own score attempts" on public.quiz_attempts 
    for insert with check (auth.uid() = student_id);

-- Notifications: Read and update limited to the target owner
create policy "Owner read/write own notifications" on public.notifications 
    for all using (auth.uid() = user_id);

-- ==========================================
-- 4. PROFILE GENERATION TRIGGER ON SIGNUP
-- ==========================================
-- Triggers profile creation dynamically on Supabase signUp() registration
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Student User'),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================
-- 5. STORAGE BUCKET CONFIGURATION (Note)
-- ==========================================
-- Safe bucket for assignment files uploads
-- To configure manually in Supabase:
-- 1. Create a public bucket in "Storage" named "assignment-notes"
-- 2. Define safety policy: "Authenticated users can read, Teachers can upload files"
