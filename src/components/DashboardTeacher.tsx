/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import { Attendance, QuizAttempt, Assignment, Profile, Class, StudentRegistry, Task } from '../types';
import { 
  Users, 
  FileSpreadsheet, 
  PlusCircle, 
  Trophy, 
  BookOpen, 
  Clock, 
  Calendar, 
  CheckSquare, 
  Sparkles, 
  Search, 
  Filter, 
  UserPlus, 
  Upload, 
  FileText, 
  TrendingUp, 
  ListOrdered,
  AlertCircle,
  CheckCircle2,
  FolderOpen
} from 'lucide-react';

interface DashboardTeacherProps {
  currentUser: Profile;
  setViewTab: (tab: string) => void;
}

export default function DashboardTeacher({ currentUser, setViewTab }: DashboardTeacherProps) {
  // Navigation
  const [activeSegment, setActiveSegment] = useState<'overview' | 'students' | 'registry_studio'>('overview');

  // Datasets
  const [students, setStudents] = useState<Profile[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [registry, setRegistry] = useState<StudentRegistry[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('all');

  // Form states - Single Student Addition
  const [newRollNo, setNewRollNo] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [selectedEnrollClass, setSelectedEnrollClass] = useState('');

  // Form states - Create Classroom group
  const [newClassName, setNewClassName] = useState('');
  const [newClassSection, setNewClassSection] = useState('');

  // Form states - CSV Block
  const [csvText, setCsvText] = useState('');
  const [csvDestClassId, setCsvDestClassId] = useState('');

  // Notifications / Alert messages
  const [alertSuccess, setAlertSuccess] = useState('');
  const [alertError, setAlertError] = useState('');

  useEffect(() => {
    fetchTeacherStatsAndClasses();
  }, [currentUser]);

  const fetchTeacherStatsAndClasses = async () => {
    try {
      setLoading(true);
      const [std, att, q, assi, cls, reg, tsk] = await Promise.all([
        dbService.getAllStudents(),
        dbService.getAllAttendance(),
        dbService.getQuizAttemptsAll(),
        dbService.getAssignments(),
        dbService.getClasses(),
        dbService.getStudentRegistry(),
        dbService.getStudentTasksAll()
      ]);
      setStudents(std);
      setAttendance(att);
      setQuizAttempts(q);
      setAssignments(assi);
      setClasses(cls);
      setRegistry(reg);
      setAllTasks(tsk);

      // Pre-select first class in defaults
      if (cls.length > 0) {
        setSelectedEnrollClass(cls[0].id);
        setCsvDestClassId(cls[0].id);
      }
    } catch (err) {
      console.error('Error fetching comprehensive teacher datasets:', err);
    } finally {
      setLoading(false);
    }
  };

  // Metric calculation aggregates
  const averageScores = quizAttempts.length > 0
    ? Math.round(quizAttempts.reduce((acc, curr) => acc + curr.score, 0) / quizAttempts.length)
    : 0;

  const presentsCount = attendance.filter(a => a.status === 'present').length;
  const latesCount = attendance.filter(a => a.status === 'late').length;
  const classAttendancePercentage = attendance.length > 0
    ? Math.round(((presentsCount + (latesCount * 0.75)) / attendance.length) * 100)
    : 100;

  // Manual Profile / Class registration
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertSuccess('');
    setAlertError('');
    if (!newClassName.trim() || !newClassSection.trim()) return;

    try {
      const created = await dbService.createClass(
        newClassName.trim(),
        newClassSection.trim(),
        currentUser.id
      );
      setAlertSuccess(`Classroom "${created.name} - ${created.section}" created successfully!`);
      setNewClassName('');
      setNewClassSection('');
      
      const cls = await dbService.getClasses();
      setClasses(cls);
    } catch (err: any) {
      setAlertError(err.message || 'Failed to create classroom.');
    }
  };

  const handleManualEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertSuccess('');
    setAlertError('');

    if (!newRollNo.trim() || !newFullName.trim() || !newEmail.trim() || !selectedEnrollClass) {
      setAlertError('All fields are required to secure enrollment registration.');
      return;
    }

    try {
      const added = await dbService.addToStudentRegistry(
        newRollNo.toUpperCase().trim(),
        newFullName.trim(),
        newEmail.trim(),
        selectedEnrollClass
      );
      setAlertSuccess(`Student "${added.full_name}" registered! Roll: ${added.roll_no}. Ready for signup.`);
      setNewRollNo('');
      setNewFullName('');
      setNewEmail('');

      const reg = await dbService.getStudentRegistry();
      setRegistry(reg);
    } catch (err: any) {
      setAlertError(err.message || 'Enrollment registration failed.');
    }
  };

  const parseAndImportCSVData = async (rawText: string, targetClassId: string) => {
    if (!rawText.trim()) throw new Error('CSV text is empty.');
    if (!targetClassId) throw new Error('Destination classroom is required.');

    const lines = rawText.split('\n');
    const parsed: Omit<StudentRegistry, 'id' | 'is_registered' | 'created_at'>[] = [];

    lines.forEach((line, idx) => {
      const parts = line.split(',');
      if (parts.length >= 3) {
        const roll = parts[0].trim().toUpperCase();
        const name = parts[1].trim();
        const mail = parts[2].trim();
        
        if (roll && name && mail) {
          parsed.push({
            roll_no: roll,
            full_name: name,
            email: mail,
            class_id: targetClassId
          });
        }
      }
    });

    if (parsed.length === 0) {
      throw new Error('No valid rows found. Format must be RollNo,FullName,Email (one per line).');
    }

    await dbService.importStudentsCSV(parsed);
    return parsed.length;
  };

  const handleTextCSVImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertSuccess('');
    setAlertError('');

    try {
      const count = await parseAndImportCSVData(csvText, csvDestClassId);
      setAlertSuccess(`Batch imported: ${count} student records inserted successfully into the registry.`);
      setCsvText('');
      const reg = await dbService.getStudentRegistry();
      setRegistry(reg);
    } catch (err: any) {
      setAlertError(err.message || 'CSV processing failed.');
    }
  };

  const handleFileUploadCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAlertSuccess('');
    setAlertError('');

    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const fileText = evt.target?.result as string;
      try {
        const count = await parseAndImportCSVData(fileText, csvDestClassId);
        setAlertSuccess(`File uploaded! Successfully imported ${count} students to registry.`);
        
        const reg = await dbService.getStudentRegistry();
        setRegistry(reg);
      } catch (ex: any) {
        setAlertError(ex.message || 'Error processing CSV file.');
      }
    };
    reader.readAsText(file);
  };

  // Helper selectors per Student
  const getStudentMetrics = (studentId: string) => {
    // Attendance
    const studAttend = attendance.filter(a => a.student_id === studentId);
    let attPercent = 100;
    if (studAttend.length > 0) {
      const presents = studAttend.filter(a => a.status === 'present').length;
      const lates = studAttend.filter(a => a.status === 'late').length;
      attPercent = Math.round(((presents + (lates * 0.75)) / studAttend.length) * 100);
    }

    // Quizzes
    const studAttempts = quizAttempts.filter(q => q.student_id === studentId);
    const avgScore = studAttempts.length > 0
      ? Math.round(studAttempts.reduce((acc, c) => acc + c.score, 0) / studAttempts.length)
      : 0;

    // Tasks (Planners)
    const studTasks = allTasks.filter(t => t.student_id === studentId);
    const completedTasks = studTasks.filter(t => t.status === 'completed').length;
    const taskRatio = `${completedTasks}/${studTasks.length}`;

    return { attPercent, avgScore, taskRatio, totalClassLogs: studAttend.length };
  };

  // Filter students
  const filteredStudentsList = students.filter(student => {
    const classIdMatch = selectedClassId === 'all' || student.class_id === selectedClassId;
    
    const query = searchQuery.toLowerCase().trim();
    const searchMatch = !query || 
      student.full_name.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query) ||
      (student.roll_no && student.roll_no.toLowerCase().includes(query));

    return classIdMatch && searchMatch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div className="animate-spin border-3 border-indigo-600 border-t-transparent rounded-full h-8 w-8"></div>
      </div>
    );
  }

  return (
    <div id="teacher_dashboard_root" className="space-y-6">
      
      {/* Segment Selector Menu */}
      <div className="flex bg-slate-100 p-1 rounded-2xl max-w-md">
        <button
          type="button"
          onClick={() => {
            setActiveSegment('overview');
            setAlertSuccess('');
            setAlertError('');
          }}
          className={`flex-1 text-center py-2 text-xs font-bold rounded-xl transition ${
            activeSegment === 'overview' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          General Overview
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveSegment('students');
            setAlertSuccess('');
            setAlertError('');
          }}
          className={`flex-1 text-center py-2 text-xs font-bold rounded-xl transition ${
            activeSegment === 'students' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Student Directory
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveSegment('registry_studio');
            setAlertSuccess('');
            setAlertError('');
          }}
          className={`flex-1 text-center py-2 text-xs font-bold rounded-xl transition ${
            activeSegment === 'registry_studio' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Classroom Studio
        </button>
      </div>

      {/* SUCCESS / ERROR ALERTS BANNER */}
      {alertSuccess && (
        <div className="bg-emerald-50 border border-emerald-150 p-4 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-650" />
          <span>{alertSuccess}</span>
        </div>
      )}
      {alertError && (
        <div className="bg-rose-50 border border-rose-150 p-4 rounded-2xl text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={16} className="text-rose-650" />
          <span>{alertError}</span>
        </div>
      )}

      {/* --- SEGMENT 1: OVERVIEW DASHBOARD --- */}
      {activeSegment === 'overview' && (
        <>
          {/* 1. WELCOME HERO PANEL */}
          <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-200">
            <div className="space-y-2 z-10">
              <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-indigo-200">TEACHER CONSOLE</span>
              <h2 className="text-2xl md:text-3.5xl font-extrabold tracking-tight leading-none mt-1">Hello, {currentUser.full_name}!</h2>
              <p className="text-slate-300 text-xs md:text-sm font-medium max-w-xl">
                Plan quizzes, mark class-wide daily attendance schedules, post assignment worksheets, and audit detailed analytics charts.
              </p>
            </div>
            <div className="z-10 bg-white/5 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 shrink-0 text-center min-w-[150px]">
              <span className="text-[10px] uppercase font-bold text-slate-300 block">CLASS QUIZ AVG</span>
              <p className="text-3xl font-black mt-1 text-emerald-400">{averageScores}%</p>
              <span className="text-[10px] text-slate-400 font-semibold mt-1 block">Based on {quizAttempts.length} evaluations</span>
            </div>
          </div>

          {/* 2. STATISTIC CARDS ROW (Bento Elements) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between transition-all">
              <div>
                <p className="text-xs text-slate-400 font-extrabold uppercase tracking-widest">Enrolled Students</p>
                <h4 className="text-2xl font-black text-slate-800 mt-1">{students.length} Pupils</h4>
                <p className="text-xs text-slate-500 mt-1 font-medium">Registered profiles</p>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-700 rounded-2xl">
                <Users size={20} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between transition-all">
              <div>
                <p className="text-xs text-slate-400 font-extrabold uppercase tracking-widest">Class Attendance</p>
                <h4 className="text-2xl font-black text-slate-800 mt-1">{classAttendancePercentage}%</h4>
                <p className="text-xs text-slate-500 mt-1 font-medium">Average log weight</p>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
                <FileSpreadsheet size={20} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between transition-all">
              <div>
                <p className="text-xs text-slate-400 font-extrabold uppercase tracking-widest">Quiz Submissions</p>
                <h4 className="text-2xl font-black text-slate-800 mt-1">{quizAttempts.length} Total</h4>
                <p className="text-xs text-slate-500 mt-1 font-medium">Auto evaluated MCQ tests</p>
              </div>
              <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl">
                <Trophy size={20} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between transition-all">
              <div>
                <p className="text-xs text-slate-400 font-extrabold uppercase tracking-widest">Worksheets</p>
                <h4 className="text-2xl font-black text-slate-800 mt-1">{assignments.length} Shared</h4>
                <p className="text-xs text-slate-500 mt-1 font-medium">Active homework briefs</p>
              </div>
              <div className="p-3 bg-cyan-50 text-cyan-700 rounded-2xl">
                <BookOpen size={20} />
              </div>
            </div>
          </div>

          {/* 3. QUICKショートカットS */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Sparkles className="text-indigo-600" size={16} /> Quick Classroom Actions Shortcuts
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => setViewTab('attendance')}
                className="group p-5 bg-slate-50/55 rounded-2xl border border-slate-150 hover:bg-indigo-50/20 hover:border-indigo-150 text-left transition-all space-y-2"
              >
                <div className="w-9 h-9 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Calendar size={18} />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Mark Daily Attendance</h4>
                <p className="text-[11px] text-slate-400 leading-normal">Digitally record student logs per subject and update profile tracking summaries.</p>
              </button>

              <button
                onClick={() => setViewTab('quizzes')}
                className="group p-5 bg-slate-50/55 rounded-2xl border border-slate-150 hover:bg-indigo-50/20 hover:border-indigo-150 text-left transition-all space-y-2"
              >
                <div className="w-9 h-9 bg-indigo-50 text-indigo-700 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <PlusCircle size={18} />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Publish MCQ Quiz</h4>
                <p className="text-[11px] text-slate-400 leading-normal">Establish questions, correct option key definitions, and timer intervals for automatic grading.</p>
              </button>

              <button
                onClick={() => setViewTab('assignments')}
                className="group p-5 bg-slate-50/55 rounded-2xl border border-slate-150 hover:bg-indigo-50/20 hover:border-indigo-150 text-left transition-all space-y-2"
              >
                <div className="w-9 h-9 bg-cyan-50 text-cyan-700 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <BookOpen size={18} />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Post Assignment</h4>
                <p className="text-[11px] text-slate-400 leading-normal">Upload PDF worksheet study guides, deadline markers, and describe homework instructions.</p>
              </button>

              <button
                onClick={() => setViewTab('analytics')}
                className="group p-5 bg-slate-50/55 rounded-2xl border border-slate-150 hover:bg-indigo-50/20 hover:border-indigo-150 text-left transition-all space-y-2"
              >
                <div className="w-9 h-9 bg-amber-55 text-amber-700 bg-amber-50 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Trophy size={18} />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Inspect Academic Metrics</h4>
                <p className="text-[11px] text-slate-400 leading-normal">View subject progress rates, student average grading scales, and attendance logs.</p>
              </button>
            </div>
          </div>

          {/* 4. STUDENTS EXAM ATTEMPTS SUMMARY TABLE */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Latest Student Submitted Exercises</h3>
            {quizAttempts.length === 0 ? (
              <p className="text-slate-450 text-xs py-10 text-center italic">No quiz responses captured in standard databases yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase">
                      <th className="py-3.5 px-4 font-black">Student</th>
                      <th className="py-3.5 px-4 font-black">Quiz Title</th>
                      <th className="py-3.5 px-4 font-black">Subject</th>
                      <th className="py-3.5 px-4 text-center font-black">Score Percentage</th>
                      <th className="py-3.5 px-4 text-slate-400 font-semibold tracking-wider">Submission Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {quizAttempts.slice(0, 6).map((attempt) => (
                      <tr key={attempt.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-800">{attempt.student_name}</td>
                        <td className="py-3.5 px-4 text-slate-600 font-bold">{attempt.quiz_title}</td>
                        <td className="py-3.5 px-4 font-black text-indigo-600">{attempt.quiz_subject}</td>
                        <td className={`py-3.5 px-4 text-center font-black text-xs ${
                          attempt.score >= 80 ? 'text-emerald-700 bg-emerald-50 max-w-[60px] rounded px-2 py-0.5 mx-auto block text-center' : attempt.score >= 60 ? 'text-amber-700 bg-amber-50 max-w-[60px] rounded px-2 py-0.5 mx-auto block text-center' : 'text-rose-750 bg-rose-50 max-w-[60px] rounded px-2 py-0.5 mx-auto block text-center'
                        }`}>
                          {attempt.score}%
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-medium">
                          {new Date(attempt.attempted_at).toLocaleDateString()} {new Date(attempt.attempted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* --- SEGMENT 2: STUDENT MANAGEMENT DIRECTORY --- */}
      {activeSegment === 'students' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-800 tracking-tight">Active Student Directory</h3>
              <p className="text-xs text-slate-400 font-medium">Search students, view roll numbers, evaluate attendance logs, and progress analytics.</p>
            </div>
            
            {/* Search/Filter Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative shrink-0 w-44">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  placeholder="Query student..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-550"
                />
              </div>

              <div className="relative shrink-0 w-36">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <Filter size={14} />
                </span>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-550 appearance-none"
                >
                  <option value="all">All Classrooms</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Directory Records Table */}
          {filteredStudentsList.length === 0 ? (
            <p className="text-slate-450 text-xs py-16 text-center italic">No matching student profile records found.</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase">
                    <th className="py-4 px-4 font-black">Roll No</th>
                    <th className="py-4 px-4 font-black">Full Name</th>
                    <th className="py-4 px-4 font-black">Official Email</th>
                    <th className="py-4 px-4 font-black">Assigned Class</th>
                    <th className="py-4 px-4 text-center font-black">Attendance %</th>
                    <th className="py-4 px-4 text-center font-black">MCQ Eval Score</th>
                    <th className="py-4 px-4 text-center font-black">Planner Ratio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudentsList.map(student => {
                    const metrics = getStudentMetrics(student.id);
                    const classObj = classes.find(c => c.id === student.class_id);
                    
                    return (
                      <tr key={student.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700 uppercase">
                          {student.roll_no || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          {student.full_name}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {student.email}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-bold text-[10px]">
                            {classObj ? `${classObj.name} - ${classObj.section}` : 'General / Unassigned'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold">
                          <span className={`px-2 py-0.5 rounded text-[11.5px] font-bold ${
                            metrics.attPercent >= 80 ? 'text-emerald-700 bg-emerald-50' : metrics.attPercent >= 60 ? 'text-amber-700 bg-amber-50' : 'text-rose-700 bg-rose-50'
                          }`}>
                            {metrics.attPercent}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                          {metrics.avgScore > 0 ? `${metrics.avgScore}%` : 'No attempts'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                            {metrics.taskRatio} Done
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- SEGMENT 3: ENROLLEES & CLASSROOM STUDIO --- */}
      {activeSegment === 'registry_studio' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Create classroom and manual enrolee box */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Create Class Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <PlusCircle size={15} /> Create Class Room
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-normal">Initialize another student classroom and scheduling section.</p>
              </div>

              <form onSubmit={handleCreateClass} className="space-y-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Classroom Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CSE-C"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Section/Stream</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Computer Science"
                    value={newClassSection}
                    onChange={(e) => setNewClassSection(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Create Class Group
                </button>
              </form>
            </div>

            {/* Manual Registrar Form */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <UserPlus size={15} /> Secure Registrar Enrollment
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-normal">Add a single verified student to the offline/online registry database beforehand.</p>
              </div>

              <form onSubmit={handleManualEnroll} className="space-y-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Enrolling Roll Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 22CSE004"
                    value={newRollNo}
                    onChange={(e) => setNewRollNo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Student Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. David Lim"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Official Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. david@school.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Select Class Assignment</label>
                  <select
                    value={selectedEnrollClass}
                    onChange={(e) => setSelectedEnrollClass(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Enroll Student to Registry
                </button>
              </form>
            </div>

          </div>

          {/* CSV Import Studio & registry contents list */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* CSV Batch Loader */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Upload size={15} /> CSV Batch Import Importer
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                  Piping students in volume. Paste raw CSV text or click to upload a physical <code>.csv</code> spreadsheet.
                </p>
              </div>

              <form onSubmit={handleTextCSVImport} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Destination Classroom</label>
                    <select
                      value={csvDestClassId}
                      onChange={(e) => setCsvDestClassId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                    >
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Direct CSV Upload</label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUploadCSV}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                      />
                      <div className="border border-slate-200 bg-slate-50 p-1.5 rounded-xl text-center text-slate-500 hover:bg-indigo-50 transition text-[10px] font-bold flex items-center justify-center gap-1.5">
                        <Upload size={13} /> Select .csv File
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                    Paste CSV Rows (Format: <code>RollNumber, FullName, Email</code>)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="22CSE004,David Lim,david@school.com&#10;22CSE005,Sarah Conner,sarah@school.com"
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 font-mono leading-relaxed"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Import CSV Block Records
                  </button>
                </div>
              </form>
            </div>

            {/* Registry records tracker */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ListOrdered size={15} /> Verified Enrollment Student Registry Database ({registry.length})
              </h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                These enrolled students reside in our system registry database but can only login once they complete their personal, secure Student Sign Up process.
              </p>

              <div className="max-h-[300px] overflow-y-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <th className="py-2.5 px-3 font-semibold">Roll No</th>
                      <th className="py-2.5 px-3 font-semibold">Name</th>
                      <th className="py-2.5 px-3 font-semibold">Email</th>
                      <th className="py-2.5 px-3 text-center font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {registry.map(regItem => (
                      <tr key={regItem.id} className="hover:bg-slate-50/20">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-700 uppercase">{regItem.roll_no}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">{regItem.full_name}</td>
                        <td className="py-2.5 px-3 text-slate-400">{regItem.email}</td>
                        <td className="py-2.5 px-3 text-center">
                          {regItem.is_registered ? (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-black rounded-md">
                              Registered
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-md">
                              Pending Signup
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
