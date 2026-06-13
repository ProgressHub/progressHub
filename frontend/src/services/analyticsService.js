// src/services/analyticsService.js
import { supabase } from '../lib/supabaseClient'

// ─── Student: Quiz Trends (Line Chart) ───────────────────────────────────────
export const getStudentQuizTrends = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('student_quiz_trends')
      .select('quiz_title, percentage, completed_at')
      .eq('student_id', user.id)
      .order('completed_at', { ascending: true })

    return { data: data || [], error }
  } catch (error) {
    return { data: [], error }
  }
}

// ─── Student: Attendance (Pie Chart) ─────────────────────────────────────────
export const getStudentAttendance = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('attendance')
      .select('status')
      .eq('student_id', user.id)

    if (error) return { data: [], error }

    const counts = { Present: 0, Absent: 0, Late: 0 }
    data.forEach(({ status }) => {
      const normalized = status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase()
      if (counts[normalized] !== undefined) counts[normalized]++
    })

    const pieData = [
      { name: 'Present', value: counts.Present },
      { name: 'Absent',  value: counts.Absent  },
      { name: 'Late',    value: counts.Late    },
    ]

    return { data: pieData, error: null }
  } catch (error) {
    return { data: [], error }
  }
}

// ─── Teacher: Global Stats (Summary Cards) ────────────────────────────────────
export const getTeacherGlobalStats = async () => {
  try {
    const { data, error } = await supabase
      .rpc('get_teacher_analytics')

    return { data: data || null, error }
  } catch (error) {
    return { data: null, error }
  }
}

// ─── Teacher: Quiz Performance Breakdown (Bar Chart) ─────────────────────────
export const getQuizPerformanceBreakdown = async () => {
  try {
    const { data, error } = await supabase
      .from('quiz_submissions')
      .select('score, total_questions, quizzes(title)')

    if (error) return { data: [], error }

    const quizMap = {}
    data.forEach(({ score, total_questions, quizzes }) => {
      const title = quizzes?.title || 'Unknown'
      const percentage = total_questions > 0
        ? Math.round((score / total_questions) * 100)
        : 0

      if (!quizMap[title]) quizMap[title] = { total: 0, count: 0 }
      quizMap[title].total += percentage
      quizMap[title].count += 1
    })

    const breakdown = Object.entries(quizMap).map(([quiz, { total, count }]) => ({
      quiz,
      avgScore: Math.round(total / count),
      count,
    }))

    return { data: breakdown, error: null }
  } catch (error) {
    return { data: [], error }
  }
}