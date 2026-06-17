/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import { Attendance, Profile, Class } from '../types';
import { Calendar, CheckCircle2, AlertTriangle, XCircle, Info, RefreshCw, UserCheck, Users } from 'lucide-react';

interface AttendanceModuleProps {
  currentUser: Profile;
}

export default function AttendanceModule({ currentUser }: AttendanceModuleProps) {
  const [students, setStudents] = useState<Profile[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [studentHistory, setStudentHistory] = useState<Attendance[]>([]);
  
  // Class selection for Teacher
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');

  // Loading & Action State
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Mark Form variables
  const [subject, setSubject] = useState('Mathematics');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  // State format: { [studentId]: 'present' | 'absent' | 'late' }
  // Default: ALL UNCHECKED (null)
  const [attendanceSheet, setAttendanceSheet] = useState<Record<string, 'present' | 'absent' | 'late' | null>>({});

  const isTeacher = currentUser.role === 'teacher';
  const subjects = ['Mathematics', 'Chemistry', 'Physics', 'English', 'History', 'Biology', 'General'];

  useEffect(() => {
    if (isTeacher) {
      dbService.getClasses().then(cls => {
        setClasses(cls);
        if (cls.length > 0) {
          setSelectedClassId(cls[0].id);
        } else {
          setLoading(false);
        }
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    } else {
      fetchStudentHistory();
    }
  }, [currentUser]);

  useEffect(() => {
    if (isTeacher && selectedClassId) {
      fetchClassStudentsAndRecords();
    }
  }, [selectedClassId]);

  const fetchStudentHistory = async () => {
    try {
      setLoading(true);
      const history = await dbService.getStudentAttendance(currentUser.id);
      setStudentHistory(history);
    } catch (err) {
      console.error('Error fetching student history:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassStudentsAndRecords = async () => {
    try {
      setLoading(true);
      const stdList = await dbService.getAllStudents(selectedClassId);
      setStudents(stdList);

      // Initialize with ALL NULL (no selection)
      const initialSheet: Record<string, 'present' | 'absent' | 'late' | null> = {};
      stdList.forEach(s => {
        initialSheet[s.id] = null;
      });
      setAttendanceSheet(initialSheet);

      // Check if attendance already exists for today
      const today = new Date().toISOString().slice(0, 10);
      const allAtt = await dbService.getAllAttendance(selectedClassId);
      
      // Filter today's attendance
      const todayAtt = allAtt.filter(a => a.date === today);
      
      if (todayAtt.length > 0) {
        // If attendance already exists for today, populate the sheet
        const existingSheet: Record<string, 'present' | 'absent' | 'late' | null> = {};
        stdList.forEach(s => {
          const existing = todayAtt.find(a => a.student_id === s.id);
          existingSheet[s.id] = existing ? existing.status : null;
        });
        setAttendanceSheet(existingSheet);
        setSubmitSuccess(true);
        setSubmitError('Attendance already marked for today. You can update it.');
      }
      
      setAttendanceRecords(allAtt);
    } catch (err) {
      console.error('Error fetching class students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late' | null) => {
    setAttendanceSheet(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmitAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (students.length === 0) return;

    // Check if all students have been marked
    const allMarked = students.every(s => attendanceSheet[s.id] !== null);
    if (!allMarked) {
      setSubmitError('Please mark attendance for all students before saving.');
      setTimeout(() => setSubmitError(''), 4000);
      return;
    }

    // Check if attendance already exists for today
    const today = new Date().toISOString().slice(0, 10);
    const existingToday = attendanceRecords.filter(a => a.date === today && a.class_id === selectedClassId);
    
    if (existingToday.length > 0) {
      setSubmitError('Attendance for today has already been marked. Please refresh to see the updated sheet.');
      setTimeout(() => setSubmitError(''), 5000);
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError('');
      setSubmitSuccess(false);

      const recordsToPost = students.map(s => ({
        student_id: s.id,
        subject,
        date,
        status: attendanceSheet[s.id] || 'absent', // fallback to absent if null
        class_id: selectedClassId || undefined
      }));

      await dbService.markAttendance(recordsToPost);
      
      // Send notifications to students
      recordsToPost.forEach(rec => {
        if (rec.status !== 'present') {
          dbService.createNotification({
            user_id: rec.student_id,
            title: `Attendance Marked: ${rec.status.toUpperCase()}`,
            message: `You were registered as "${rec.status}" for class "${rec.subject}" on ${rec.date}.`
          }).catch(() => {});
        }
      });

      setSubmitSuccess(true);
      
      // Reload to get updated records
      const allAtt = await dbService.getAllAttendance(selectedClassId);
      setAttendanceRecords(allAtt);
      
      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch (err) {
      console.error('Failed submitting roll call:', err);
      setSubmitError('Failed to save attendance. Please try again.');
      setTimeout(() => setSubmitError(''), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  // Student Stats Calculation
  const totalClasses = studentHistory.length;
  const presentCount = studentHistory.filter(h => h.status === 'present').length;
  const lateCount = studentHistory.filter(h => h.status === 'late').length;
  const absentCount = studentHistory.filter(h => h.status === 'absent').length;

  const attendancePercentage = totalClasses > 0
    ? Math.round(((presentCount + (lateCount * 0.75)) / totalClasses) * 100)
    : 100;

  // Check if today's attendance already exists
  const today = new Date().toISOString().slice(0, 10);
  const hasTodayAttendance = attendanceRecords.some(a => a.date === today && a.class_id === selectedClassId);

  return (
    <div id="attendance_module_root" className="space-y-6">
      
      {/* TEACHER SCREEN - ROLL CALL */}
      {isTeacher ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Roll Call Form Column */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-3 mb-4 border-b border-slate-50">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <UserCheck size={22} className="text-emerald-650" />
                  Mark Daily Attendance Roll
                </h3>
                <p className="text-xs text-slate-400 font-medium">Select class schedule, subject, and update roll calls.</p>
              </div>

              {/* Class selection dropdown - Updated styling */}
              <div className="flex items-center gap-2 shrink-0 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Class:</span>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="bg-transparent border-none text-sm font-semibold text-slate-700 focus:outline-none focus:ring-0 cursor-pointer"
                >
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name} - {c.section}</option>)}
                </select>
              </div>
            </div>

            <form onSubmit={handleSubmitAttendance} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-slate-755 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  >
                    {subjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-slate-755 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>

              {/* Status Messages */}
              {submitSuccess && !hasTodayAttendance && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 animate-fade-in">
                  <CheckCircle2 size={16} /> Roll call generated and written to student profiles!
                </div>
              )}

              {hasTodayAttendance && (
                <div className="bg-amber-50 border border-amber-100 text-amber-800 p-3 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                  <AlertTriangle size={16} /> Attendance already marked for today. You can update it below.
                </div>
              )}

              {submitError && (
                <div className="bg-red-50 border border-red-100 text-red-800 p-3 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                  <XCircle size={16} /> {submitError}
                </div>
              )}

              {/* Student Roll Call Tables */}
              {students.length === 0 ? (
                <div className="p-12 text-center bg-slate-50 rounded-xl text-slate-450 text-xs italic">
                  No students matching this classroom roster. Go to Classroom Studio to enroll students.
                </div>
              ) : (
                <div className="border border-slate-105 rounded-xl overflow-hidden mt-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold text-xs border-b border-slate-100 uppercase tracking-wider">
                          <th className="py-3 px-4">Student Name</th>
                          <th className="py-3 px-4 text-center w-[80px]">Present</th>
                          <th className="py-3 px-4 text-center w-[80px]">Late</th>
                          <th className="py-3 px-4 text-center w-[80px]">Absent</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {students.map((student) => {
                          const currentStatus = attendanceSheet[student.id] || null;
                          
                          return (
                            <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-800">{student.full_name}</span>
                                  {student.roll_no && (
                                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                                      {student.roll_no}
                                    </span>
                                  )}
                                </div>
                              </td>
                              
                              {/* Present Selector */}
                              <td className="py-3.5 px-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(student.id, currentStatus === 'present' ? null : 'present')}
                                  className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center mx-auto ${
                                    currentStatus === 'present'
                                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                                      : 'border-slate-300 hover:border-emerald-400 hover:bg-emerald-50'
                                  }`}
                                >
                                  {currentStatus === 'present' && <CheckCircle2 size={16} />}
                                </button>
                              </td>
       
                              {/* Late Selector */}
                              <td className="py-3.5 px-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(student.id, currentStatus === 'late' ? null : 'late')}
                                  className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center mx-auto ${
                                    currentStatus === 'late'
                                      ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                                      : 'border-slate-300 hover:border-amber-400 hover:bg-amber-50'
                                  }`}
                                >
                                  {currentStatus === 'late' && <AlertTriangle size={16} />}
                                </button>
                              </td>
       
                              {/* Absent Selector */}
                              <td className="py-3.5 px-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(student.id, currentStatus === 'absent' ? null : 'absent')}
                                  className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center mx-auto ${
                                    currentStatus === 'absent'
                                      ? 'bg-rose-500 border-rose-500 text-white shadow-sm'
                                      : 'border-slate-300 hover:border-rose-400 hover:bg-rose-50'
                                  }`}
                                >
                                  {currentStatus === 'absent' && <XCircle size={16} />}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Submit triggers */}
              <div className="flex justify-end pt-2">
                <button
                  id="submit_roll_btn"
                  type="submit"
                  disabled={submitting || students.length === 0 || hasTodayAttendance}
                  className={`px-6 py-2.5 rounded-lg font-semibold text-sm shadow-sm transition cursor-pointer ${
                    hasTodayAttendance
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : submitting || students.length === 0
                      ? 'bg-emerald-300 text-white cursor-not-allowed'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {submitting ? 'Submitting Registry...' : hasTodayAttendance ? 'Already Marked Today' : 'Save Attendance Sheet'}
                </button>
              </div>
            </form>
          </div>

          {/* Quick Registry History Column */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
            <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2 pb-2 border-b border-slate-50">
              <Calendar size={18} className="text-emerald-600" />
              Class Submitted Roll Calls
            </h3>
            
            {attendanceRecords.length === 0 ? (
              <p className="text-slate-405 text-xs py-10 text-center italic leading-relaxed">No roll sheets registered for selected class yet.</p>
            ) : (
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {attendanceRecords.slice(0, 15).map((rec) => (
                  <div key={rec.id} className="bg-slate-50/50 p-3 rounded-xl border border-slate-100/80 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-800">{rec.student_name || 'Student'}</p>
                      <div className="flex items-center gap-1.5 text-slate-400 mt-0.5 font-medium">
                        <span>{rec.subject}</span>
                        <span>•</span>
                        <span>{new Date(rec.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                      rec.status === 'present' ? 'bg-emerald-100 text-emerald-800' :
                      rec.status === 'late' ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {rec.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* STUDENT ATTENDANCE DASHBOARD - Keep as is */
        <div className="space-y-6">
          {/* Summary stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Main Percent Gauge CARD */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="relative flex items-center justify-center">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle cx="32" cy="32" r="28" stroke="#f1f5f9" strokeWidth="6" fill="transparent" />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke={attendancePercentage >= 85 ? '#059669' : attendancePercentage >= 75 ? '#d97706' : '#dc2626'}
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={175.9}
                    strokeDashoffset={175.9 - (175.9 * attendancePercentage) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-sm font-bold text-slate-800">{attendancePercentage}%</span>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Attendance Rate</p>
                <p className="text-xl font-extrabold text-slate-800 mt-0.5">{totalClasses} Sessions</p>
              </div>
            </div>

            {/* Present count */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="p-3 rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Present</p>
                <p className="text-2xl font-black text-slate-800 mt-0.5">{presentCount}</p>
              </div>
            </div>

            {/* Late count */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="p-3 rounded-full bg-amber-50 text-amber-600">
                <AlertTriangle size={22} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Late</p>
                <p className="text-2xl font-black text-slate-800 mt-0.5">{lateCount}</p>
              </div>
            </div>

            {/* Absent count */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="p-3 rounded-full bg-rose-50 text-rose-600">
                <XCircle size={22} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Absent</p>
                <p className="text-2xl font-black text-slate-800 mt-0.5">{absentCount}</p>
              </div>
            </div>
          </div>

          {/* Detailed Attendance Log */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-base font-bold text-slate-750 mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-indigo-600" />
              Your Attendance History Archive
            </h3>
            
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full" />
              </div>
            ) : studentHistory.length === 0 ? (
              <div className="text-center p-12 bg-slate-50 rounded-xl text-slate-400 text-sm">
                <Info size={32} className="mx-auto mb-2 opacity-50" />
                No daily roll history verified in secondary databases.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-105">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-100 uppercase">
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Class Date</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {studentHistory.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-semibold text-slate-850">{rec.subject}</td>
                        <td className="py-3 px-4 text-slate-500">
                          {new Date(rec.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            rec.status === 'present' ? 'bg-emerald-50 text-emerald-800' :
                            rec.status === 'late' ? 'bg-amber-50 text-amber-800' :
                            'bg-rose-50 text-rose-800'
                          }`}>
                            {rec.status === 'present' && <CheckCircle2 size={13} />}
                            {rec.status === 'late' && <AlertTriangle size={13} />}
                            {rec.status === 'absent' && <XCircle size={13} />}
                            {rec.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}