/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import { Task, Assignment, QuizAttempt, Attendance, Profile } from '../types';
import { Clock, Calendar, CheckSquare, Trophy, ChevronRight, FileText, ArrowRight, BellRing } from 'lucide-react';

interface DashboardStudentProps {
  currentUser: Profile;
  setViewTab: (tab: string) => void;
}

export default function DashboardStudent({ currentUser, setViewTab }: DashboardStudentProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardDetails();
  }, [currentUser]);

  const fetchDashboardDetails = async () => {
    try {
      setLoading(true);
      const [t, a, q, att] = await Promise.all([
        dbService.getTasks(currentUser.id),
        dbService.getAssignments(currentUser.class_id),
        dbService.getStudentQuizAttempts(currentUser.id),
        dbService.getStudentAttendance(currentUser.id)
      ]);
      setTasks(t);
      setAssignments(a);
      setAttempts(q);
      setAttendance(att);
    } catch (err) {
      console.error('Error fetching student dashboard records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await dbService.updateTaskStatus(taskId, 'completed');
      // Refresh only task list locally
      const t = await dbService.getTasks(currentUser.id);
      setTasks(t);
    } catch (err) {
      console.error('Failed toggling task complete:', err);
    }
  };

  // Stats
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const finishedTasks = tasks.filter(t => t.status === 'completed');
  
  const totalAttDays = attendance.length;
  const presents = attendance.filter(a => a.status === 'present').length;
  const lates = attendance.filter(a => a.status === 'late').length;
  const attendancePercentage = totalAttDays > 0 
    ? Math.round(((presents + (lates * 0.75)) / totalAttDays) * 100)
    : 100;

  const averageQuizGrade = attempts.length > 0
    ? Math.round(attempts.reduce((acc, curr) => acc + curr.score, 0) / attempts.length)
    : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="animate-spin border-3 border-teal-500 border-t-transparent rounded-full h-8 w-8"></div>
      </div>
    );
  }

  return (
    <div id="student_dashboard_root" className="space-y-6">
      
      {/* 1. VISUAL GREETINGS BANNER (Hero Bento Cell) */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-200">
        <div className="space-y-2 z-10">
          <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-indigo-200">STUDENT PORTAL</span>
          <h2 className="text-2xl md:text-3.5xl font-extrabold tracking-tight leading-none mt-1">
            Welcome Back, {currentUser.full_name}!
          </h2>
          <div className="flex flex-wrap gap-2.5 mt-2 mb-3">
            {currentUser.roll_no && (
              <span className="text-[11px] font-bold tracking-wide bg-white/10 px-2.5 py-1 rounded-lg text-slate-100 border border-white/5">
                Roll No: {currentUser.roll_no}
              </span>
            )}
            {currentUser.class_name && (
              <span className="text-[11px] font-bold tracking-wide bg-white/10 px-2.5 py-1 rounded-lg text-slate-100 border border-white/5">
                Class: {currentUser.class_name}
              </span>
            )}
          </div>
          <p className="text-slate-300 text-xs md:text-sm font-medium max-w-xl">
            Keep track of your study milestones, homework submissions, and pop quiz evaluations in one cohesive workspace.
          </p>
        </div>
        <div className="z-10 bg-white/5 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/10 text-center shrink-0 min-w-[140px]">
          <span className="text-[10px] uppercase font-bold text-slate-350 tracking-wider block">COMPLETED TASKS</span>
          <p className="text-3xl font-black mt-1 text-emerald-450">{finishedTasks.length}</p>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">Good progress</span>
        </div>
      </div>

      {/* 2. BENTO GRID ARRANGEMENT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Attendance Gauge Card (Bento Item) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between items-center text-center">
          <div className="w-full flex justify-between items-center mb-2">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Attendance</h3>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">{totalAttDays} Days</span>
          </div>
          <div className="relative flex items-center justify-center my-4">
            <svg className="w-28 h-28 transform -rotate-90">
              <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-100" />
              <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray="301.6" strokeDashoffset={301.6 - (301.6 * attendancePercentage) / 100} className="text-indigo-600 transition-all duration-500" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-800">{attendancePercentage}%</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Present</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 font-medium">Record includes {lates} lates</p>
        </div>

        {/* Quiz Avg Card (Bento Item - Grade style) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Evaluations</h3>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Top score class</span>
          </div>
          <div className="my-4 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 text-center">
            <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">Quiz Average</p>
            <h3 className="text-4.5xl font-black text-emerald-900 mt-1">{averageQuizGrade}<span className="text-xl">%</span></h3>
          </div>
          <p className="text-xs text-slate-400 font-medium text-center">Based on {attempts.length} attempts</p>
        </div>

        {/* Personal Target Checklist (Bento Item - col-span-2) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs col-span-1 md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
                Checklist Planner
              </h3>
              <button
                type="button"
                onClick={() => setViewTab('tasks')}
                className="text-xs text-indigo-650 hover:text-indigo-800 font-bold flex items-center gap-0.5"
              >
                Add Option <ChevronRight size={14} />
              </button>
            </div>

            {pendingTasks.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 rounded-2xl text-slate-400 text-xs italic">
                No incomplete tasks planner steps current. Good job!
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                {pendingTasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="p-3 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between transition-colors">
                    <div className="min-w-0 flex-1 mr-3">
                      <span className="text-[9px] font-extrabold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md uppercase">
                        {task.subject}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 mt-1 truncate">{task.title}</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCompleteTask(task.id)}
                      className="px-2.5 py-1 text-[10px] font-bold bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-150 rounded-xl transition"
                    >
                      Complete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <p className="text-xs text-slate-400 font-medium pt-2 border-t border-slate-50 mt-2">
            You currently have <strong className="text-slate-750">{pendingTasks.length}</strong> tasks pending
          </p>
        </div>

      </div>

      {/* 3. LOWER BENTO ROW: ASSIGNMENTS & EVALUATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Classroom Assignments Bento block */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                Classroom Assignments
              </h3>
              <button
                type="button"
                onClick={() => setViewTab('assignments')}
                className="text-xs text-indigo-650 hover:text-indigo-800 font-bold flex items-center gap-0.5"
              >
                Inspect Registry <ArrowRight size={13} />
              </button>
            </div>

            {assignments.length === 0 ? (
              <div className="py-12 text-center bg-slate-50 rounded-2xl text-slate-400 text-xs italic">
                No active classroom assignments published.
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[290px] overflow-y-auto pr-1">
                {assignments.slice(0, 3).map((assign) => (
                  <div key={assign.id} className="p-4 border border-slate-150 rounded-2xl bg-white hover:border-indigo-200 transition-all">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                      <span className="text-indigo-600 font-extrabold">{assign.subject}</span>
                      <span>By: {assign.teacher_name}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 mt-2">{assign.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-2">{assign.description || 'Supplementary notes attached.'}</p>
                    <div className="mt-3 text-[10px] text-indigo-700 font-extrabold flex items-center justify-between border-t border-slate-100 pt-2 bg-slate-50/50 px-2 py-1 rounded-lg">
                      <span>Due: {new Date(assign.deadline).toLocaleString()}</span>
                      {assign.file_url ? <span className="underline">Resource Attached</span> : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {assignments.length > 3 && (
            <button
              onClick={() => setViewTab('assignments')}
              className="w-full text-center py-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 border-t border-slate-100 mt-4"
            >
              See complete assignments directory
            </button>
          )}
        </div>

        {/* Academic Evaluations History bento block */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                Academic Evaluations History
              </h3>
              <button
                type="button"
                onClick={() => setViewTab('quizzes')}
                className="text-xs text-indigo-650 hover:text-indigo-800 font-bold flex items-center gap-0.5"
              >
                Attempt Quizzes <ArrowRight size={13} />
              </button>
            </div>

            {attempts.length === 0 ? (
              <div className="py-12 text-center bg-slate-50 rounded-2xl text-slate-400 text-xs italic">
                No pop quiz evaluations recorded. Start an MCQ test exercise above!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[290px] overflow-y-auto pr-1">
                {attempts.slice(0, 6).map((attempt) => (
                  <div key={attempt.id} className="p-4 border border-slate-150 rounded-2xl bg-[#f8fafc]/80 text-xs flex items-center justify-between hover:border-slate-350 transition-colors">
                    <div className="min-w-0 mr-2">
                      <h4 className="font-bold text-slate-800 truncate">{attempt.quiz_title}</h4>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{attempt.quiz_subject}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-base font-black ${attempt.score >= 80 ? 'text-emerald-700' : attempt.score >= 55 ? 'text-amber-700' : 'text-rose-700'}`}>
                        {attempt.score}%
                      </span>
                      <p className="text-[9px] text-slate-400 font-semibold uppercase">Auto graded</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
