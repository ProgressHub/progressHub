/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { dbService } from '../services/db';
import { Quiz, QuizQuestion, QuizAttempt, Profile, Class } from '../types';
import { Clock, HelpCircle, AlertCircle, Sparkles, Plus, Play, Trophy, ListCollapse, CheckCircle2, XCircle } from 'lucide-react';

interface QuizModuleProps {
  currentUser: Profile;
}

export default function QuizModule({ currentUser }: QuizModuleProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const isTeacher = currentUser.role === 'teacher';

  // Classes list for teachers
  const [classes, setClasses] = useState<Class[]>([]);
  const [targetClassId, setTargetClassId] = useState('');

  // Active Quiz taking engine states (For Student)
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [completedAttempt, setCompletedAttempt] = useState<QuizAttempt | null>(null);

  // Timer Ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Teacher Quiz Form State
  const [quizTitle, setQuizTitle] = useState('');
  const [quizSubject, setQuizSubject] = useState('Mathematics');
  const [quizDuration, setQuizDuration] = useState(15);
  
  // Custom Dynamic List of Questions for creation
  const [questionsCreator, setQuestionsCreator] = useState<Omit<QuizQuestion, 'id' | 'quiz_id'>[]>([
    { question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A' }
  ]);
  const [creatingSuccess, setCreatingSuccess] = useState(false);

  useEffect(() => {
    fetchQuizzes();
    if (isTeacher) {
      dbService.getClasses().then(cls => {
        setClasses(cls);
        if (cls.length > 0) {
          setTargetClassId(cls[0].id);
        }
      }).catch(err => console.error(err));
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const data = await dbService.getQuizzes(currentUser.role === 'student' ? currentUser.class_id : undefined);
      setQuizzes(data);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- TEACHER ACTIONS ---
  const handleAddQuestionField = () => {
    setQuestionsCreator([
      ...questionsCreator,
      { question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A' }
    ]);
  };

  const handleRemoveQuestionField = (idx: number) => {
    if (questionsCreator.length === 1) return;
    setQuestionsCreator(questionsCreator.filter((_, i) => i !== idx));
  };

  const handleQuestionFieldChange = (idx: number, field: keyof Omit<QuizQuestion, 'id' | 'quiz_id'>, value: string) => {
    const updated = [...questionsCreator];
    updated[idx] = {
      ...updated[idx],
      [field]: value
    } as any;
    setQuestionsCreator(updated);
  };

  const handleCreateNewQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle.trim() || questionsCreator.some(q => !q.question.trim())) return;

    try {
      setLoading(true);
      setCreatingSuccess(false);

      await dbService.createQuiz({
        teacher_id: currentUser.id,
        title: quizTitle,
        subject: quizSubject,
        duration_minutes: Number(quizDuration),
        class_id: targetClassId || undefined
      }, questionsCreator);

      setQuizTitle('');
      setQuizSubject('Mathematics');
      setQuizDuration(15);
      setQuestionsCreator([{ question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A' }]);
      setCreatingSuccess(true);
      
      await fetchQuizzes();
      setTimeout(() => setCreatingSuccess(false), 4500);
    } catch (err) {
      console.error('Creating quiz failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- STUDENT ACTIONS: TAKING THE MCQ QUIZ ---
  const startQuiz = async (quiz: Quiz) => {
    try {
      setLoading(true);
      const questions = await dbService.getQuizQuestions(quiz.id);
      if (questions.length === 0) {
        alert('This quiz does not have any questions registered yet. Ask the teacher to add items!');
        return;
      }
      setQuizQuestions(questions);
      setActiveQuiz(quiz);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setCompletedAttempt(null);
      setTimeRemaining(quiz.duration_minutes * 60);

      // Setup clean timer interval
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            autoSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Failed booting quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (questionId: string, choice: 'A' | 'B' | 'C' | 'D') => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: choice
    }));
  };

  const autoSubmitQuiz = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    handleSubmitQuizAnswers();
  };

  const handleSubmitQuizAnswers = async () => {
    if (!activeQuiz) return;
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      setQuizSubmitting(true);
      
      // Auto Grade Logic
      let correctCount = 0;
      quizQuestions.forEach((q) => {
        const studentChoice = selectedAnswers[q.id];
        if (studentChoice === q.correct_answer) {
          correctCount++;
        }
      });

      const scorePercent = quizQuestions.length > 0 
        ? Math.round((correctCount / quizQuestions.length) * 100) 
        : 0;

      const attempt = await dbService.submitQuizAttempt(activeQuiz.id, currentUser.id, scorePercent);
      setCompletedAttempt(attempt);
    } catch (err) {
      console.error('Quiz submission failed:', err);
    } finally {
      setQuizSubmitting(false);
    }
  };

  const closeQuizResultView = () => {
    setActiveQuiz(null);
    setQuizQuestions([]);
    setCompletedAttempt(null);
    setSelectedAnswers({});
    fetchQuizzes();
  };

  const minutesRemaining = Math.floor(timeRemaining / 60);
  const secondsRemaining = timeRemaining % 60;

  return (
    <div id="quiz_module_root" className="space-y-6">
      
      {/* 1. QUIZ TAKER INTERFACE (STUDENT - FULL EXAM ATMOSPHERE OVERLAY) */}
      {activeQuiz && (
        <div className="bg-white p-6 rounded-2xl border border-slate-105 shadow-md max-w-4xl mx-auto">
          
          {/* Header Status Bar with running Countdown Clock */}
          <div className="pb-4 mb-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-bold uppercase tracking-wider">{activeQuiz.subject}</span>
              <h3 className="text-lg font-black text-slate-800 mt-1.5 leading-tight">{activeQuiz.title}</h3>
            </div>

            {/* Countdown Clock (Highlights Red if < 1.5 minutes) */}
            {!completedAttempt && (
              <div className={`p-3 rounded-xl flex items-center gap-2 border font-mono text-base font-extrabold ${
                timeRemaining < 90
                  ? 'bg-red-50 text-red-650 border-red-200 animate-pulse'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-100'
              }`}>
                <Clock size={18} />
                <span>Timer: {String(minutesRemaining).padStart(2, '0')}:{String(secondsRemaining).padStart(2, '0')}</span>
              </div>
            )}
          </div>

          {/* QUIZ ACTIVE SCREEN */}
          {!completedAttempt ? (
            <div className="space-y-6">
              
              {/* Question Navigation Rail */}
              <div className="flex flex-wrap items-center gap-1.5">
                {quizQuestions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                      idx === currentQuestionIndex 
                        ? 'bg-indigo-655 text-white font-heavy scale-105' 
                        : selectedAnswers[quizQuestions[idx].id] 
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-150' 
                        : 'bg-slate-100/70 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              {/* Active Question Panel */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div className="flex gap-2.5">
                  <span className="text-xs bg-indigo-600 text-white font-black px-2 py-0.5 rounded h-fit">Q-{currentQuestionIndex + 1}</span>
                  <p className="text-sm font-bold text-slate-800 leading-relaxed">
                    {quizQuestions[currentQuestionIndex]?.question}
                  </p>
                </div>

                {/* Option MCQs choices list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-6">
                  {['A', 'B', 'C', 'D'].map((opt) => {
                    const fieldKey = `option_${opt.toLowerCase()}` as keyof QuizQuestion;
                    const text = quizQuestions[currentQuestionIndex]?.[fieldKey] as string;
                    const isSelected = selectedAnswers[quizQuestions[currentQuestionIndex]?.id] === opt;

                    return (
                      <button
                        key={opt}
                        onClick={() => selectAnswer(quizQuestions[currentQuestionIndex].id, opt as any)}
                        className={`p-4 rounded-xl border text-left text-sm font-semibold transition-all flex items-center justify-between group ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-650 text-white'
                            : 'bg-white border-slate-100 text-slate-700 hover:border-indigo-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center border transition-all ${
                            isSelected 
                              ? 'bg-white/20 border-white/45 text-white' 
                              : 'bg-slate-50 border-slate-200 text-slate-500 group-hover:border-indigo-300'
                          }`}>
                            {opt}
                          </span>
                          <span>{text}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Controls bar */}
              <div className="flex items-center justify-between border-t border-slate-50 pt-5 mt-6">
                <button
                  type="button"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                  className="px-4 py-2 text-xs font-bold border border-slate-200 text-slate-605 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40"
                >
                  Previous Question
                </button>

                <div className="flex items-center gap-3">
                  {currentQuestionIndex < quizQuestions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                      className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                      Next Question
                    </button>
                  ) : (
                    <button
                      type="button"
                      id="submit_quiz_answers_btn"
                      onClick={handleSubmitQuizAnswers}
                      disabled={quizSubmitting}
                      className="px-6 py-2 bg-indigo-650 text-white rounded-lg font-bold text-sm shadow hover:bg-indigo-700 transition"
                    >
                      {quizSubmitting ? 'Evaluating...' : 'Complete & Submit Quiz'}
                    </button>
                  )}
                </div>
              </div>

            </div>
          ) : (
            /* SUBMISSION / EVALUATION SHEET RESULT CARD */
            <div className="text-center py-8 space-y-6">
              <div className="max-w-md mx-auto bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <Trophy size={48} className="text-amber-500 mx-auto mb-3" />
                <h4 className="text-lg font-black text-slate-800">Exam Grading Statement</h4>
                <p className="text-xs text-slate-400 font-medium">Auto graded • Standard evaluation algorithm</p>

                <div className="mt-6 flex justify-center items-baseline gap-1">
                  <span className={`text-4xl font-black ${completedAttempt.score >= 80 ? 'text-emerald-600' : completedAttempt.score >= 55 ? 'text-amber-600' : 'text-rose-600'}`}>
                    {completedAttempt.score}%
                  </span>
                  <span className="text-slate-400 text-sm font-semibold">Grade</span>
                </div>

                <div className="mt-4 text-xs text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">
                  {completedAttempt.score >= 80 ? 'Superb! You demonstrate comprehensive mastering of this subject matter.' :
                   completedAttempt.score >= 60 ? 'Satisfactory attempt. Review topics you missed to reinforce your grade.' :
                   'Needs study. Consult the teacher for supplementary note readings.'}
                </div>
              </div>

              {/* Individual Question Correction Key */}
              <div className="max-w-2xl mx-auto space-y-3.5 text-left pt-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ListCollapse size={14} /> Comprehensive Correction Keys
                </h4>

                {quizQuestions.map((q, idx) => {
                  const selection = selectedAnswers[q.id];
                  const isCorrect = selection === q.correct_answer;
                  const correctText = q[`option_${q.correct_answer.toLowerCase()}` as keyof QuizQuestion] as string;

                  return (
                    <div key={q.id} className="p-4 rounded-xl border border-slate-100 bg-slate-55 flex items-start gap-3">
                      {isCorrect ? (
                        <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                      ) : (
                        <XCircle className="text-rose-500 shrink-0 mt-0.5" size={18} />
                      )}
                      <div>
                        <p className="text-sm font-bold text-slate-800"><span className="text-slate-400 font-bold mr-1">Q{idx + 1}.</span> {q.question}</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs">
                          <span className={`${isCorrect ? 'text-emerald-650' : 'text-rose-650'} font-bold`}>
                            Your response: {selection || 'None'}
                          </span>
                          {!isCorrect && (
                            <span className="text-slate-500 font-medium">
                              Correct option: <span className="font-bold underline">{q.correct_answer}</span> ({correctText})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={closeQuizResultView}
                  className="px-6 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow transition"
                >
                  Return to Quizzes Dashboard
                </button>
              </div>

            </div>
          )}

        </div>
      )}

      {/* 2. MAIN REGULAR DASHBOARD VIEW (QUIZ PUBLISHED SHEEETS LIST) */}
      {!activeQuiz && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* TEACHER CREATOR COLUMN */}
          {isTeacher && (
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm h-fit space-y-4">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Plus size={20} className="text-indigo-600" />
                Build Interactive Pop Quiz
              </h3>

              <form onSubmit={handleCreateNewQuiz} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Classroom Assignment</label>
                  <select
                    value={targetClassId}
                    onChange={(e) => setTargetClassId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-750 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name} - {c.section}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Subject Category</label>
                  <select
                    value={quizSubject}
                    onChange={(e) => setQuizSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-750 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    {['Mathematics', 'Chemistry', 'Physics', 'English', 'History', 'Biology', 'General'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Quiz Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Organic Chemistry Naming Rules"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-750 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">Completeness Cap (Duration in Mins)</label>
                  <input
                    type="number"
                    required
                    min={5}
                    max={120}
                    value={quizDuration}
                    onChange={(e) => setQuizDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-750 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
                  />
                </div>

                {/* DYNAMIC MCQ BUILDER ROWS */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <HelpCircle size={13} />
                      Sequence Questions ({questionsCreator.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleAddQuestionField}
                      className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
                    >
                      + Add Question
                    </button>
                  </div>

                  <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                    {questionsCreator.map((q, idx) => (
                      <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-100 outline outline-1 outline-slate-200/50 space-y-2 text-xs relative">
                        {questionsCreator.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestionField(idx)}
                            className="absolute top-2 right-2 text-slate-450 hover:text-red-500 font-bold cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                        <p className="font-bold text-slate-500 uppercase tracking-wider">Item #{idx + 1}</p>
                        
                        <input
                          type="text"
                          required
                          placeholder="Write question..."
                          value={q.question}
                          onChange={(e) => handleQuestionFieldChange(idx, 'question', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-850"
                        />
                        
                        <div className="grid grid-cols-2 gap-1.5">
                          <input
                            type="text"
                            required
                            placeholder="Option A"
                            value={q.option_a}
                            onChange={(e) => handleQuestionFieldChange(idx, 'option_a', e.target.value)}
                            className="px-2 py-1 bg-white border border-slate-200 rounded text-[11px]"
                          />
                          <input
                            type="text"
                            required
                            placeholder="Option B"
                            value={q.option_b}
                            onChange={(e) => handleQuestionFieldChange(idx, 'option_b', e.target.value)}
                            className="px-2 py-1 bg-white border border-slate-200 rounded text-[11px]"
                          />
                          <input
                            type="text"
                            required
                            placeholder="Option C"
                            value={q.option_c}
                            onChange={(e) => handleQuestionFieldChange(idx, 'option_c', e.target.value)}
                            className="px-2 py-1 bg-white border border-slate-200 rounded text-[11px]"
                          />
                          <input
                            type="text"
                            required
                            placeholder="Option D"
                            value={q.option_d}
                            onChange={(e) => handleQuestionFieldChange(idx, 'option_d', e.target.value)}
                            className="px-2 py-1 bg-white border border-slate-200 rounded text-[11px]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">CORRECT RESPONSE</label>
                          <select
                            value={q.correct_answer}
                            onChange={(e) => handleQuestionFieldChange(idx, 'correct_answer', e.target.value)}
                            className="px-2 py-1 bg-white border border-slate-200 rounded text-[11px]"
                          >
                            <option value="A">Choice A</option>
                            <option value="B">Choice B</option>
                            <option value="C">Choice C</option>
                            <option value="D">Choice D</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {creatingSuccess && (
                  <div className="bg-emerald-50 text-emerald-800 p-2.5 border border-emerald-100 rounded-lg text-xs font-semibold flex items-center gap-1 leading-snug">
                    <Sparkles size={14} className="text-emerald-500 shrink-0" /> MCQ quiz published and pushed to students!
                  </div>
                )}

                <button
                  type="submit"
                  id="submit_quiz_btn"
                  className="w-full py-2.5 bg-indigo-650 text-white hover:bg-indigo-700 font-bold rounded-xl text-sm transition cursor-pointer"
                >
                  Generate & Publish Quiz
                </button>
              </form>
            </div>
          )}

          {/* LIST OF EXAMS AVAILABLE CONTAINER */}
          <div className={isTeacher ? 'lg:col-span-2 space-y-4' : 'lg:col-span-3 space-y-4'}>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider">Evaluation Boards</span>
              <span className="text-xs text-indigo-700 font-bold">{quizzes.length} Exercises Published</span>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin h-7 w-7 border-2 border-indigo-500 border-t-transparent rounded-full" />
              </div>
            ) : quizzes.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-100 flex flex-col items-center justify-center">
                <HelpCircle size={40} className="text-slate-300 mb-2" />
                <p className="text-slate-500 font-bold">No registered assessments found.</p>
                <p className="text-slate-400 text-xs mt-0.5">Teachers can establish standard electronic quizzes here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quizzes.map((q) => (
                  <div
                    key={q.id}
                    className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:border-indigo-150 transition hover:shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full uppercase tracking-wide">
                        {q.subject}
                      </span>
                      <h4 className="text-base font-bold text-slate-800 mt-2 tracking-tight leading-snug">{q.title}</h4>
                      <p className="text-xs font-semibold text-slate-400 mt-1 flex items-center gap-1.5">
                        <Clock size={13} />
                        Duration: {q.duration_minutes} minutes
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100/70 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium">Auto graded MCQ</span>
                      {!isTeacher ? (
                        <button
                          type="button"
                          onClick={() => startQuiz(q)}
                          className="bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
                        >
                          <Play size={11} strokeWidth={3} /> Start Quiz
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-bold italic">Active</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
