/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import { Notification, Profile } from '../types';
import { Bell, Check, Eye, Trash, RefreshCw, VolumeX, MailOpen, Inbox } from 'lucide-react';

interface NotificationsInboxProps {
  currentUser: Profile;
  onRefreshTrigger?: () => void;
}

export default function NotificationsInbox({ currentUser, onRefreshTrigger }: NotificationsInboxProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [currentUser]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await dbService.getNotifications(currentUser.id);
      setNotifications(data);
    } catch (err) {
      console.error('Failed reading notifications inbox:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await dbService.markNotificationRead(id);
      fetchNotifications();
      if (onRefreshTrigger) onRefreshTrigger();
    } catch (err) {
      console.error('Failed mark single notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await dbService.markAllNotificationsRead(currentUser.id);
      fetchNotifications();
      if (onRefreshTrigger) onRefreshTrigger();
    } catch (err) {
      console.error('Failed mark all notifications read:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div id="notifications_inbox_root" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm max-w-3xl mx-auto space-y-5">
      
      {/* Inbox Header Controls */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <Bell size={22} className="text-indigo-600" />
            </div>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800">Your Notifications</h3>
            <p className="text-xs text-slate-400 font-medium">
              {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
          >
            <Check size={14} strokeWidth={2.5} /> Mark all Read
          </button>
        )}
      </div>

      {/* Notifications Scroll Area */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 text-slate-400 flex flex-col items-center justify-center">
          <div className="p-4 bg-slate-50 rounded-full mb-4">
            <Inbox size={40} className="text-slate-300" />
          </div>
          <p className="text-base font-semibold text-slate-500">No notifications found</p>
          <p className="text-xs text-slate-400 mt-1">When you receive notifications, they'll appear here.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-xl border text-sm transition-all flex items-start gap-4 ${
                n.is_read
                  ? 'bg-slate-50/50 border-slate-100/75 opacity-75'
                  : 'bg-indigo-50/20 border-indigo-100 hover:bg-indigo-50/35 hover:border-indigo-150 shadow-sm'
              }`}
            >
              {/* Status indicator */}
              {!n.is_read && (
                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
              )}
              
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className={`font-bold ${n.is_read ? 'text-slate-600' : 'text-slate-800'}`}>
                    {n.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap ml-3">
                    {new Date(n.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className={`text-sm leading-relaxed ${n.is_read ? 'text-slate-500' : 'text-slate-700'}`}>
                  {n.message}
                </p>
                <div className="text-[10px] text-slate-400 font-medium">
                  {new Date(n.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>

              {!n.is_read && (
                <button
                  type="button"
                  onClick={() => handleMarkRead(n.id)}
                  title="Mark as read"
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition shrink-0"
                >
                  <Eye size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Browser API Explanatory message */}
      <div className="bg-slate-50 p-3 rounded-xl text-[11px] text-slate-400 font-medium leading-relaxed flex items-start gap-2 border border-slate-100">
        <span className="text-base">💡</span>
        <span>Includes standard system background tasks alert triggers. Requests active Browser Notification permissions for push reminders.</span>
      </div>

    </div>
  );
}