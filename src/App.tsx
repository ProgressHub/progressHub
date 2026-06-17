/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { dbService, isSupabaseConfigured } from './services/db';
import { Profile } from './types';
import Login from './components/Login';
import DashboardStudent from './components/DashboardStudent';
import DashboardTeacher from './components/DashboardTeacher';
import TaskModule from './components/TaskModule';
import AssignmentModule from './components/AssignmentModule';
import AttendanceModule from './components/AttendanceModule';
import QuizModule from './components/QuizModule';
import AnalyticsModule from './components/AnalyticsModule';
import NotificationsInbox from './components/NotificationsInbox';

import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  Calendar,
  Trophy,
  BarChart4,
  Bell,
  LogOut,
  BookOpen,
  Menu,
  X
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // High fidelity notification bubble count
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Check initial session
    checkUserSession();
    // Prompt for browser notification permissions
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  const checkUserSession = async () => {
    try {
      setLoading(true);
      const user = await dbService.getSessionProfile();
      setCurrentUser(user);
      if (user) {
        fetchNotificationsCount(user.id);
      }
    } catch (err) {
      console.error('Session matching failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationsCount = async (userId: string) => {
    try {
      const data = await dbService.getNotifications(userId);
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch (err) {
      console.error('Error fetching unread list:', err);
    }
  };

  const handleAuthSuccess = (profile: Profile) => {
    setCurrentUser(profile);
    setActiveTab('dashboard');
    fetchNotificationsCount(profile.id);
  };

  const handleLogout = async () => {
    try {
      await dbService.logout();
      setCurrentUser(null);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Nav Tabs configuration per role
  const getNavItems = () => {
    if (!currentUser) return [];

    const items = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'assignments', label: 'Assignments', icon: FileText }
    ];

    if (currentUser.role === 'student') {
      items.push({ id: 'tasks', label: 'Personal Planner', icon: CheckSquare });
    }

    items.push(
      { id: 'attendance', label: 'Attendance', icon: Calendar },
      { id: 'quizzes', label: 'Quizzes MCQ', icon: Trophy },
      { id: 'analytics', label: 'Analytics Insights', icon: BarChart4 }
    );

    return items;
  };

  const navItems = getNavItems();

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  // Render correct Active Module panel
  const renderActiveModule = () => {
    if (!currentUser) return null;

    switch (activeTab) {
      case 'dashboard':
        return currentUser.role === 'student' ? (
          <DashboardStudent currentUser={currentUser} setViewTab={handleTabClick} />
        ) : (
          <DashboardTeacher currentUser={currentUser} setViewTab={handleTabClick} />
        );
      case 'tasks':
        return currentUser.role === 'student' ? (
          <TaskModule currentUser={currentUser} />
        ) : null;
      case 'assignments':
        return <AssignmentModule currentUser={currentUser} />;
      case 'attendance':
        return <AttendanceModule currentUser={currentUser} />;
      case 'quizzes':
        return <QuizModule currentUser={currentUser} />;
      case 'analytics':
        return <AnalyticsModule currentUser={currentUser} />;
      case 'notifications':
        return (
          <NotificationsInbox
            currentUser={currentUser}
            onRefreshTrigger={() => fetchNotificationsCount(currentUser.id)}
          />
        );
      default:
        return (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-100">
            Select an operational tab from the left navigation.
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div id="app_loader" className="h-screen w-screen flex flex-col justify-center items-center bg-slate-50">
        <div className="animate-spin border-4 border-indigo-600 border-t-transparent rounded-full h-11 w-11" />
        <p className="text-slate-450 text-xs font-semibold uppercase tracking-wider mt-4">Piping learning databases...</p>
      </div>
    );
  }

  // --- RENDERING AUTH VIEWS ---
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col justify-between">
        <main className="flex-1 flex items-center justify-center">
          <Login onSuccess={handleAuthSuccess} />
        </main>
        
        {/* Simple visual sandbox copyright/banner at the bottom */}
        <footer className="text-center py-6 text-xs text-slate-400 font-medium border-t border-slate-100/50 bg-white">
          <span>ProgressHub • Powered by Supabase & React</span>
        </footer>
      </div>
    );
  }

  // --- RENDERING MAIN DASHBOARD WORKSPACE LAYOUT ---
  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      
      {/* 1. SIDEBAR NAVIGATION - DESKTOP */}
      <aside className="hidden lg:flex flex-col h-screen sticky top-0 w-64 bg-white text-slate-700 border-r border-slate-200 shrink-0 select-none">
        {/* Brand Header - Fixed at top */}
        <div className="h-16 flex items-center gap-2.5 px-6 border-b border-slate-100 shrink-0">
          <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold">
            <BookOpen size={16} />
          </div>
          <span className="text-lg font-black text-slate-800 tracking-tight">ProgressHub</span>
        </div>

        {/* User badge row - Fixed */}
        <div className="p-5 border-b border-slate-100 flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold uppercase text-xs border border-indigo-100">
            {currentUser.full_name.substr(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-slate-800 truncate leading-none">{currentUser.full_name}</h4>
            <span className={`inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded leading-none ${
              currentUser.role === 'student' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              {currentUser.role}
            </span>
          </div>
        </div>

        {/* Menu Items - Scrollable if needed */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const IconComp = item.icon;
            const isSelected = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                  isSelected
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <IconComp size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout Button - Fixed at bottom with red color */}
        <div className="p-4 border-t border-slate-100 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 transition-all font-semibold text-sm"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. MOBILE - OVERLAY WITH SLIDE-IN SIDEBAR */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Slide-in sidebar */}
          <div className="lg:hidden fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Close button */}
              <div className="flex justify-between items-center p-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold">
                    <BookOpen size={16} />
                  </div>
                  <span className="text-lg font-black text-slate-800 tracking-tight">ProgressHub</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 transition"
                >
                  <X size={20} className="text-slate-600" />
                </button>
              </div>

              {/* User badge */}
              <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold uppercase text-sm border border-indigo-100">
                  {currentUser.full_name.substr(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-slate-800 truncate leading-none">{currentUser.full_name}</h4>
                  <span className={`inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded leading-none ${
                    currentUser.role === 'student' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {currentUser.role}
                  </span>
                </div>
              </div>

              {/* Navigation items */}
              <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {navItems.map((item) => {
                  const IconComp = item.icon;
                  const isSelected = activeTab === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold transition ${
                        isSelected
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <IconComp size={18} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Logout button */}
              <div className="p-4 border-t border-slate-100 shrink-0">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 transition-all font-semibold text-sm"
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 3. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Upper Top Navbar for headers */}
        <header className="bg-white border-b border-slate-150 h-16 flex items-center justify-between px-6 z-30 select-none shrink-0 sticky top-0">
          
          {/* Mobile hamburger selector */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 lg:hidden transition"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-sm font-black text-slate-800 lg:text-base capitalize">
              {activeTab === 'dashboard' ? 'Overview Dashboard' : activeTab.replace('_', ' ')}
            </h1>
          </div>

          {/* Quick notification bubble and user actions */}
          <div className="flex items-center gap-4">
            
            <button
              onClick={() => handleTabClick('notifications')}
              className={`p-2 rounded-lg border relative transition ${
                activeTab === 'notifications'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Quick compact User Label */}
            <div className="text-right hidden sm:block">
              <span className="block text-xs font-bold text-slate-800">{currentUser.full_name}</span>
              <span className="text-[10px] text-slate-400 capitalize font-medium">{currentUser.role} Account</span>
            </div>
          </div>
        </header>

        {/* 4. CORE ROUTER ACTIVE RENDER WORKBENCH PANEL */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {renderActiveModule()}
        </main>
      </div>

    </div>
  );
}