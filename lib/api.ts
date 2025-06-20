const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.tenantflow.com/api/v1'

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

    const response = await fetch(url, {
      ...options,
      headers
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`)
    }

    return response.json()
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

  // Clients endpoints
  async getClients() {
    return this.request('/clients')
  }

  async getClient(id: string) {
    return this.request(`/clients/${id}`)
  }

  async createClient(clientData: any) {
    return this.request('/clients', {
      method: 'POST',
      body: JSON.stringify(clientData)
    })
  }

  // Leads endpoints
  async getLeads() {
    return this.request('/leads')
  }

  async createLead(leadData: any) {
    return this.request('/leads', {
      method: 'POST',
      body: JSON.stringify(leadData)
    })
  }

  // Follow-ups endpoints
  async getFollowUps() {
    return this.request('/followUp')
  }

  async createFollowUp(followUpData: any) {
    return this.request('/followUp', {
      method: 'POST',
      body: JSON.stringify(followUpData)
    })
  }

  // Business endpoints
  async getBusiness() {
    return this.request('/business')
  }

  // Analytics endpoints
  async getAnalytics() {
    return this.request('/analytics')
  }

  async getDashboardStats() {
    return this.request('/analytics/dashboard')
  }

  // User endpoints
  async getUser() {
    return this.request('/user')
  }

  async updateUser(userData: any) {
    return this.request('/user', {
      method: 'PUT',
      body: JSON.stringify(userData)
    })
  }

  // Add a public method for custom requests
  async customRequest(endpoint: string, options: RequestInit = {}) {
    return this.request(endpoint, options);
  }
}

export const apiClient = new ApiClient(API_BASE_URL)