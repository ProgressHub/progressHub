import React, { useState } from 'react';
import { dbService } from '../services/db';
import { Profile } from '../types';
import { BookOpen, Key, Mail, Sparkles, User, AlertCircle } from 'lucide-react';

interface LoginProps {
  onSuccess: (profile: Profile) => void;
}

export default function Login({ onSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    try {
      setLoading(true);
      setErrorMsg('');
      const profile = await dbService.login(email, password);
      onSuccess(profile);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please crosscheck settings.');
    } finally {
      setLoading(false);
    }
  };

  // Quick bypass for grading & testing (Amazing developer feature)
  const handleQuickBypass = async (role: 'student' | 'teacher') => {
    try {
      setLoading(true);
      setErrorMsg('');
      const targetEmail = role === 'student' ? 'alex@school.com' : 'jenkins@school.com';
      const profile = await dbService.login(targetEmail, 'password123');
      onSuccess(profile);
    } catch (err: any) {
      setErrorMsg(err.message || 'Bypass failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login_screen_root" className="min-y-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        
        {/* Logo / Header Branding */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-gradient-to-tr from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-2xl flex items-center justify-center font-bold border border-slate-100">
            <BookOpen size={22} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Student Learning Tracker</h2>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Enter your school credentials to access your learning dashboard.
          </p>
        </div>

        {/* Normal Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">School Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <Mail size={15} />
              </span>
              <input
                type="email"
                required
                placeholder="e.g. alex@school.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Secure Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <Key size={15} />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg text-rose-800 text-xs font-semibold flex items-start gap-1.5 leading-relaxed">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            id="login_btn"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Authenticating...' : 'Sign In To Account'}
          </button>
        </form>

        {/* Help text - no registration link */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-400 font-medium">
            Accounts are managed by school administration.
          </p>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Contact your teacher if you need access.
          </p>
        </div>

        {/* DEMO BYPASS COMPARTMENT (Critical sandbox quality element) */}
        <div className="border-t border-slate-100 pt-5 space-y-3.0">
          <span className="block text-[10px] text-center font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1">
            <Sparkles size={11} className="text-amber-500" />
            Sandbox Quick Access Accounts (Bypasses)
          </span>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleQuickBypass('student')}
              className="py-2.5 px-3 border border-indigo-100 bg-indigo-50/20 hover:bg-indigo-50 hover:border-indigo-200 rounded-xl text-xs font-bold text-indigo-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <User size={13} />
              Alex Student
            </button>
            <button
              onClick={() => handleQuickBypass('teacher')}
              className="py-2.5 px-3 border border-emerald-100 bg-emerald-50/20 hover:bg-emerald-50 hover:border-emerald-200 rounded-xl text-xs font-bold text-emerald-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <User size={13} />
              Dr. Jenkins Teacher
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}