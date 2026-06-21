/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { dbService } from '../services/db';
import { Profile } from '../types';
import { BookOpen, Key, Mail, AlertCircle, User, GraduationCap } from 'lucide-react';

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

  const fillTestAccount = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
    setErrorMsg('');
  };

  return (
    <div id="login_screen_root" className="min-y-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        
        {/* Logo / Header Branding */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-2xl flex items-center justify-center font-bold shadow-lg">
            <BookOpen size={26} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">ProgressHub</h2>
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
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
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
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
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
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Authenticating...' : 'Sign In To Account'}
          </button>
        </form>

        {/* Test Accounts Section - Always Visible */}
        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-center justify-center gap-2 mb-3">
            <User size={14} className="text-slate-400" />
            <p className="text-xs font-semibold text-slate-500">Demo Test Accounts</p>
            <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
              Try Now
            </span>
          </div>
          
          <p className="text-[11px] text-slate-400 text-center mb-3">
            Click any test account to auto-fill credentials
          </p>
          
          <div className="space-y-2">
            {/* Student Account */}
            <div 
              onClick={() => fillTestAccount('amaresh@school.com', 'amaresh')}
              className="flex items-center justify-between p-2.5 bg-indigo-50 hover:bg-indigo-100 rounded-xl cursor-pointer transition border border-indigo-100"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700">
                  <GraduationCap size={15} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-700">Student Demo</p>
                  <p className="text-[10px] text-slate-500">amaresh@school.com</p>
                </div>
              </div>
              <div className="text-[10px] text-indigo-600 font-mono bg-white px-2 py-0.5 rounded border border-indigo-200">
                pass: amaresh
              </div>
            </div>

            {/* Teacher/Admin Account */}
            <div 
              onClick={() => fillTestAccount('aruna@gmail.com', 'aruna')}
              className="flex items-center justify-between p-2.5 bg-emerald-50 hover:bg-emerald-100 rounded-xl cursor-pointer transition border border-emerald-100"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700">
                  <User size={15} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-700">Teacher Demo</p>
                  <p className="text-[10px] text-slate-500">aruna@gmail.com</p>
                </div>
              </div>
              <div className="text-[10px] text-emerald-600 font-mono bg-white px-2 py-0.5 rounded border border-emerald-200">
                pass: aruna
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 text-center mt-3">
            ⚡ These are demo accounts for preview purposes only
          </p>
        </div>

        {/* Help text - no registration link */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-400 font-medium">
            Accounts are managed by school administration.
          </p>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Contact your teacher if you need access.
          </p>
        </div>

      </div>

    </div>
  );
}