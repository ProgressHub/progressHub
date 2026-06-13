// src/services/quizService.js
import { supabase } from '../lib/supabaseClient'

export const fetchAllQuizzes = async () => {
  try {
    const { data, error } = await supabase
      .from('quizzes')
      .select('id, title, subject, created_at, questions(count)')
      .order('created_at', { ascending: false })
    return { data: data || [], error }
  } catch (error) {
    return { data: [], error }
  }
}

export const fetchTeacherQuizzes = async (teacherId) => {
  try {
    const { data, error } = await supabase
      .from('quizzes')
      .select('id, title, subject, created_at, questions(count)')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false })
    return { data: data || [], error }
  } catch (error) {
    return { data: [], error }
  }
}

export const getCompletedQuizIds = async (studentId) => {
  try {
    const { data, error } = await supabase
      .from('quiz_submissions')
      .select('quiz_id')
      .eq('student_id', studentId)
    
    if (error) throw error
    return { completedIds: data.map(sub => sub.quiz_id), error: null }
  } catch (error) {
    return { completedIds: [], error }
  }
}

export const fetchUnattemptedQuizzes = async (studentId) => {
  try {
    const { completedIds, error: completedError } = await getCompletedQuizIds(studentId)
    
    if (completedError) throw completedError
    
    let query = supabase
      .from('quizzes')
      .select('id, title, subject, created_at, questions(count)')
      .order('created_at', { ascending: false })
    
    if (completedIds.length > 0) {
      query = query.not('id', 'in', `(${completedIds.join(',')})`)
    }
    
    const { data, error } = await query
    return { data: data || [], error }
  } catch (error) {
    return { data: [], error }
  }
}

export const fetchQuizWithQuestions = async (quizId) => {
  try {
    const { data, error } = await supabase
      .from('quizzes')
      .select('id, title, subject, questions(id, question_text, options, correct_option, points)')
      .eq('id', quizId)
      .single()
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export const createFullQuiz = async (quizData, questions, teacherId) => {
  try {
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert([{
        title: quizData.title.trim(),
        subject: quizData.subject.trim(),
        teacher_id: teacherId,
      }])
      .select()
      .single()

    if (quizError) return { data: null, error: quizError }

    const questionsToInsert = questions.map(q => ({
      quiz_id: quiz.id,
      question_text: q.question_text.trim(),
      options: q.options,
      correct_option: q.correct_option,
      points: q.points || 1,
    }))

    const { error: questionsError } = await supabase
      .from('questions')
      .insert(questionsToInsert)

    if (questionsError) return { data: null, error: questionsError }

    return { data: quiz, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const submitScore = async (quizId, userId, score, totalQuestions) => {
  try {
    const { data, error } = await supabase
      .from('quiz_submissions')
      .insert([{
        quiz_id: quizId,
        student_id: userId,
        score,
        total_questions: totalQuestions,
      }])
      .select()
      .single()
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export const getStudentQuizScore = async (quizId, studentId) => {
  try {
    const { data, error } = await supabase
      .from('quiz_submissions')
      .select('score, total_questions, completed_at')
      .eq('quiz_id', quizId)
      .eq('student_id', studentId)
      .single()
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export const getCompletedQuizzesWithScores = async (studentId) => {
  try {
    const { data, error } = await supabase
      .from('quiz_submissions')
      .select(`
        quiz_id,
        score,
        total_questions,
        completed_at,
        quizzes:quiz_id (
          id,
          title,
          subject,
          created_at
        )
      `)
      .eq('student_id', studentId)
      .order('completed_at', { ascending: false })
    
    return { data: data || [], error }
  } catch (error) {
    return { data: [], error }
  }
}