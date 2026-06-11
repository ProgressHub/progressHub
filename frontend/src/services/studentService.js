// src/services/studentService.js
import { supabase } from '../lib/supabaseClient'

export const fetchStudentStats = async (userId) => {
  try {
    const [tasksRes, assignmentsRes, attendanceRes] = await Promise.all([
      supabase
        .from('tasks')
        .select('id', { count: 'exact' })
        .eq('student_id', userId)
        .eq('status', 'pending'),

      supabase
        .from('assignments')
        .select('id', { count: 'exact' })
        .eq('student_id', userId)
        .gt('due_date', new Date().toISOString()),

      supabase
        .from('attendance')
        .select('status')
        .eq('student_id', userId),
    ])

    const totalAttendance = attendanceRes.data?.length || 0
    const presentCount = attendanceRes.data?.filter(a => a.status === 'present').length || 0
    const attendancePercent = totalAttendance > 0
      ? Math.round((presentCount / totalAttendance) * 100)
      : 0

    return {
      data: {
        tasksPending: tasksRes.count || 0,
        upcomingAssignments: assignmentsRes.count || 0,
        attendancePercent,
      },
      error: null,
    }
  } catch (error) {
    return { data: null, error }
  }
}

export const fetchRecentTasks = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('id, title, subject, due_date, status')
      .eq('student_id', userId)
      .order('due_date', { ascending: true })
      .limit(5)

    return { data: data || [], error }
  } catch (error) {
    return { data: [], error }
  }
}