import { supabase } from './supabase'

// ==================== LEADS OPERATIONS ====================

export const leadsService = {
  // Get all leads
  async getAll() {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get lead by ID
  async getById(id) {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Create new lead
  async create(leadData) {
    const { data, error } = await supabase
      .from('leads')
      .insert([leadData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update lead
  async update(id, leadData) {
    const { data, error } = await supabase
      .from('leads')
      .update({ ...leadData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete lead
  async delete(id) {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Get leads by status
  async getByStatus(status) {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Search leads
  async search(searchTerm) {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
}

// ==================== LEAD ACTIVITIES OPERATIONS ====================

export const activitiesService = {
  // Get activities for a lead
  async getByLeadId(leadId) {
    const { data, error } = await supabase
      .from('lead_activities')
      .select('*')
      .eq('lead_id', leadId)
      .order('activity_date', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Create new activity
  async create(activityData) {
    const { data, error } = await supabase
      .from('lead_activities')
      .insert([activityData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get all activities (for dashboard)
  async getAll(limit = 50) {
    const { data, error } = await supabase
      .from('lead_activities')
      .select(`
        *,
        leads (
          name,
          email,
          company
        )
      `)
      .order('activity_date', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  }
}

// ==================== ADS SPEND OPERATIONS ====================

export const adsSpendService = {
  // Get all ads spend data
  async getAll() {
    const { data, error } = await supabase
      .from('ads_spend')
      .select('*')
      .order('spend_date', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Create new ads spend record
  async create(adsData) {
    const { data, error } = await supabase
      .from('ads_spend')
      .insert([adsData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get ads spend by date range
  async getByDateRange(startDate, endDate) {
    const { data, error } = await supabase
      .from('ads_spend')
      .select('*')
      .gte('spend_date', startDate)
      .lte('spend_date', endDate)
      .order('spend_date', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get summary statistics
  async getSummary() {
    const { data, error } = await supabase
      .from('ads_spend')
      .select('platform, spend_amount, leads_generated, conversions')
    
    if (error) throw error
    
    // Calculate totals
    const summary = data.reduce((acc, record) => {
      acc.totalSpend += parseFloat(record.spend_amount || 0)
      acc.totalLeads += parseInt(record.leads_generated || 0)
      acc.totalConversions += parseInt(record.conversions || 0)
      return acc
    }, { totalSpend: 0, totalLeads: 0, totalConversions: 0 })
    
    return {
      ...summary,
      costPerLead: summary.totalLeads > 0 ? summary.totalSpend / summary.totalLeads : 0,
      conversionRate: summary.totalLeads > 0 ? (summary.totalConversions / summary.totalLeads) * 100 : 0
    }
  }
}

// ==================== DASHBOARD STATISTICS ====================

export const dashboardService = {
  // Get dashboard statistics
  async getStats() {
    try {
      // Get leads count by status
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('status')
      
      if (leadsError) throw leadsError

      // Get recent activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('lead_activities')
        .select('*')
        .order('activity_date', { ascending: false })
        .limit(5)
      
      if (activitiesError) throw activitiesError

      // Calculate stats
      const statusCounts = leadsData.reduce((acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1
        return acc
      }, {})

      return {
        totalLeads: leadsData.length,
        newLeads: statusCounts.new || 0,
        qualifiedLeads: statusCounts.qualified || 0,
        convertedLeads: statusCounts.converted || 0,
        recentActivities: activitiesData
      }
    } catch (error) {
      throw error
    }
  }
}