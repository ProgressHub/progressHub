/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';
import { Profile, Task, Assignment, Attendance, Quiz, QuizQuestion, QuizAttempt, Notification as AppNotification, UserRole } from '../types';

// Read configuration from environment
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==========================================
// MOCK SIMULATOR FOR DEV/DEMO ENVIRONMENT
// ==========================================

const MOCK_PROFILES_KEY = 'slt_profiles';
const MOCK_TASKS_KEY = 'slt_tasks';
const MOCK_ASSIGNMENTS_KEY = 'slt_assignments';
const MOCK_ATTENDANCE_KEY = 'slt_attendance';
const MOCK_QUIZZES_KEY = 'slt_quizzes';
const MOCK_QUESTIONS_KEY = 'slt_quiz_questions';
const MOCK_ATTEMPTS_KEY = 'slt_quiz_attempts';
const MOCK_NOTIFICATIONS_KEY = 'slt_notifications';
const MOCK_CURRENT_USER_KEY = 'slt_current_user';
const MOCK_CLASSES_KEY = 'slt_classes';
const MOCK_INVITES_KEY = 'slt_invite_codes';
const MOCK_REGISTRY_KEY = 'slt_student_registry';

import { Class, TeacherInviteCode, StudentRegistry } from '../types';

// Setup Initial Seed Data if local storage is empty
const seedData = {
  classes: [
    { id: 'class-1', name: 'CSE', section: 'A', teacher_id: 'teach-01', created_at: new Date().toISOString() },
    { id: 'class-2', name: 'CSE', section: 'B', teacher_id: 'teach-01', created_at: new Date().toISOString() }
  ] as Class[],

  inviteCodes: [
    { id: 'inv-1', code: 'INVITE-TEACHER-1', is_used: false, expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(), created_at: new Date().toISOString() },
    { id: 'inv-2', code: 'INVITE-TEACHER-EXPIRED', is_used: false, expires_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), created_at: new Date().toISOString() }
  ] as TeacherInviteCode[],

  studentRegistry: [
    { id: 'reg-1', roll_no: '22CSE001', full_name: 'Alex Mercer', email: 'alex@school.com', class_id: 'class-1', is_registered: true, created_at: new Date().toISOString() },
    { id: 'reg-2', roll_no: '22CSE002', full_name: 'Emily Watson', email: 'emily@school.com', class_id: 'class-1', is_registered: true, created_at: new Date().toISOString() },
    { id: 'reg-3', roll_no: '22CSE003', full_name: 'Bob Johnson', email: 'bob@example.com', class_id: 'class-2', is_registered: false, created_at: new Date().toISOString() }
  ] as StudentRegistry[],

  profiles: [
    { id: 'stud-01', role: 'student', full_name: 'Alex Mercer', email: 'alex@school.com', roll_no: '22CSE001', class_id: 'class-1', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString() },
    { id: 'stud-02', role: 'student', full_name: 'Emily Watson', email: 'emily@school.com', roll_no: '22CSE002', class_id: 'class-1', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString() },
    { id: 'teach-01', role: 'teacher', full_name: 'Dr. Sarah Jenkins', email: 'jenkins@school.com', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString() },
    { id: 'teach-02', role: 'teacher', full_name: 'Professor Jenkins', email: 'teacher@example.com', created_at: new Date().toISOString() }
  ] as Profile[],

  tasks: [
    { id: 't-1', student_id: 'stud-01', title: 'Prepare Chemistry Lab Report', subject: 'Chemistry', due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString().slice(0, 10), status: 'pending', created_at: new Date().toISOString() },
    { id: 't-2', student_id: 'stud-01', title: 'Solve Calculus Exercises Chapter 4', subject: 'Mathematics', due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString().slice(0, 10), status: 'completed', created_at: new Date().toISOString() },
    { id: 't-3', student_id: 'stud-02', title: 'Read Chapter 3 of To Kill a Mockingbird', subject: 'English', due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1).toISOString().slice(0, 10), status: 'pending', created_at: new Date().toISOString() }
  ] as Task[],

  assignments: [
    { id: 'a-1', teacher_id: 'teach-01', title: 'Calculus Optimization Assignment', subject: 'Mathematics', deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString().slice(0, 16), description: 'Complete issues 1 to 10 on optimization formulas. Show all working clearly.', file_url: '/assets/calculus_assignment.pdf', class_id: 'class-1', created_at: new Date().toISOString() },
    { id: 'a-2', teacher_id: 'teach-01', title: 'Modern Organic Chemistry Syntheses', subject: 'Chemistry', deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString().slice(0, 16), description: 'Write down step-by-step synthetic mechanism instructions for the assigned compound.', file_url: '', class_id: 'class-1', created_at: new Date().toISOString() }
  ] as Assignment[],

  attendance: [
    { id: 'att-1', student_id: 'stud-01', subject: 'Mathematics', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString().slice(0, 10), status: 'present', class_id: 'class-1' },
    { id: 'att-2', student_id: 'stud-01', subject: 'Mathematics', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString().slice(0, 10), status: 'present', class_id: 'class-1' },
    { id: 'att-3', student_id: 'stud-01', subject: 'Mathematics', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString().slice(0, 10), status: 'absent', class_id: 'class-1' },
    { id: 'att-4', student_id: 'stud-01', subject: 'Chemistry', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString().slice(0, 10), status: 'present', class_id: 'class-1' },
    { id: 'att-5', student_id: 'stud-01', subject: 'Chemistry', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString().slice(0, 10), status: 'late', class_id: 'class-1' },
    { id: 'att-6', student_id: 'stud-02', subject: 'Mathematics', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString().slice(0, 10), status: 'present', class_id: 'class-1' },
  ] as Attendance[],

  quizzes: [
    { id: 'q-1', teacher_id: 'teach-01', title: 'Limits and Derivatives Pop Quiz', subject: 'Mathematics', duration_minutes: 10, class_id: 'class-1', created_at: new Date().toISOString() },
    { id: 'q-2', teacher_id: 'teach-01', title: 'Periodic Table Basics Quiz', subject: 'Chemistry', duration_minutes: 15, class_id: 'class-1', created_at: new Date().toISOString() }
  ] as Quiz[],

  quizQuestions: [
    { id: 'qq-1', quiz_id: 'q-1', question: 'What is the limit of (sin x)/x as x approaches 0?', option_a: '0', option_b: '1', option_c: 'Undefined', option_d: 'Infinity', correct_answer: 'B' },
    { id: 'qq-2', quiz_id: 'q-1', question: 'What is the derivative of x^2 + 5x with respect to x?', option_a: '2x + 5', option_b: 'x + 5', option_c: '2x', option_d: '5x', correct_answer: 'A' },
    { id: 'qq-3', quiz_id: 'q-1', question: 'If f(x) = c (constant), what is f\'(x)?', option_a: 'c', option_b: '1', option_c: '0', option_d: 'x', correct_answer: 'C' },
    
    { id: 'qq-4', quiz_id: 'q-2', question: 'Which element has the atomic symbol Na?', option_a: 'Neon', option_b: 'Sodium', option_c: 'Nitrogen', option_d: 'Lithium', correct_answer: 'B' },
    { id: 'qq-5', quiz_id: 'q-2', question: 'What is the noble gas in Period 1?', option_a: 'Hydrogen', option_b: 'Argon', option_c: 'Neon', option_d: 'Helium', correct_answer: 'D' }
  ] as QuizQuestion[],

  quizAttempts: [
    { id: 'qa-1', quiz_id: 'q-1', student_id: 'stud-01', score: 66, attempted_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
    { id: 'qa-2', quiz_id: 'q-2', student_id: 'stud-01', score: 100, attempted_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    { id: 'qa-3', quiz_id: 'q-1', student_id: 'stud-02', score: 100, attempted_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() }
  ] as QuizAttempt[],

  notifications: [
    { id: 'n-1', user_id: 'stud-01', title: 'New Assignment Uploaded', message: 'Dr. Sarah Jenkins posted: Calculus Optimization Assignment. Due in 5 days.', is_read: false, created_at: new Date().toISOString() },
    { id: 'n-2', user_id: 'stud-01', title: 'Incomplete Personal Task Due', message: 'Your personal task "Prepare Chemistry Lab Report" is due soon!', is_read: false, created_at: new Date().toISOString() },
    { id: 'n-3', user_id: 'teach-01', title: 'Quiz Completed', message: 'Alex Mercer completed the "Periodic Table Basics Quiz" with score 100%', is_read: true, created_at: new Date().toISOString() }
  ] as AppNotification[]
};

// Initialize localStorage if keys don't exist
const initializeMockLocalStorage = () => {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(MOCK_PROFILES_KEY)) {
    localStorage.setItem(MOCK_PROFILES_KEY, JSON.stringify(seedData.profiles));
    localStorage.setItem(MOCK_TASKS_KEY, JSON.stringify(seedData.tasks));
    localStorage.setItem(MOCK_ASSIGNMENTS_KEY, JSON.stringify(seedData.assignments));
    localStorage.setItem(MOCK_ATTENDANCE_KEY, JSON.stringify(seedData.attendance));
    localStorage.setItem(MOCK_QUIZZES_KEY, JSON.stringify(seedData.quizzes));
    localStorage.setItem(MOCK_QUESTIONS_KEY, JSON.stringify(seedData.quizQuestions));
    localStorage.setItem(MOCK_ATTEMPTS_KEY, JSON.stringify(seedData.quizAttempts));
    localStorage.setItem(MOCK_NOTIFICATIONS_KEY, JSON.stringify(seedData.notifications));
    localStorage.setItem(MOCK_CLASSES_KEY, JSON.stringify(seedData.classes));
    localStorage.setItem(MOCK_INVITES_KEY, JSON.stringify(seedData.inviteCodes));
    localStorage.setItem(MOCK_REGISTRY_KEY, JSON.stringify(seedData.studentRegistry));
  }
};

