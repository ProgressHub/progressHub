/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { dbService } from '../services/db';
import { Profile } from '../types';
import { BookOpen, User, Mail, ShieldAlert, ArrowLeft, CheckCircle2, AlertCircle, KeyRound, Hash, Lock } from 'lucide-react';

interface RegisterProps {
  onSuccess: (profile: Profile) => void;
  onNavigateToLogin: () => void;
}

export default function Register({ onSuccess, onNavigateToLogin }: RegisterProps) {
  const [activeTab, setActiveTab] = useState<'student' | 'teacher'>('student');
  
  // Student Form State
  const [rollNo, setRollNo] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [studentConfirmPassword, setStudentConfirmPassword] = useState('');

  // Teacher Form State
  const [teacherFullName, setTeacherFullName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [teacherConfirmPassword, setTeacherConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!rollNo.trim()) {
      setErrorMsg('Roll number is required.');
      return;
    }
    if (!studentEmail.trim()) {
      setErrorMsg('Email address is required.');
      return;
    }
    if (studentPassword !== studentConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (studentPassword.length < 6) {
      setErrorMsg('Password should be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      const profile = await dbService.registerStudent(rollNo.toUpperCase().trim(), studentEmail.trim(), studentPassword);
      setSuccessMsg(`Welcome aboard, ${profile.full_name}! Registration successful.`);
      setTimeout(() => {
        onSuccess(profile);
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Enrollment registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!teacherFullName.trim()) {
      setErrorMsg('Full name is required.');
      return;
    }
    if (!teacherEmail.trim()) {
      setErrorMsg('Email address is required.');
      return;
    }
    if (!inviteCode.trim()) {
      setErrorMsg('Teacher invite code is required.');
      return;
    }
    if (teacherPassword !== teacherConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (teacherPassword.length < 6) {
      setErrorMsg('Password should be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      const profile = await dbService.registerTeacher(
        teacherFullName.trim(),
        teacherEmail.trim(),
        teacherPassword,
        inviteCode.trim()
      );
      setSuccessMsg(`Welcome, Professor ${profile.full_name}! Classroom portal prepared.`);
      setTimeout(() => {
        onSuccess(profile);
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Teacher registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="register_screen_root" className="min-y-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
        
        {/* Back navigation Trigger */}
        <button
          onClick={onNavigateToLogin}
          className="text-xs text-slate-400 hover:text-indigo-600 font-bold flex items-center gap-1 transition cursor-pointer"
        >
          <ArrowLeft size={13} strokeWidth={2.5} /> Back to Sign In
        </button>

        {/* Logo / Header Branding */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-gradient-to-tr from-teal-600 to-indigo-700 text-white rounded-2xl flex items-center justify-center font-bold">
            <BookOpen size={24} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Academic Enrollment</h2>
          <p className="text-xs text-slate-400 font-medium">
            Join the academic tracking portal using secure enrollment verification.
          </p>
        </div>

        {/* Custom Tab Selector */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab('student');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 text-center py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'student' ? 'bg-white text-slate-800 shadow' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Student Sign Up
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('teacher');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 text-center py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'teacher' ? 'bg-white text-slate-800 shadow' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Teacher Sign Up
          </button>
        </div>

        {/* Dynamic Instructional Chip explaining the flow */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-[11px] text-slate-500 leading-relaxed font-medium">
          {activeTab === 'student' ? (
            <span>
              ℹ️ Students cannot freely create accounts. Enter your official <strong>Roll Number</strong> (e.g. <code>22CSE001</code>). We will automatically match and inherit your Full Name, Class, and Section from our verified registry database.
            </span>
          ) : (
            <span>
              🔒 Public teacher registration is offline. Enter your assigned <strong>Teacher Invite Code</strong> (e.g. <code>INVITE-JENKINS</code>) along with your details to initialize your management profile.
            </span>
          )}
        </div>

        {/* Forms */}
        {activeTab === 'student' ? (
          <form onSubmit={handleStudentRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-650 uppercase tracking-wide mb-1.5">Official Roll Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <Hash size={14} />
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. 22CSE001"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-650 uppercase tracking-wide mb-1.5">Enrolled Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <Mail size={14} />
                </span>
                <input
                  type="email"
                  required
                  placeholder="e.g. student@school.com"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-650 uppercase tracking-wide mb-1.5">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <Lock size={14} />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="••••••"
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-650 uppercase tracking-wide mb-1.5">Confirm</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <Lock size={14} />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="••••••"
                    value={studentConfirmPassword}
                    onChange={(e) => setStudentConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl text-rose-800 text-xs font-semibold flex items-start gap-1.5 leading-relaxed">
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-emerald-800 text-xs font-semibold flex items-start gap-1.5 leading-relaxed">
                <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-teal-600 to-indigo-650 hover:from-teal-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Verifying Registry...' : 'Register Student Account'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleTeacherRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-650 uppercase tracking-wide mb-1.5">Professor Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <User size={14} />
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Jenkins"
                  value={teacherFullName}
                  onChange={(e) => setTeacherFullName(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-650 uppercase tracking-wide mb-1.5">Official Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <Mail size={14} />
                </span>
                <input
                  type="email"
                  required
                  placeholder="e.g. professor@school.com"
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-650 uppercase tracking-wide mb-1.5">Teacher Invite Code</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <KeyRound size={14} />
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. INVITE-JENKINS"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-150 text-sm font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-650 uppercase tracking-wide mb-1.5">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <Lock size={14} />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="••••••"
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-150 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-650 uppercase tracking-wide mb-1.5">Confirm</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <Lock size={14} />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="••••••"
                    value={teacherConfirmPassword}
                    onChange={(e) => setTeacherConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-150 text-sm"
                  />
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl text-rose-800 text-xs font-semibold flex items-start gap-1.5 leading-relaxed">
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-emerald-800 text-xs font-semibold flex items-start gap-1.5 leading-relaxed">
                <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-850 hover:from-indigo-750 hover:to-indigo-850 text-white rounded-xl font-bold text-sm shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Verifying Invite...' : 'Register Teacher Account'}
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-100">
          <button
            onClick={onNavigateToLogin}
            className="text-xs text-indigo-650 hover:underline font-bold cursor-pointer"
          >
            Already enrolled? Sign In here
          </button>
        </div>

      </div>

    </div>
  );
}
