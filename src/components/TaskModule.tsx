/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import { Task, Profile } from '../types';
import { Plus, Trash, Check, X, Edit, Calendar, BookOpen, CheckSquare, Clock, Filter, AlertTriangle } from 'lucide-react';

interface TaskModuleProps {
  currentUser: Profile;
}

export default function TaskModule({ currentUser }: TaskModuleProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [dueDate, setDueDate] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  
  const subjects = ['Mathematics', 'Chemistry', 'Physics', 'English', 'History', 'Biology', 'General'];

  useEffect(() => {
    fetchTasks();
  }, [currentUser.id]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await dbService.getTasks(currentUser.id);
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    try {
      if (editingId) {
        await dbService.updateTask(editingId, title, subject, dueDate);
        setEditingId(null);
      } else {
        await dbService.createTask({
          student_id: currentUser.id,
          title,
          subject,
          due_date: dueDate,
          status: 'pending'
        });
      }
      
      setTitle('');
      setDueDate('');
      setSubject('Mathematics');
      fetchTasks();
      
      // Request browser notification reminder for due date
      triggerDueTaskNotification(title, dueDate);
    } catch (err) {
      console.error('Saving task failed:', err);
    }
  };

  const triggerDueTaskNotification = (taskTitle: string, dateStr: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  };

  const handleToggleStatus = async (task: Task) => {
    try {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      await dbService.updateTaskStatus(task.id, newStatus);
      fetchTasks();
    } catch (err) {
      console.error('Failed toggling task status:', err);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingId(task.id);
    setTitle(task.title);
    setSubject(task.subject);
    setDueDate(task.due_date);
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await dbService.deleteTask(id);
      fetchTasks();
    } catch (err) {
      console.error('Failed deleting task:', err);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setSubject('Mathematics');
    setDueDate('');
  };

  // Filter & Search Logic
  const filteredTasks = tasks.filter(task => {
    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'pending' ? task.status === 'pending' :
      task.status === 'completed';
      
    const matchesSubject = 
      subjectFilter === 'all' ? true :
      task.subject === subjectFilter;

    return matchesStatus && matchesSubject;
  });

  return (
    <div id="task_module_root" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* TASK FORM CONTAINER */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          {editingId ? <Edit size={20} className="text-amber-500" /> : <Plus size={20} className="text-teal-600" />}
          {editingId ? 'Edit Personal Task' : 'Add Personal Task'}
        </h3>
        
        <form onSubmit={handleSaveTask} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            >
              {subjects.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Task Title</label>
            <input
              type="text"
              placeholder="e.g. Study calculus rules"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              id="submit_task_btn"
              type="submit"
              className="flex-1 py-2 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium text-sm text-center"
            >
              {editingId ? 'Update Task' : 'Create Task'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="py-2 px-3 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition text-sm font-medium"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* TASK LIST CONTAINER */}
      <div className="lg:col-span-2 space-y-4">
        
        {/* FILTER BAR */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
            <Filter size={16} />
            <span>Filters:</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Tabs */}
            <div className="flex bg-slate-200/60 p-1 rounded-lg text-xs font-medium">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-md transition ${statusFilter === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-md transition ${statusFilter === 'pending' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Pending
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-3 py-1.5 rounded-md transition ${statusFilter === 'completed' ? 'bg-white text-slate-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Completed
              </button>
            </div>

            {/* Subject Selector */}
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg text-xs px-3 py-1.5 text-slate-600 focus:outline-none focus:border-teal-500"
            >
              <option value="all">All Subjects</option>
              {subjects.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        </div>

        {/* LOADING & TASKS VIEW */}
        {loading ? (
          <div className="flex justify-center items-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="animate-spin border-3 border-teal-500 border-t-transparent rounded-full h-8 w-8"></div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
            <CheckSquare size={48} className="text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm">No personal tasks match your filters.</p>
            {tasks.length === 0 && (
              <p className="text-slate-400 text-xs mt-1">Get started by creating your first personal study target!</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredTasks.map((task) => {
              const isOverdue = new Date(task.due_date + 'T23:59:59') < new Date() && task.status === 'pending';
              
              return (
                <div
                  key={task.id}
                  className={`bg-white p-4 rounded-xl border transition-all flex items-center justify-between shadow-xs ${
                    task.status === 'completed'
                      ? 'border-slate-100 bg-slate-50/50 opacity-80'
                      : isOverdue
                      ? 'border-red-200 bg-red-50/10'
                      : 'border-slate-100 hover:border-teal-200 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0 mr-4">
                    <button
                      onClick={() => handleToggleStatus(task)}
                      className={`p-1.5 rounded-full border transition-all ${
                        task.status === 'completed'
                          ? 'bg-teal-50 border-teal-200 text-teal-600 hover:bg-teal-100'
                          : 'border-slate-350 text-slate-300 hover:border-teal-500 hover:text-teal-500'
                      }`}
                    >
                      {task.status === 'completed' ? <Check size={16} strokeWidth={3} /> : <div className="w-4 h-4 rounded-full" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          task.subject === 'Mathematics' ? 'bg-indigo-50 text-indigo-700' :
                          task.subject === 'Chemistry' ? 'bg-amber-50 text-amber-700' :
                          task.subject === 'Physics' ? 'bg-cyan-50 text-cyan-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {task.subject}
                        </span>
                        
                        {isOverdue && (
                          <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-red-650 bg-red-100/60 px-1.5 py-0.5 rounded">
                            <AlertTriangle size={10} /> Overdue
                          </span>
                        )}
                      </div>

                      <h4 className={`text-sm font-semibold mt-1 text-slate-800 ${task.status === 'completed' ? 'line-through text-slate-400' : ''}`}>
                        {task.title}
                      </h4>

                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar size={13} />
                          Due: {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleEditTask(task)}
                      title="Edit Task"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition"
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      title="Delete Task"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                    >
                      <Trash size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
