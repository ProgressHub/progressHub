// src/services/assignmentService.js
import { supabase } from '../lib/supabaseClient'

export const fetchAssignments = async () => {
  try {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .order('created_at', { ascending: false })
    return { data: data || [], error }
  } catch (error) {
    return { data: [], error }
  }
}

export const fetchAssignmentById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export const fetchTeacherDashboardStats = async () => {
  try {
    const { data, error } = await supabase.rpc('get_teacher_dashboard_stats')
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export const createAssignment = async (assignmentData, file) => {
  try {
    let file_url = null

    if (file) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('assignment-files')
        .upload(fileName, file)

      if (uploadError) return { data: null, error: uploadError }

      const { data: urlData } = supabase.storage
        .from('assignment-files')
        .getPublicUrl(fileName)

      file_url = urlData.publicUrl
    }

    const { data, error } = await supabase
      .from('assignments')
      .insert([{
        title: assignmentData.title.trim(),
        subject: assignmentData.subject.trim(),
        deadline: assignmentData.deadline,
        description: assignmentData.description.trim(),
        file_url,
        created_by: assignmentData.created_by,
      }])
      .select()
      .single()

    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export const updateAssignment = async (id, assignmentData) => {
  try {
    const { data, error } = await supabase
      .from('assignments')
      .update({
        title: assignmentData.title.trim(),
        subject: assignmentData.subject.trim(),
        deadline: assignmentData.deadline,
        description: assignmentData.description.trim(),
      })
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export const deleteAssignment = async (id) => {
  try {
    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('id', id)
    return { error }
  } catch (error) {
    return { error }
  }
}