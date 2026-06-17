-- 
-- Student Learning Tracker - v2 Schema Migration
-- Structural updates for classrooms, student registries, public registration gates, and teacher invites
-- 

-- ==========================================
-- 1. SCHEMAS & NEW TABLES
-- ==========================================

-- Classes table
create table if not exists public.classes (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    section text not null,
    teacher_id uuid references public.profiles(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Teacher invite codes
create table if not exists public.teacher_invite_codes (
    id uuid default gen_random_uuid() primary key,
    code text not null unique,
    is_used boolean not null default false,
    expires_at timestamp with time zone not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Student Registry for whitelists
create table if not exists public.student_registry (
    id uuid default gen_random_uuid() primary key,
    roll_no text not null unique,
    full_name text not null,
    email text not null,
    class_id uuid references public.classes(id) on delete cascade not null,
    is_registered boolean not null default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 2. ALTERING EXISTING TABLES
-- ==========================================

-- Adding roll_no and class_id to profiles
alter table public.profiles 
    add column if not exists roll_no text,
    add column if not exists class_id uuid references public.classes(id) on delete set null;

-- Adding class_id to assignments
alter table public.assignments 
    add column if not exists class_id uuid references public.classes(id) on delete cascade;

-- Adding class_id to quizzes
alter table public.quizzes 
    add column if not exists class_id uuid references public.classes(id) on delete cascade;

-- Adding class_id to attendance
alter table public.attendance 
    add column if not exists class_id uuid references public.classes(id) on delete cascade;

-- ==========================================
-- 3. INDEXES & CONSTRAINT UPDATES
-- ==========================================
create index if not exists idx_profiles_class_id on public.profiles(class_id);
create index if not exists idx_profiles_roll_no on public.profiles(roll_no);
create index if not exists idx_assignments_class_id on public.assignments(class_id);
create index if not exists idx_quizzes_class_id on public.quizzes(class_id);
create index if not exists idx_attendance_class_id on public.attendance(class_id);
create index if not exists idx_student_registry_roll_no on public.student_registry(roll_no);

-- ==========================================
-- 4. ROW-LEVEL SECURITY (RLS) POLICIES
-- ==========================================
alter table public.classes enable row level security;
alter table public.teacher_invite_codes enable row level security;
alter table public.student_registry enable row level security;

-- Drop obsolete select policy for profiles if needed, or refine
-- Update Profiles RLS: Users can view profiles, but write access restricted to own trigger or auth
create policy "Allow secure profiles select" on public.profiles
    for select using (auth.role() = 'authenticated');

-- Classes Policies:
-- Teachers can insert/update/delete classes they manage
-- Anyone authenticated can view classes (needed for joins)
create policy "Anyone authentic can view classes" on public.classes
    for select using (auth.role() = 'authenticated');

create policy "Teachers handle classes" on public.classes
    for all using (
        exists (select 1 from public.profiles where id = auth.uid() and role = 'teacher')
    );

-- Invite Codes RLS: Only accessible for verification by registration functions, or let teachers read
create policy "Anonymous/authenticated verification for invite codes" on public.teacher_invite_codes
    for select using (true);

-- Student Registry RLS: Teachers can view/insert/update
create policy "Teachers manage student registry" on public.student_registry
    for all using (
        exists (select 1 from public.profiles where id = auth.uid() and role = 'teacher')
    );

create policy "Verification reads student registry" on public.student_registry
    for select using (true);

-- Assignments RLS Overrides/Updates: 
-- Students can only view assignments that match their profile.class_id
drop policy if exists "Read assignments" on public.assignments;
create policy "Students view class assignments" on public.assignments
    for select using (
        exists (
            select 1 from public.profiles 
            where profiles.id = auth.uid() 
            and (profiles.role = 'teacher' or profiles.class_id = assignments.class_id)
        )
    );

-- Quizzes RLS Overrides/Updates:
-- Students can only see quizzes that belong to their class_id
drop policy if exists "View quizzes" on public.quizzes;
create policy "Students view class quizzes" on public.quizzes
    for select using (
        exists (
            select 1 from public.profiles 
            where profiles.id = auth.uid() 
            and (profiles.role = 'teacher' or profiles.class_id = quizzes.class_id)
        )
    );

-- Attendance RLS Overrides/Updates:
-- Students only see their own attendance logs
-- Teachers can see everything or logs of classes they manage
drop policy if exists "Read attendance" on public.attendance;
create policy "Attendance viewing policy" on public.attendance
    for select using (
        auth.uid() = student_id or
        exists (select 1 from public.profiles where id = auth.uid() and role = 'teacher')
    );

-- ==========================================
-- 5. SEED DATA RECORDS (SUPABASE EXTRAS)
-- ==========================================

-- Insert Classes
-- Note: Replace placeholders with real teacher UUID if setting up manually
-- INSERT INTO public.classes (id, name, section, teacher_id) 
-- VALUES 
--   ('10000000-0000-0000-0000-000000000001', 'CSE', 'A', NULL),
--   ('10000000-0000-0000-0000-000000000002', 'CSE', 'B', NULL);

-- Insert Student Registries
-- INSERT INTO public.student_registry (roll_no, full_name, email, class_id, is_registered)
-- VALUES 
--   ('22CSE001', 'John Doe', 'john@example.com', '10000000-0000-0000-0000-000000000001', false),
--   ('22CSE002', 'Jane Smith', 'jane@example.com', '10000000-0000-0000-0000-000000000001', false),
--   ('22CSE003', 'Bob Johnson', 'bob@example.com', '10000000-0000-0000-0000-000000000002', false);

-- Insert Representative Invites
-- INSERT INTO public.teacher_invite_codes (code, expires_at)
-- VALUES ('INVITE-TEACHER-1', timezone('utc'::text, now() + interval '30 days'));
