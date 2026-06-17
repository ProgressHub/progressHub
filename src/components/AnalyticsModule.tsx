/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import { Attendance, QuizAttempt, Task, Profile } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, ResponsiveContainer, Cell, Legend } from 'recharts';
import { Trophy, Calendar, CheckSquare, Award, TrendingUp, AlertCircle } from 'lucide-react';

interface AnalyticsModuleProps {
  currentUser: Profile;
}

export default function AnalyticsModule({ currentUser }: AnalyticsModuleProps) {
  const [loading, setLoading] = useState(true);
  const isTeacher = currentUser.role === 'teacher';

  // State arrays
  const [tasks, setTasks] = useState<Task[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    fetchMetrics();
  }, [currentUser]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      if (isTeacher) {
        // Teacher sees all student registers
        const allAtt = await dbService.getAllAttendance();
        setAttendance(allAtt);
        
        const allAttem = await dbService.getQuizAttemptsAll();
        setQuizAttempts(allAttem);

        const allStudents = await dbService.getAllStudents();
        // Since we don't fetch student tasks, let's just make simulated aggregate tasks length or use standard
        setTasks([]);
      } else {
        // Student sees own personal context
        const t = await dbService.getTasks(currentUser.id);
        setTasks(t);

        const att = await dbService.getStudentAttendance(currentUser.id);
        setAttendance(att);

        const qa = await dbService.getStudentQuizAttempts(currentUser.id);
        setQuizAttempts(qa);
      }
    } catch (err) {
      console.error('Error fetching analytics metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- STATS CALCULATIONS ---

  // Tasks Summary
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Attendance Summary
  const totalAttDays = attendance.length;
  const presents = attendance.filter(a => a.status === 'present').length;
  const lates = attendance.filter(a => a.status === 'late').length;
  // Weight Present as 100%, Late as 75%, Absent as 0%
  const attendanceRate = totalAttDays > 0 
    ? Math.round(((presents + (lates * 0.75)) / totalAttDays) * 100)
    : 100;

  // Quiz Performance Summary
  const averageQuizGrade = quizAttempts.length > 0
    ? Math.round(quizAttempts.reduce((acc, curr) => acc + curr.score, 0) / quizAttempts.length)
    : 0;

  // --- CHARTS FORMATTING ---

  // Chart 1: Subject Attendance Rate (Bar Chart)
  // For student: Group attendance by subject & calculate rate
  const subjectsList = ['Mathematics', 'Chemistry', 'Physics', 'English', 'History', 'Biology', 'General'];
  const subjectAttendanceData = subjectsList.map(subj => {
    const records = attendance.filter(a => a.subject === subj);
    const tot = records.length;
    if (tot === 0) return { subject: subj, Rate: 0 };
    const p = records.filter(a => a.status === 'present').length;
    const l = records.filter(a => a.status === 'late').length;
    const rate = Math.round(((p + (l * 0.75)) / tot) * 100);
    return { subject: subj, Rate: rate };
  }).filter(item => item.Rate > 0 || isTeacher); // keep all for teachers for clean view

  // Chart 2: Quiz Score Trend (Line Chart Chronology)
  // Maps attempts into time sequence
  const quizScoresChronology = [...quizAttempts]
    .reverse() // Chronological order
    .map((attempt, index) => {
      return {
        name: `Quiz #${index + 1}`,
        title: attempt.quiz_title || 'Quiz',
        Score: attempt.score,
        subject: attempt.quiz_subject || 'General'
      };
    });

  // Chart 3: Quiz Averages by Subject (Bar Chart)
  const quizSubjectAverages = subjectsList.map(subj => {
    const attempts = quizAttempts.filter(qa => qa.quiz_subject === subj);
    if (attempts.length === 0) return { subject: subj, Score: 0 };
    const avg = Math.round(attempts.reduce((acc, curr) => acc + curr.score, 0) / attempts.length);
    return { subject: subj, Score: avg };
  }).filter(item => item.Score > 0 || isTeacher);

  const BAR_COLORS = ['#4f46e5', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#64748b'];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="animate-spin border-3 border-indigo-600 border-t-transparent rounded-full h-8 w-8"></div>
      </div>
    );
  }

  return (
    <div id="analytics_module_root" className="space-y-6">

      {/* SUMMARY TOP CARDS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Attendance Percentage Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attendance Registry</span>
            <h4 className="text-2xl font-black text-slate-800 mt-1">{attendanceRate}%</h4>
            <p className="text-xs text-slate-450 mt-1">{totalAttDays} classes reported</p>
          </div>
          <div className="p-3.5 bg-emerald-50 rounded-full text-emerald-600">
            <Calendar size={22} />
          </div>
        </div>

        {/* Average Quiz Score Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Average Exam Grade</span>
            <h4 className="text-2xl font-black text-slate-800 mt-1">{averageQuizGrade}%</h4>
            <p className="text-xs text-slate-450 mt-1">{quizAttempts.length} quizzes reviewed</p>
          </div>
          <div className="p-3.5 bg-indigo-50 rounded-full text-indigo-600">
            <Trophy size={22} />
          </div>
        </div>

        {/* Tasks completed or Class wide attempts Count */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          {isTeacher ? (
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subject Spectrum Coverage</span>
              <h4 className="text-2xl font-black text-slate-800 mt-1">{subjectsList.filter(s => attendance.some(a => a.subject === s)).length} / 7</h4>
              <p className="text-xs text-slate-450 mt-1">Active class curriculums</p>
            </div>
          ) : (
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Personal Task Progress</span>
              <h4 className="text-2xl font-black text-slate-800 mt-1">{taskCompletionRate}%</h4>
              <p className="text-xs text-slate-450 mt-1">{completedTasks} of {totalTasks} finished</p>
            </div>
          )}
          <div className="p-3.5 bg-cyan-50 rounded-full text-cyan-600">
            <CheckSquare size={22} />
          </div>
        </div>

      </div>

      {/* CHARTS CONTAINER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. QUIZ SCORE CHRONOLOGY CHART (LINE CHART) */}
        {quizScoresChronology.length > 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h4 className="text-sm font-extrabold text-slate-800 mb-4 flex items-center gap-1.5 leading-tight">
              <TrendingUp size={16} className="text-indigo-600" />
              Quiz Performance Over Time (Chronology)
            </h4>
            
            <div className="h-72 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={quizScoresChronology} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" domain={[0, 100]} fontSize={11} tickLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-800 text-white p-3 rounded-xl shadow border border-slate-700 text-xs text-left">
                            <p className="font-bold">{data.title}</p>
                            <p className="text-slate-350 font-medium mt-0.5">Subject: {data.subject}</p>
                            <p className="font-extrabold text-indigo-400 mt-1">Score: {payload[0].value}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Score"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    dot={{ fill: '#4f46e5', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center h-80">
            <Award size={32} className="text-slate-300 mb-2" />
            <p className="text-slate-450 text-sm font-medium">Insufficient Exam Attempts</p>
            <p className="text-slate-400 text-xs max-w-xs mt-1">Participate in published MCQs elements to populate score progress models!</p>
          </div>
        )}

        {/* 2. ATTENDANCE BY SUBJECT (BAR CHART) */}
        {attendance.length > 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h4 className="text-sm font-extrabold text-slate-800 mb-4 flex items-center gap-1.5 leading-tight">
              <Calendar size={16} className="text-emerald-600" />
              Attendance Percentage Rate by Academic Subject
            </h4>

            <div className="h-72 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectAttendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="subject" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" domain={[0, 100]} fontSize={11} tickLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow text-xs">
                            <span className="font-bold text-slate-700">{payload[0].payload.subject}</span>
                            <p className="text-emerald-600 font-extrabold mt-0.5">Rate: {payload[0].value}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="Rate" radius={[4, 4, 0, 0]}>
                    {subjectAttendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center h-80">
            <Calendar size={32} className="text-slate-300 mb-2" />
            <p className="text-slate-450 text-sm font-medium">Insufficient Attendance Data</p>
            <p className="text-slate-400 text-xs max-w-xs mt-1">Attendance logging sheets must be completed by the instructor to feed this model.</p>
          </div>
        )}

      </div>

      {/* DUAL MODE LOWER SUMMARY LIST (TEACHER VIEW VS STUDENT VIEW) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mt-6">
        {isTeacher ? (
          <div>
            <h3 className="text-base font-black text-slate-800 mb-4">Instructor Student Performance Logs</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-450 font-bold text-xs border-b border-slate-100 uppercase">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4 text-center">Completed Exams</th>
                    <th className="py-3 px-4 text-center">High Score achieved</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quizAttempts.reduce((acc, attempt) => {
                    const existing = acc.find(x => x.name === attempt.student_name);
                    const score = attempt.score;
                    if (existing) {
                      existing.count += 1;
                      if (score > existing.hiScore) {
                        existing.hiScore = score;
                      }
                    } else {
                      acc.push({
                        name: attempt.student_name || 'Guest',
                        count: 1,
                        hiScore: score
                      });
                    }
                    return acc;
                  }, [] as { name: string; count: number; hiScore: number }[]).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-800">{row.name}</td>
                      <td className="py-3.5 px-4 text-center text-slate-650 font-medium">{row.count} attempts</td>
                      <td className="py-3.5 px-4 text-center font-bold text-indigo-700">{row.hiScore}%</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          row.hiScore >= 80 ? 'bg-emerald-100 text-emerald-850' : 'bg-amber-100 text-amber-850'
                        }`}>
                          {row.hiScore >= 80 ? 'Master' : 'Passing'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {quizAttempts.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400 italic">No exams recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-base font-black text-slate-800 mb-4">Individual Quiz Attempts Breakdown</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-450 font-bold text-xs border-b border-slate-100 uppercase">
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Quiz Title</th>
                    <th className="py-3 px-4">Date Attempted</th>
                    <th className="py-3 px-4 text-center">Achieved Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quizAttempts.map((attempt) => (
                    <tr key={attempt.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-800">{attempt.quiz_subject}</td>
                      <td className="py-3 px-4 text-slate-650 font-semibold">{attempt.quiz_title}</td>
                      <td className="py-3 px-4 text-slate-400 font-medium">{new Date(attempt.attempted_at).toLocaleString()}</td>
                      <td className={`py-3 px-4 text-center font-black ${
                        attempt.score >= 80 ? 'text-emerald-600' : attempt.score >= 60 ? 'text-amber-600' : 'text-rose-600'
                      }`}>{attempt.score}%</td>
                    </tr>
                  ))}
                  {quizAttempts.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400 italic">No previous quizzes attempted.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
