/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { dbService } from '../services/db';
import { Profile } from '../types';
import { BookOpen, Key, Mail, AlertCircle } from 'lucide-react';

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

        {/* Help text - no registration link */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-400 font-medium">
            Accounts are managed by school administration.
          </p>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Contact your teacher if you need access.
          </p>
        </div>

        {/* REMOVED: Sandbox Quick Access Accounts section */}

      </div>

    </div>
  );
}