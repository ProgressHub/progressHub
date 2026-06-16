import { supabase } from '../lib/supabaseClient'
import { fetchStudentAttendance } from './attendanceService';

export const fetchStudentStats = async (userId) => {
  try {
    const { data: attendanceRecords } = await fetchStudentAttendance(userId)
    let attendancePercent = 0
    if (attendanceRecords && attendanceRecords.length > 0) {
      const presentCount = attendanceRecords.filter(r => r.status === 'present').length
      attendancePercent = Math.round((presentCount / attendanceRecords.length) * 100)
    }

    const { data, error } = await supabase
      .rpc('get_student_dashboard_stats')
    
    if (error) {
      console.error('RPC error:', error)
      return await fetchStudentStatsFallback(userId, attendancePercent)
    }
    
    return {
      data: {
        tasksPending: data?.pending_tasks || 0,
        upcomingAssignments: data?.upcoming_assignments || 0,
        attendancePercent: attendancePercent,
      },
      error: null,
    }
  } catch (error) {
    console.error('Stats error:', error)
    return await fetchStudentStatsFallback(userId)
  }
}

const fetchStudentStatsFallback = async (userId, attendancePercent = null) => {
  try {
    const { count: pendingCount, error: pendingError } = await supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'pending')

    if (pendingError) throw pendingError

    let upcomingCount = 0
    try {
      const { count, error } = await supabase
        .from('assignments')
        .select('id', { count: 'exact', head: true })
        .gt('deadline', new Date().toISOString())
      if (!error) upcomingCount = count || 0
    } catch (err) {
      console.log('Assignments table not ready yet')
    }

    let finalAttendancePercent = attendancePercent
    if (finalAttendancePercent === null) {
      const { data: attendanceRecords } = await fetchStudentAttendance(userId)
      finalAttendancePercent = 0
      if (attendanceRecords && attendanceRecords.length > 0) {
        const presentCount = attendanceRecords.filter(r => r.status === 'present').length
        finalAttendancePercent = Math.round((presentCount / attendanceRecords.length) * 100)
      }
    }

    return {
      data: {
        tasksPending: pendingCount || 0,
        upcomingAssignments: upcomingCount,
        attendancePercent: finalAttendancePercent,
      },
      error: null,
    }
  } catch (error) {
    console.error('Fallback stats error:', error)
    let fallbackAttendance = 0
    try {
      const { data: attendanceRecords } = await fetchStudentAttendance(userId)
      if (attendanceRecords && attendanceRecords.length > 0) {
        const presentCount = attendanceRecords.filter(r => r.status === 'present').length
        fallbackAttendance = Math.round((presentCount / attendanceRecords.length) * 100)
      }
    } catch (err) {
      console.error('Could not fetch attendance for fallback:', err)
    }
    
    return { 
      data: { 
        tasksPending: 0, 
        upcomingAssignments: 0, 
        attendancePercent: fallbackAttendance 
      }, 
      error 
    }
  }
}

export const fetchRecentTasks = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('id, title, subject, due_date, status')
      .eq('user_id', userId)
      .order('due_date', { ascending: true })
      .limit(5)

    if (error) throw error
    
    const formattedTasks = (data || []).map(task => ({
      id: task.id,
      title: task.title,
      subject: task.subject || 'General',
      due_date: task.due_date,
      status: task.status
    }))
    
    return { data: formattedTasks, error: null }
  } catch (error) {
    console.error('Recent tasks error:', error)
    return { data: [], error }
  }
}

export const fetchTasks = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('id, title, subject, due_date, status')
      .eq('user_id', userId)
      .order('due_date', { ascending: true })

    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Fetch tasks error:', error)
    return { data: [], error }
  }
}

export const createTask = async (userId, taskData) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        user_id: userId,
        title: taskData.title.trim(),
        subject: taskData.subject,
        due_date: taskData.due_date,
        status: 'pending',
      }])
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Create task error:', error)
    return { data: null, error }
  }
}

export const updateTaskStatus = async (taskId, status) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', taskId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Update task error:', error)
    return { data: null, error }
  }
}

export const deleteTask = async (taskId) => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Delete task error:', error)
    return { error }
  }
}