initializeMockLocalStorage();

// Helper to interact with Mock LocalStorage
const getMockData = <T>(key: string): T[] => {
  initializeMockLocalStorage();
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const saveMockData = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// SIMULATOR EXPORTS
export const mockDb = {
  // Profiles (Users)
  getProfiles: () => getMockData<Profile>(MOCK_PROFILES_KEY),
  saveProfiles: (profiles: Profile[]) => saveMockData(MOCK_PROFILES_KEY, profiles),
  getCurrentUser: () => {
    const userString = localStorage.getItem(MOCK_CURRENT_USER_KEY);
    return userString ? (JSON.parse(userString) as Profile) : null;
  },
  setCurrentUser: (profile: Profile | null) => {
    if (profile) {
      localStorage.setItem(MOCK_CURRENT_USER_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(MOCK_CURRENT_USER_KEY);
    }
  },

  // Personal Tasks
  getTasks: () => getMockData<Task>(MOCK_TASKS_KEY),
  saveTasks: (tasks: Task[]) => saveMockData(MOCK_TASKS_KEY, tasks),

  // Assignments
  getAssignments: () => getMockData<Assignment>(MOCK_ASSIGNMENTS_KEY),
  saveAssignments: (assignments: Assignment[]) => saveMockData(MOCK_ASSIGNMENTS_KEY, assignments),

  // Attendance
  getAttendance: () => getMockData<Attendance>(MOCK_ATTENDANCE_KEY),
  saveAttendance: (attendance: Attendance[]) => saveMockData(MOCK_ATTENDANCE_KEY, attendance),

  // Quizzes & Questions
  getQuizzes: () => getMockData<Quiz>(MOCK_QUIZZES_KEY),
  saveQuizzes: (quizzes: Quiz[]) => saveMockData(MOCK_QUIZZES_KEY, quizzes),
  getQuestions: () => getMockData<QuizQuestion>(MOCK_QUESTIONS_KEY),
  saveQuestions: (questions: QuizQuestion[]) => saveMockData(MOCK_QUESTIONS_KEY, questions),
  getAttempts: () => getMockData<QuizAttempt>(MOCK_ATTEMPTS_KEY),
  saveAttempts: (attempts: QuizAttempt[]) => saveMockData(MOCK_ATTEMPTS_KEY, attempts),

  // Notifications
  getNotifications: () => getMockData<AppNotification>(MOCK_NOTIFICATIONS_KEY),
  saveNotifications: (notifications: AppNotification[]) => saveMockData(MOCK_NOTIFICATIONS_KEY, notifications),

  // Classes, Invites, registries
  getClasses: () => getMockData<Class>(MOCK_CLASSES_KEY),
  saveClasses: (classes: Class[]) => saveMockData(MOCK_CLASSES_KEY, classes),
  getInviteCodes: () => getMockData<TeacherInviteCode>(MOCK_INVITES_KEY),
  saveInviteCodes: (codes: TeacherInviteCode[]) => saveMockData(MOCK_INVITES_KEY, codes),
  getStudentRegistry: () => getMockData<StudentRegistry>(MOCK_REGISTRY_KEY),
  saveStudentRegistry: (reg: StudentRegistry[]) => saveMockData(MOCK_REGISTRY_KEY, reg)
};

// ==========================================
// UNIFIED DATA SERVICE LAYER (SUPABASE + BACKUP)
// ==========================================

export const dbService = {
  // --- AUTH SECTION ---
  async login(emailInput: string, passwordInput: string): Promise<Profile> {
    if (isSupabaseConfigured && supabase) {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: emailInput,
        password: passwordInput,
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error('Authentication failed');
      
      // Fetch profile WITHOUT the classes join to avoid ambiguity error
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();
      
      if (profileError) throw profileError;

      // If student, fetch class info separately
      let prof = profileData as any;
      if (prof.role === 'student' && prof.class_id) {
        const { data: classData } = await supabase
          .from('classes')
          .select('name, section')
          .eq('id', prof.class_id)
          .single();
        
        if (classData) {
          prof.class_name = `${classData.name} - ${classData.section}`;
        }
      }
      
      return prof as Profile;
    } else {
      // Offline Simulation
      const profiles = mockDb.getProfiles();
      const matched = profiles.find(p => p.email.toLowerCase() === emailInput.toLowerCase());
      if (!matched) {
        throw new Error('User not found. Use "alex@school.com" or "jenkins@school.com" or register a new student account.');
      }
      
      if (matched.class_id) {
        const cls = mockDb.getClasses().find(c => c.id === matched.class_id);
        if (cls) {
          matched.class_name = `${cls.name} - ${cls.section}`;
        }
      }
      
      mockDb.setCurrentUser(matched);
      return matched;
    }
  },

  async registerStudent(rollNo: string, emailInput: string, passwordInput: string): Promise<Profile> {
    if (isSupabaseConfigured && supabase) {
      // 1. Search student_registry using roll number
      const { data: regData, error: regError } = await supabase
        .from('student_registry')
        .select('*')
        .eq('roll_no', rollNo);
      
      if (regError) throw regError;
      if (!regData || regData.length === 0) {
        throw new Error('Roll number not found.');
      }
      
      const registryEntry = regData[0];
      // 2. Verify is_registered = false
      if (registryEntry.is_registered) {
        throw new Error('This roll number already has an account.');
      }

      // 3. Create Supabase Auth account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: emailInput,
        password: passwordInput,
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error('Registration failed');

      // 4. Create profile automatically
      const newProfile: Profile = {
        id: authData.user.id,
        role: 'student',
        full_name: registryEntry.full_name,
        email: emailInput,
        roll_no: rollNo,
        class_id: registryEntry.class_id,
        created_at: new Date().toISOString()
      };

      const { data: profileVal, error: profileError } = await supabase
        .from('profiles')
        .upsert(newProfile)
        .select()
        .single();

      if (profileError) throw profileError;

      // 5. Update is_registered = true in registry
      const { error: updateRegError } = await supabase
        .from('student_registry')
        .update({ is_registered: true })
        .eq('roll_no', rollNo);
      
      if (updateRegError) throw updateRegError;

      return profileVal as Profile;
    } else {
      // Offline Simulation
      const registry = mockDb.getStudentRegistry();
      const matchedIdx = registry.findIndex(r => r.roll_no === rollNo);
      if (matchedIdx === -1) {
        throw new Error('Roll number not found.');
      }
      const entry = registry[matchedIdx];
      if (entry.is_registered) {
        throw new Error('This roll number already has an account.');
      }

      const profiles = mockDb.getProfiles();
      const exists = profiles.some(p => p.email.toLowerCase() === emailInput.toLowerCase());
      if (exists) {
        throw new Error('Email is already registered.');
      }

      const newProfile: Profile = {
        id: 'u-' + Math.random().toString(36).substr(2, 9),
        role: 'student',
        full_name: entry.full_name,
        email: emailInput,
        roll_no: rollNo,
        class_id: entry.class_id,
        created_at: new Date().toISOString()
      };

      registry[matchedIdx].is_registered = true;
      mockDb.saveStudentRegistry(registry);

      profiles.push(newProfile);
      mockDb.saveProfiles(profiles);
      mockDb.setCurrentUser(newProfile);
      return newProfile;
    }
  },

  async registerTeacher(fullName: string, emailInput: string, passwordInput: string, inviteCode: string): Promise<Profile> {
    if (isSupabaseConfigured && supabase) {
      // 1. Verify invite code exists, is unused, not expired
      const { data: inviteData, error: inviteError } = await supabase
        .from('teacher_invite_codes')
        .select('*')
        .eq('code', inviteCode);
      
      if (inviteError) throw inviteError;
      if (!inviteData || inviteData.length === 0) {
        throw new Error('Invalid or expired teacher invite code.');
      }
      
      const invite = inviteData[0];
      if (invite.is_used || new Date(invite.expires_at) < new Date()) {
        throw new Error('Invalid or expired teacher invite code.');
      }

      // 2. Create Supabase Auth account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: emailInput,
        password: passwordInput,
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error('Registration failed');

      // 3. Create profile with role='teacher'
      const newProfile: Profile = {
        id: authData.user.id,
        role: 'teacher',
        full_name: fullName,
        email: emailInput,
        created_at: new Date().toISOString()
      };

      const { data: profileVal, error: profileError } = await supabase
        .from('profiles')
        .upsert(newProfile)
        .select()
        .single();
      
      if (profileError) throw profileError;

      // 4. Mark invite code as used
      const { error: codeUpdateError } = await supabase
        .from('teacher_invite_codes')
        .update({ is_used: true })
        .eq('code', inviteCode);
      
      if (codeUpdateError) throw codeUpdateError;

      return profileVal as Profile;
    } else {
      // Offline Simulation
      const invites = mockDb.getInviteCodes();
      const matchIdx = invites.findIndex(c => c.code === inviteCode);
      if (matchIdx === -1) {
        throw new Error('Invalid or expired teacher invite code.');
      }
      const invite = invites[matchIdx];
      if (invite.is_used || new Date(invite.expires_at) < new Date()) {
        throw new Error('Invalid or expired teacher invite code.');
      }

      const profiles = mockDb.getProfiles();
      const exists = profiles.some(p => p.email.toLowerCase() === emailInput.toLowerCase());
      if (exists) {
        throw new Error('Email is already registered.');
      }

      const newProfile: Profile = {
        id: 'u-' + Math.random().toString(36).substr(2, 9),
        role: 'teacher',
        full_name: fullName,
        email: emailInput,
        created_at: new Date().toISOString()
      };

      invites[matchIdx].is_used = true;
      mockDb.saveInviteCodes(invites);

      profiles.push(newProfile);
      mockDb.saveProfiles(profiles);
      mockDb.setCurrentUser(newProfile);
      return newProfile;
    }
  },

  async register(fullName: string, emailInput: string, roleInput: UserRole): Promise<Profile> {
    // This method is deprecated for security
    // For student registration, use registerStudent()
    // For teacher registration, use registerTeacher()
    throw new Error('Direct registration is not allowed. Students must use roll number. Teachers must use invite code.');
  },

  async logout(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } else {
      mockDb.setCurrentUser(null);
    }
  },

  async getSessionProfile(): Promise<Profile | null> {
    if (isSupabaseConfigured && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) return null;
      
      // Fetch profile WITHOUT the classes join to avoid ambiguity error
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profileData) return null;
      
      // If student, fetch class info separately
      let prof = profileData as any;
      if (prof.role === 'student' && prof.class_id) {
        const { data: classData } = await supabase
          .from('classes')
          .select('name, section')
          .eq('id', prof.class_id)
          .single();
        
        if (classData) {
          prof.class_name = `${classData.name} - ${classData.section}`;
        }
      }
      
      return prof as Profile;
    } else {
      const user = mockDb.getCurrentUser();
      if (user && user.class_id) {
        const cls = mockDb.getClasses().find(c => c.id === user.class_id);
        if (cls) {
          user.class_name = `${cls.name} - ${cls.section}`;
        }
      }
      return user;
    }
  },

  // --- CLASSROOMS & NEW MODULE METHODS ---
  async getClasses(): Promise<Class[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data as Class[];
    } else {
      return mockDb.getClasses();
    }
  },

  async createClass(name: string, section: string, teacherId: string): Promise<Class> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('classes')
        .insert({ name, section, teacher_id: teacherId })
        .select()
        .single();
      if (error) throw error;
      return data as Class;
    } else {
      const cl = mockDb.getClasses();
      const newCl: Class = {
        id: 'class-' + Math.random().toString(36).substr(2, 9),
        name,
        section,
        teacher_id: teacherId,
        created_at: new Date().toISOString()
      };
      cl.push(newCl);
      mockDb.saveClasses(cl);
      return newCl;
    }
  },

  async getStudentRegistry(): Promise<StudentRegistry[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('student_registry')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as StudentRegistry[];
    } else {
      return mockDb.getStudentRegistry();
    }
  },

  async addToStudentRegistry(roll_no: string, full_name: string, email: string, class_id: string): Promise<StudentRegistry> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('student_registry')
        .insert({ roll_no, full_name, email, class_id, is_registered: false })
        .select()
        .single();
      if (error) throw error;
      return data as StudentRegistry;
    } else {
      const reg = mockDb.getStudentRegistry();
      const exists = reg.some(r => r.roll_no === roll_no);
      if (exists) throw new Error('Student roll number already exists in registry.');
      
      const newReg: StudentRegistry = {
        id: 'reg-' + Math.random().toString(36).substr(2, 9),
        roll_no,
        full_name,
        email,
        class_id,
        is_registered: false,
        created_at: new Date().toISOString()
      };
      reg.push(newReg);
      mockDb.saveStudentRegistry(reg);
      return newReg;
    }
  },

  async importStudentsCSV(students: Omit<StudentRegistry, 'id' | 'is_registered' | 'created_at'>[]): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('student_registry')
        .insert(students.map(s => ({ ...s, is_registered: false })));
      if (error) throw error;
    } else {
      const reg = mockDb.getStudentRegistry();
      students.forEach(s => {
        if (!reg.some(r => r.roll_no === s.roll_no)) {
          reg.push({
            id: 'reg-' + Math.random().toString(36).substr(2, 9),
            roll_no: s.roll_no,
            full_name: s.full_name,
            email: s.email,
            class_id: s.class_id,
            is_registered: false,
            created_at: new Date().toISOString()
          });
        }
      });
      mockDb.saveStudentRegistry(reg);
    }
  },

  // --- TASKS SECTION ---
  async getStudentTasksAll(): Promise<Task[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('tasks')
        .select('*');
      if (error) throw error;
      return data as Task[];
    } else {
      return mockDb.getTasks();
    }
  },

  async getTasks(studentId: string): Promise<Task[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('student_id', studentId)
        .order('due_date', { ascending: true });
      if (error) throw error;
      return data as Task[];
    } else {
      return mockDb.getTasks().filter(t => t.student_id === studentId);
    }
  },

  async createTask(task: Partial<Task>): Promise<Task> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('tasks')
        .insert(task)
        .select()
        .single();
      if (error) throw error;
      return data as Task;
    } else {
      const tasks = mockDb.getTasks();
      const newTask: Task = {
        id: 't-' + Math.random().toString(36).substr(2, 9),
        student_id: task.student_id || 'demo-user',
        title: task.title || 'Untitled Task',
        subject: task.subject || 'General',
        due_date: task.due_date || new Date().toISOString().slice(0, 10),
        status: 'pending',
        created_at: new Date().toISOString()
      };
      tasks.push(newTask);
      mockDb.saveTasks(tasks);
      return newTask;
    }
  },

  async updateTaskStatus(id: string, status: 'pending' | 'completed'): Promise<Task> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Task;
    } else {
      const tasks = mockDb.getTasks();
      const idx = tasks.findIndex(t => t.id === id);
      if (idx !== -1) {
        tasks[idx].status = status;
        mockDb.saveTasks(tasks);
        return tasks[idx];
      }
      throw new Error('Task not found');
    }
  },

  async updateTask(id: string, title: string, subject: string, due_date: string): Promise<Task> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('tasks')
        .update({ title, subject, due_date })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Task;
    } else {
      const tasks = mockDb.getTasks();
      const idx = tasks.findIndex(t => t.id === id);
      if (idx !== -1) {
        tasks[idx].title = title;
        tasks[idx].subject = subject;
        tasks[idx].due_date = due_date;
        mockDb.saveTasks(tasks);
        return tasks[idx];
      }
      throw new Error('Task not found');
    }
  },

  async deleteTask(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } else {
      const tasks = mockDb.getTasks();
      const filtered = tasks.filter(t => t.id !== id);
      mockDb.saveTasks(filtered);
    }
  },


  // --- ASSIGNMENTS SECTION ---
  async getAssignments(classId?: string): Promise<Assignment[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase
        .from('assignments')
        .select('*, profiles(full_name)')
        .order('deadline', { ascending: true });
      if (classId) {
        query = query.eq('class_id', classId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data.map((a: any) => ({
        ...a,
        teacher_name: a.profiles?.full_name || 'Teacher'
      })) as Assignment[];
    } else {
      let assignments = mockDb.getAssignments();
      if (classId) {
        assignments = assignments.filter(a => a.class_id === classId);
      }
      const profiles = mockDb.getProfiles();
      return assignments.map(a => {
        const teacher = profiles.find(p => p.id === a.teacher_id);
        return {
          ...a,
          teacher_name: teacher ? teacher.full_name : 'Dr. Jenkins'
        };
      });
    }
  },

  async createAssignment(assignment: Partial<Assignment>): Promise<Assignment> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('assignments')
        .insert(assignment)
        .select()
        .single();
      if (error) throw error;
      return data as Assignment;
    } else {
      const assignments = mockDb.getAssignments();
      const newAssign: Assignment = {
        id: 'a-' + Math.random().toString(36).substr(2, 9),
        teacher_id: assignment.teacher_id || 'teach-01',
        title: assignment.title || 'Untitled Assignment',
        subject: assignment.subject || 'General',
        deadline: assignment.deadline || new Date().toISOString().slice(0, 16),
        description: assignment.description || '',
        file_url: assignment.file_url || '',
        class_id: assignment.class_id,
        created_at: new Date().toISOString()
      };
      assignments.push(newAssign);
      mockDb.saveAssignments(assignments);

      // Trigger high-quality notifications to all students in that class (or general if none)!
      const students = mockDb.getProfiles().filter(p => p.role === 'student' && (!assignment.class_id || p.class_id === assignment.class_id));
      students.forEach(stud => {
        dbService.createNotification({
          user_id: stud.id,
          title: 'New Class Assignment!',
          message: `${newAssign.subject}: "${newAssign.title}" is due on ${new Date(newAssign.deadline).toLocaleString()}`
        }).catch(() => {});
      });

      return newAssign;
    }
  },

  // --- ATTENDANCE SECTION ---
  async getStudentAttendance(studentId: string): Promise<Attendance[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false });
      if (error) throw error;
      return data as Attendance[];
    } else {
      return mockDb.getAttendance().filter(a => a.student_id === studentId);
    }
  },

  async getAllAttendance(classId?: string): Promise<Attendance[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase
        .from('attendance')
        .select('*, profiles(full_name, class_id)')
        .order('date', { ascending: false });
      if (classId) {
        query = query.eq('class_id', classId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data.map((a: any) => ({
        ...a,
        student_name: a.profiles?.full_name || 'Student'
      })) as Attendance[];
    } else {
      let attendance = mockDb.getAttendance();
      if (classId) {
        attendance = attendance.filter(a => a.class_id === classId);
      }
      const profiles = mockDb.getProfiles();
      return attendance.map(a => {
        const student = profiles.find(p => p.id === a.student_id);
        return {
          ...a,
          student_name: student ? student.full_name : 'Unknown Student'
        };
      });
    }
  } ,

  async markAttendance(records: { student_id: string; subject: string; date: string; status: 'present' | 'absent' | 'late'; class_id?: string }[]): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('attendance')
        .insert(records);
      if (error) throw error;
    } else {
      const attendance = mockDb.getAttendance();
      records.forEach(rec => {
        // Keep unique attendance per student, subject, date (or overwrite)
        const dupIdx = attendance.findIndex(a => a.student_id === rec.student_id && a.subject === rec.subject && a.date === rec.date);
        const newRecord: Attendance = {
          id: 'att-' + Math.random().toString(36).substr(2, 9),
          ...rec
        };
        if (dupIdx !== -1) {
          attendance[dupIdx] = newRecord;
        } else {
          attendance.push(newRecord);
        }
      });
      mockDb.saveAttendance(attendance);
    }
  },

  async getAllStudents(classId?: string): Promise<Profile[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student');
      if (classId) {
        query = query.eq('class_id', classId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as Profile[];
    } else {
      let students = mockDb.getProfiles().filter(p => p.role === 'student');
      if (classId) {
        students = students.filter(s => s.class_id === classId);
      }
      return students;
    }
  },

  // --- QUIZZES SECTION ---
  async getQuizzes(classId?: string): Promise<Quiz[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase
        .from('quizzes')
        .select('*')
        .order('created_at', { ascending: false });
      if (classId) {
        query = query.eq('class_id', classId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as Quiz[];
    } else {
      let quizzes = mockDb.getQuizzes();
      if (classId) {
        quizzes = quizzes.filter(q => q.class_id === classId);
      }
      return quizzes;
    }
  },

  async getQuizQuestions(quizId: string): Promise<QuizQuestion[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId);
      if (error) throw error;
      return data as QuizQuestion[];
    } else {
      return mockDb.getQuestions().filter(q => q.quiz_id === quizId);
    }
  },

  async getQuizAttemptsAll(): Promise<QuizAttempt[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*, quizzes(title, subject), profiles(full_name)')
        .order('attempted_at', { ascending: false });
      if (error) throw error;
      return data.map((x: any) => ({
        ...x,
        quiz_title: x.quizzes?.title || 'Quiz',
        quiz_subject: x.quizzes?.subject || 'General',
        student_name: x.profiles?.full_name || 'Student'
      })) as any[];
    } else {
      const attempts = mockDb.getAttempts();
      const quizzes = mockDb.getQuizzes();
      const profiles = mockDb.getProfiles();
      return attempts.map(a => {
        const q = quizzes.find(item => item.id === a.quiz_id);
        const s = profiles.find(item => item.id === a.student_id);
        return {
          ...a,
          quiz_title: q ? q.title : 'Quiz',
          quiz_subject: q ? q.subject : 'General',
          student_name: s ? s.full_name : 'Unknown S.'
        };
      });
    }
  },

  async getStudentQuizAttempts(studentId: string): Promise<QuizAttempt[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*, quizzes(title, subject)')
        .eq('student_id', studentId)
        .order('attempted_at', { ascending: false });
      if (error) throw error;
      return data.map((qa: any) => ({
        ...qa,
        quiz_title: qa.quizzes?.title || 'Quiz',
        quiz_subject: qa.quizzes?.subject || 'General'
      })) as QuizAttempt[];
    } else {
      const attempts = mockDb.getAttempts().filter(a => a.student_id === studentId);
      const quizzes = mockDb.getQuizzes();
      return attempts.map(a => {
        const q = quizzes.find(x => x.id === a.quiz_id);
        return {
          ...a,
          quiz_title: q ? q.title : 'Quiz',
          quiz_subject: q ? q.subject : 'General'
        };
      });
    }
  },

  async createQuiz(quiz: Partial<Quiz>, questions: Omit<QuizQuestion, 'id' | 'quiz_id'>[]): Promise<Quiz> {
    if (isSupabaseConfigured && supabase) {
      const { data: newQuiz, error: qError } = await supabase
        .from('quizzes')
        .insert(quiz)
        .select()
        .single();
      if (qError) throw qError;

      const preparedQuestions = questions.map(q => ({
        ...q,
        quiz_id: newQuiz.id
      }));

      const { error: questError } = await supabase
        .from('quiz_questions')
        .insert(preparedQuestions);
      if (questError) throw questError;

      return newQuiz as Quiz;
    } else {
      const quizzes = mockDb.getQuizzes();
      const curQuestions = mockDb.getQuestions();
      const newQuiz: Quiz = {
        id: 'q-' + Math.random().toString(36).substr(2, 9),
        teacher_id: quiz.teacher_id || 'teach-01',
        title: quiz.title || 'General MCQ Test',
        subject: quiz.subject || 'General',
        duration_minutes: quiz.duration_minutes || 10,
        class_id: quiz.class_id,
        created_at: new Date().toISOString()
      };
      
      quizzes.push(newQuiz);
      mockDb.saveQuizzes(quizzes);

      questions.forEach(q => {
        curQuestions.push({
          id: 'qq-' + Math.random().toString(36).substr(2, 9),
          quiz_id: newQuiz.id,
          ...q
        });
      });
      mockDb.saveQuestions(curQuestions);

      // Trigger student notifications
      const students = mockDb.getProfiles().filter(p => p.role === 'student');
      students.forEach(stud => {
        dbService.createNotification({
          user_id: stud.id,
          title: 'New Quiz Published!',
          message: `${newQuiz.subject}: "${newQuiz.title}" is ready. Speed cap: ${newQuiz.duration_minutes} minutes.`
        }).catch(() => {});
      });

      return newQuiz;
    }
  },

  async submitQuizAttempt(quizId: string, studentId: string, score: number): Promise<QuizAttempt> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .insert({ quiz_id: quizId, student_id: studentId, score, attempted_at: new Date().toISOString() })
        .select()
        .single();
      if (error) throw error;
      return data as QuizAttempt;
    } else {
      const attempts = mockDb.getAttempts();
      const newAttempt: QuizAttempt = {
        id: 'qa-' + Math.random().toString(36).substr(2, 9),
        quiz_id: quizId,
        student_id: studentId,
        score,
        attempted_at: new Date().toISOString()
      };
      attempts.push(newAttempt);
      mockDb.saveAttempts(attempts);

      // Trigger notifiction for the teacher
      const quiz = mockDb.getQuizzes().find(q => q.id === quizId);
      const student = mockDb.getProfiles().find(s => s.id === studentId);
      if (quiz && student) {
        const teacherId = quiz.teacher_id;
        dbService.createNotification({
          user_id: teacherId,
          title: 'Quiz Submission alert',
          message: `${student.full_name} completed your quiz "${quiz.title}" with a grade of ${score}%.`
        }).catch(() => {});
      }

      return newAttempt;
    }
  },

  // --- NOTIFICATIONS SECTION ---
  async getNotifications(userId: string): Promise<AppNotification[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as AppNotification[];
    } else {
      return mockDb.getNotifications().filter(n => n.user_id === userId);
    }
  },

  async createNotification(notification: Partial<AppNotification>): Promise<AppNotification> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notification)
        .select()
        .single();
      if (error) throw error;
      return data as AppNotification;
    } else {
      const notifications = mockDb.getNotifications();
      const newNotif: AppNotification = {
        id: 'n-' + Math.random().toString(36).substr(2, 9),
        user_id: notification.user_id || 'stud-01',
        title: notification.title || 'System Alert',
        message: notification.message || '',
        is_read: false,
        created_at: new Date().toISOString()
      };
      
      notifications.unshift(newNotif); // latest first
      mockDb.saveNotifications(notifications);

      // In real application, verify if browser notification API is supported & allowed
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(newNotif.title, { body: newNotif.message });
        }
      }

      return newNotif;
    }
  },

  async markNotificationRead(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      if (error) throw error;
    } else {
      const notifications = mockDb.getNotifications();
      const idx = notifications.findIndex(n => n.id === id);
      if (idx !== -1) {
        notifications[idx].is_read = true;
        mockDb.saveNotifications(notifications);
      }
    }
  },

  async markAllNotificationsRead(userId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId);
      if (error) throw error;
    } else {
      const notifications = mockDb.getNotifications();
      notifications.forEach(n => {
        if (n.user_id === userId) {
          n.is_read = true;
        }
      });
      mockDb.saveNotifications(notifications);
    }
  },


  // --- STORAGE & FILE UPLOADS ---
  async uploadAssignmentFile(file: File): Promise<string> {
    if (isSupabaseConfigured && supabase) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substr(2, 9)}_${Date.now()}.${fileExt}`;
      const filePath = `notes/${fileName}`;

      const { data, error } = await supabase.storage
        .from('assignment-notes')
        .upload(filePath, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('assignment-notes')
        .getPublicUrl(filePath);

      return publicUrl;
    } else {
      // Mock File Upload: Convert to ObjectURL or Base64 or let it simulate upload with high-quality reference
      return new Promise((resolve) => {
        setTimeout(() => {
          // Store locally in session registry to be downloadable during the session
          const fakePath = URL.createObjectURL(file);
          resolve(fakePath);
        }, 1000);
      });
    }
  }
};