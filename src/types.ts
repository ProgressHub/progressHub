/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'student' | 'teacher';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  roll_no?: string; // nullable for teacher, required for student
  class_id?: string; // nullable for teacher, required for student
  created_at: string;
  class_name?: string; // resolved in-app join
}

export interface Class {
  id: string;
  name: string;
  section: string;
  teacher_id: string;
  created_at: string;
}

export interface TeacherInviteCode {
  id: string;
  code: string;
  is_used: boolean;
  expires_at: string;
  created_at: string;
}

export interface StudentRegistry {
  id: string;
  roll_no: string;
  full_name: string;
  email: string;
  class_id: string;
  is_registered: boolean;
  created_at: string;
}

export interface Task {
  id: string;
  student_id: string;
  title: string;
  subject: string;
  due_date: string;
  status: 'pending' | 'completed';
  created_at: string;
}

export interface Assignment {
  id: string;
  teacher_id: string;
  title: string;
  subject: string;
  deadline: string;
  description: string;
  file_url?: string;
  class_id?: string; // links to classes
  created_at: string;
  teacher_name?: string;
}

export interface Attendance {
  id: string;
  student_id: string;
  subject: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  class_id?: string; // links to classes
  student_name?: string;
}

export interface Quiz {
  id: string;
  teacher_id: string;
  title: string;
  subject: string;
  duration_minutes: number;
  class_id?: string;
  deadline?: string;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  student_id: string;
  score: number; // percentage or raw score, we will use percentage (e.g. 80 for 80%)
  attempted_at: string;
  quiz_title?: string;
  quiz_subject?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
