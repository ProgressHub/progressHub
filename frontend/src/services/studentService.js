import { supabase } from '../lib/supabaseClient'

export const fetchStudentStats = async (userId) => {
  try {
    const { data, error } = await supabase
      .rpc('get_student_dashboard_stats')
    
    if (error) {
      console.error('RPC error:', error)
      return await fetchStudentStatsFallback(userId)
    }
    
    return {
      data: {
        tasksPending: data?.pending_tasks || 0,
        upcomingAssignments: data?.upcoming_assignments || 0,
        attendancePercent: data?.attendance_rate || 0,
      },
      error: null,
    }
  } catch (error) {
    console.error('Stats error:', error)
    return await fetchStudentStatsFallback(userId)
  }
}

const fetchStudentStatsFallback = async (userId) => {
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

    // ── Real attendance calculation ──
    let attendancePercent = 0
    try {
      const { data: attData, error: attError } = await supabase
        .from('attendance')
        .select('status')
        .eq('student_id', userId)

      if (!attError && attData?.length > 0) {
        const presentCount = attData.filter(a =>
          a.status?.toLowerCase() === 'present'
        ).length
        attendancePercent = Math.round((presentCount / attData.length) * 100)
      }
    } catch (err) {
      console.log('Attendance fetch error:', err)
    }

    return {
      data: {
        tasksPending: pendingCount || 0,
        upcomingAssignments: upcomingCount,
        attendancePercent,
      },
      error: null,
    }
  } catch (error) {
    console.error('Fallback stats error:', error)
    return {
      data: {
        tasksPending: 0,
        upcomingAssignments: 0,
        attendancePercent: 0
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