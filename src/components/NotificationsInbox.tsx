/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import { Notification, Profile } from '../types';
import { Bell, Check, Eye, Trash, RefreshCw, VolumeX, MailOpen } from 'lucide-react';

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
    <div id="notifications_inbox_root" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm max-w-xl mx-auto space-y-4">
      
      {/* Inbox Header Controls */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-50">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell size={20} className="text-indigo-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </div>
          <h3 className="text-base font-black text-slate-800">Your Notifications</h3>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 transition"
          >
            <Check size={14} strokeWidth={2.5} /> Mark all Read
          </button>
        )}
      </div>

      {/* Notifications Scroll Area */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-10 text-slate-400 text-xs flex flex-col items-center justify-center">
          <MailOpen size={30} className="mb-2 opacity-50 text-indigo-505" />
          <span>No notifications found in your inbox.</span>
        </div>
      ) : (
        <div className="space-y-3.0 max-h-96 overflow-y-auto pr-1">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-3.5 rounded-xl border text-xs transition-all flex items-start gap-3.0 ${
                n.is_read
                  ? 'bg-slate-50/50 border-slate-100/75 opacity-70'
                  : 'bg-indigo-50/20 border-indigo-100 hover:bg-indigo-50/35 hover:border-indigo-150'
              }`}
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className={`font-bold ${n.is_read ? 'text-slate-600' : 'text-slate-800'}`}>
                    {n.title}
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    {new Date(n.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-500 font-medium leading-relaxed">{n.message}</p>
              </div>

              {!n.is_read && (
                <button
                  type="button"
                  onClick={() => handleMarkRead(n.id)}
                  title="Mark as read"
                  className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                >
                  <Eye size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Browser API Explanatory message */}
      <div className="bg-slate-50 p-2.5 rounded-lg text-[10px] text-slate-400 font-medium leading-normal flex items-start gap-1.5 border border-slate-100">
        <span>💡</span>
        <span>Includes standard system background tasks alert triggers. Requests active Browser Notification permissions for push reminders.</span>
      </div>

    </div>
  );
}
