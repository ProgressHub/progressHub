/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import { Assignment, Profile, Class } from '../types';
import { FileUp, FileText, Download, Calendar, Plus, BookOpen, AlertCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface AssignmentModuleProps {
  currentUser: Profile;
}

export default function AssignmentModule({ currentUser }: AssignmentModuleProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const isTeacher = currentUser.role === 'teacher';

  // Class Selection for Teachers
  const [classes, setClasses] = useState<Class[]>([]);
  const [targetClassId, setTargetClassId] = useState('');

  // Form State for Teacher
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  
  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const subjects = ['Mathematics', 'Chemistry', 'Physics', 'English', 'History', 'Biology', 'General'];

  useEffect(() => {
    fetchAssignments();
    if (isTeacher) {
      dbService.getClasses().then(cls => {
        setClasses(cls);
        if (cls.length > 0) {
          setTargetClassId(cls[0].id);
        }
      }).catch(err => console.error(err));
    }
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const data = await dbService.getAssignments(currentUser.role === 'student' ? currentUser.class_id : undefined);
      setAssignments(data);
    } catch (err) {
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadSuccess(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !deadline) return;

    try {
      setUploading(true);
      let fileUrl = '';
      if (selectedFile) {
        fileUrl = await dbService.uploadAssignmentFile(selectedFile);
        setUploadSuccess(true);
      }

      await dbService.createAssignment({
        teacher_id: currentUser.id,
        title,
        subject,
        deadline,
        description,
        file_url: fileUrl,
        class_id: targetClassId || undefined
      });

      // Clear Form state
      setTitle('');
      setDeadline('');
      setDescription('');
      setSelectedFile(null);
      setUploadSuccess(false);
      
      // Refresh
      fetchAssignments();
    } catch (err) {
      console.error('Failed creating assignment:', err);
    } finally {
      setUploading(false);
    }
  };

  const getRemainingTimeText = (deadlineStr: string) => {
    const now = new Date();
    const end = new Date(deadlineStr);
    const diffMs = end.getTime() - now.getTime();
    if (diffMs < 0) return { text: 'Past Due', type: 'overdue' };

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return { text: `${days} day${days > 1 ? 's' : ''} left`, type: 'normal' };
    } else if (hours > 0) {
      return { text: `${hours} hour${hours > 1 ? 's' : ''} left`, type: 'immediate' };
    } else {
      return { text: 'Due very soon', type: 'immediate' };
    }
  };

  return (
    <div id="assignment_module_root" className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      
      {/* TEACHER CREATOR VIEW */}
      {isTeacher && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Plus size={20} className="text-indigo-600" />
            Post New Assignment
          </h3>
          
          <form onSubmit={handleCreateAssignment} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Classroom Destination</label>
              <select
                value={targetClassId}
                onChange={(e) => setTargetClassId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                {classes.map(c => <option key={c.id} value={c.id}>{c.name} - {c.section}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Assignment Title</label>
              <input
                type="text"
                placeholder="e.g. Chapter 6 Review Exercises"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Deadline</label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Instructions / Description</label>
              <textarea
                placeholder="Write instructions regarding materials, submissions and evaluation criteria here."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
              />
            </div>

            {/* Drag Drop or manual File Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Attach Notes or Worksheets (Optional)</label>
              <div className="border border-dashed border-slate-250 hover:border-indigo-400 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col items-center justify-center relative cursor-pointer">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <FileUp className="text-slate-400 mb-2" size={24} />
                <span className="text-xs font-semibold text-slate-600 text-center">
                  {selectedFile ? selectedFile.name : 'Drag files here or click to upload'}
                </span>
                <span className="text-[10px] text-slate-400 mt-1">PDF, DOCX or ZIP up to 10MB</span>
              </div>
              {uploadSuccess && (
                <div className="flex items-center gap-1.5 text-xs text-green-600 font-semibold mt-2">
                  <CheckCircle2 size={14} /> File uploaded & linked successfully!
                </div>
              )}
            </div>

            <button
              id="submit_assignment_btn"
              type="submit"
              disabled={uploading}
              className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition relative overflow-hidden flex items-center justify-center gap-2 ${
                uploading 
                  ? 'bg-indigo-300 text-indigo-100 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {uploading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Uploading attachment...
                </>
              ) : (
                'Post Assignment'
              )}
            </button>
          </form>
        </div>
      )}

      {/* ASSIGNMENTS DISPLAY LIST */}
      <div className={isTeacher ? 'xl:col-span-2 space-y-4' : 'xl:col-span-3 space-y-4'}>
        {loading ? (
          <div className="flex justify-center items-center py-24 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="animate-spin border-3 border-indigo-650 border-t-transparent rounded-full h-8 w-8"></div>
          </div>
        ) : assignments.length === 0 ? (
          <div className="bg-white p-16 text-center rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
            <FileText size={48} className="text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">No classroom assignments released yet.</p>
            <p className="text-slate-400 text-xs mt-1">Teachers will publish new work tasks, guidelines, and reading PDF resource attachments here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments.map((assign) => {
              const rem = getRemainingTimeText(assign.deadline);
              
              return (
                <div
                  key={assign.id}
                  className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs hover:shadow-sm hover:border-indigo-100 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header bar */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        assign.subject === 'Mathematics' ? 'bg-indigo-50 text-indigo-700' :
                        assign.subject === 'Chemistry' ? 'bg-amber-50 text-amber-700' :
                        assign.subject === 'Physics' ? 'bg-cyan-50 text-cyan-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {assign.subject}
                      </span>

                      {/* Deadline chip */}
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                        rem.type === 'overdue' ? 'bg-red-50 text-red-700 font-semibold' :
                        rem.type === 'immediate' ? 'bg-amber-50 text-amber-700 animate-pulse' :
                        'bg-emerald-50 text-emerald-800'
                      }`}>
                        <ClockIcon className="w-3.0 h-3.0" />
                        {rem.text}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-800 tracking-tight leading-snug">{assign.title}</h4>
                    <p className="text-xs text-indigo-650 mt-1 font-medium">By: {assign.teacher_name}</p>
                    
                    <p className="text-slate-500 text-xs leading-relaxed mt-3 mb-4 font-normal line-clamp-4">
                      {assign.description || 'No supplementary instructions supplied.'}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex flex-wrap items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                      <Calendar size={13} />
                      Due {new Date(assign.deadline).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>

                    {assign.file_url ? (
                      <a
                        href={assign.file_url}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition"
                      >
                        <Download size={13} /> Download Note
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium italic">No attachments</span>
                    )}
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

// Inline custom mini icons to save imports
function ClockIcon({ className }: { className: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}
