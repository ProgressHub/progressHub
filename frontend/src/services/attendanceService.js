// src/services/attendanceService.js
import { supabase } from '../lib/supabaseClient'

export const fetchAllStudents = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'student')
    return { data: data || [], error }
  } catch (error) {
    return { data: [], error }
  }
}

export const bulkMarkAttendance = async (records) => {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .upsert(records, { onConflict: 'student_id,date,subject' })
      .select()
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export const fetchStudentAttendance = async (studentId) => {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('id, date, subject, status')
      .eq('student_id', studentId)
      .order('date', { ascending: false })
    return { data: data || [], error }
  } catch (error) {
    return { data: [], error }
  }
}