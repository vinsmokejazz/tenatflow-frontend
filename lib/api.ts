const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1'

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  setToken(token: string) {
    this.token = token
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers
    }

    console.log('API Request Debug:', {
      url,
      method: options.method || 'GET',
      hasToken: !!this.token,
      tokenLength: this.token?.length || 0,
      headers: {
        'Content-Type': headers['Content-Type'],
        'Authorization': headers['Authorization'] ? 'Bearer [TOKEN]' : 'None'
      }
    })

    try {
      console.log('API Request:', {
        url,
        method: options.method || 'GET',
        headers,
        body: options.body
      })

      const response = await fetch(url, {
        ...options,
        headers
      })

      console.log('API Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          url
        })
        throw new Error(`API Error: ${response.status} - ${errorData.message || errorData.error || response.statusText}`)
      }

      // Handle 204 No Content responses (common for DELETE operations)
      if (response.status === 204) {
        console.log('API Success: 204 No Content')
        return null
      }

      const data = await response.json()
      console.log('API Success:', { endpoint, data })
      return data
    } catch (error) {
      console.error('API Request failed:', {
        endpoint,
        error: error instanceof Error ? error.message : String(error),
        url
      })
      throw error
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
  }

  async register(userData: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  }

  async updatePassword(currentPassword: string, newPassword: string) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    })
  }

  // Clients endpoints
  async getClients() {
    return this.request('/clients')
  }

  async getClientLimitInfo() {
    return this.request('/clients/limit/info')
  }

  async getClient(id: string) {
    return this.request(`/clients/${id}`)
  }

  async createClient(data: any) {
    return this.request('/clients', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateClient(id: string, data: any) {
    return this.request(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteClient(id: string) {
    return this.request(`/clients/${id}`, {
      method: 'DELETE'
    })
  }

  // Leads endpoints
  async getLeads() {
    return this.request('/leads')
  }

  async getLead(id: string) {
    return this.request(`/leads/${id}`)
  }

  async createLead(leadData: any) {
    return this.request('/leads', {
      method: 'POST',
      body: JSON.stringify(leadData)
    })
  }

  async updateLead(id: string, leadData: any) {
    return this.request(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(leadData)
    })
  }

  async deleteLead(id: string) {
    return this.request(`/leads/${id}`, {
      method: 'DELETE'
    })
  }

  // Follow-ups endpoints
  async getFollowUps() {
    return this.request('/follow-ups')
  }

  async getFollowUp(id: string) {
    return this.request(`/follow-ups/${id}`)
  }

  async getDashboardTasks() {
    return this.request('/follow-ups/dashboard/tasks')
  }

  async createFollowUp(data: any) {
    return this.request('/follow-ups', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateFollowUp(id: string, followUpData: any) {
    return this.request(`/follow-ups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(followUpData)
    })
  }

  async deleteFollowUp(id: string) {
    return this.request(`/follow-ups/${id}`, {
      method: 'DELETE'
    })
  }

  // Business endpoints
  async getBusiness() {
    return this.request('/business')
  }

  // Analytics endpoints - these need businessId
  async getAnalytics() {
    return this.request('/analytics')
  }

  async getDashboardStats(businessId: string) {
    return this.request(`/analytics/dashboard/${businessId}`)
  }

  async getSalesPipeline(businessId: string) {
    return this.request(`/analytics/pipeline/${businessId}`)
  }

  async getLeadConversion(businessId: string) {
    return this.request(`/analytics/conversion/${businessId}`)
  }

  async getPredictions(businessId: string) {
    return this.request(`/analytics/predictions/${businessId}`)
  }

  // Deals endpoints
  async getDeals() {
    return this.request('/deals')
  }

  async getDeal(id: string) {
    return this.request(`/deals/${id}`)
  }

  async createDeal(dealData: any) {
    return this.request('/deals', {
      method: 'POST',
      body: JSON.stringify(dealData)
    })
  }

  async updateDeal(id: string, dealData: any) {
    return this.request(`/deals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dealData)
    })
  }

  async deleteDeal(id: string) {
    return this.request(`/deals/${id}`, {
      method: 'DELETE'
    })
  }

  // Reports endpoints
  async getReports() {
    return this.request('/reports')
  }

  async getReport(id: string) {
    return this.request(`/reports/${id}`)
  }

  async getReportData(id: string) {
    return this.request(`/reports/${id}/data`)
  }

  async createReport(reportData: any) {
    return this.request('/reports', {
      method: 'POST',
      body: JSON.stringify(reportData)
    })
  }

  async updateReport(id: string, reportData: any) {
    return this.request(`/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reportData)
    })
  }

  async deleteReport(id: string) {
    return this.request(`/reports/${id}`, {
      method: 'DELETE'
    })
  }

  // AI Insights endpoints
  async getAIInsights() {
    return this.request('/ai-insights')
  }

  async getAIInsight(type: string) {
    return this.request(`/ai-insights/${type}`)
  }

  // User Audit endpoints
  async getAuditLog() {
    return this.request('/user/audit-log')
  }

  async resendInvite(userId: string) {
    return this.request(`/user/${userId}/resend-invite`, {
      method: 'POST'
    })
  }

  // Contacts endpoints (same as clients)
  async getContacts() {
    return this.request('/clients')
  }

  async getContact(id: string) {
    return this.request(`/clients/${id}`)
  }

  async createContact(contactData: any) {
    return this.request('/clients', {
      method: 'POST',
      body: JSON.stringify(contactData)
    })
  }

  async updateContact(id: string, contactData: any) {
    return this.request(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contactData)
    })
  }

  async deleteContact(id: string) {
    return this.request(`/clients/${id}`, {
      method: 'DELETE'
    })
  }

  // User endpoints
  async getUser() {
    return this.request('/user/me')
  }

  async getUsers() {
    return this.request('/user')
  }

  async createUser(userData: any) {
    return this.request('/user', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  }

  async updateUser(userData: any) {
    return this.request('/user', {
      method: 'PUT',
      body: JSON.stringify(userData)
    })
  }

  async updateUserById(id: string, userData: any) {
    return this.request(`/user/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    })
  }

  async deleteUser(id: string) {
    return this.request(`/user/${id}`, {
      method: 'DELETE'
    })
  }

  // Add a public method for custom requests
  async customRequest(endpoint: string, options: RequestInit = {}) {
    return this.request(endpoint, options);
  }

  // Get client details with leads, follow-ups, and deals
  async getClientDetails(clientId: string) {
    return this.request(`/clients/${clientId}/details`);
  }
}

export const apiClient = new ApiClient(API_BASE_URL)