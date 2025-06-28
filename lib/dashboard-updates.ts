// Utility function to notify dashboard of data changes
export function notifyDashboardUpdate(type?: string, details?: any) {
  if (typeof window !== 'undefined') {
    const key = `dashboard-update-${Date.now()}`;
    const data = {
      timestamp: Date.now(),
      type: type || 'general',
      source: 'app',
      details: details || {}
    };
    localStorage.setItem(key, JSON.stringify(data));
    
    // Clean up old keys (keep only last 10)
    const keys = Object.keys(localStorage).filter(k => k.startsWith('dashboard-update-'));
    if (keys.length > 10) {
      keys.sort().slice(0, keys.length - 10).forEach(k => localStorage.removeItem(k));
    }
    
    console.log('Dashboard update notified:', data);
  }
}

// Specific update types
export const DashboardUpdateTypes = {
  LEAD_CREATED: 'lead_created',
  LEAD_UPDATED: 'lead_updated',
  LEAD_DELETED: 'lead_deleted',
  CLIENT_CREATED: 'client_created',
  CLIENT_UPDATED: 'client_updated',
  CLIENT_DELETED: 'client_deleted',
  FOLLOWUP_CREATED: 'followup_created',
  FOLLOWUP_UPDATED: 'followup_updated',
  FOLLOWUP_DELETED: 'followup_deleted',
  DEAL_CREATED: 'deal_created',
  DEAL_UPDATED: 'deal_updated',
  DEAL_DELETED: 'deal_deleted',
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
  USER_DELETED: 'user_deleted',
  SUBSCRIPTION_CHANGED: 'subscription_changed',
  ANALYTICS_UPDATED: 'analytics_updated',
  DATA_REFRESH: 'data_refresh'
} as const;

// Helper functions for specific update types
export const dashboardUpdates = {
  onLeadChange: (action: 'created' | 'updated' | 'deleted' = 'created', details?: any) => 
    notifyDashboardUpdate(DashboardUpdateTypes[`LEAD_${action.toUpperCase()}` as keyof typeof DashboardUpdateTypes], details),
  onClientChange: (action: 'created' | 'updated' | 'deleted' = 'created', details?: any) => 
    notifyDashboardUpdate(DashboardUpdateTypes[`CLIENT_${action.toUpperCase()}` as keyof typeof DashboardUpdateTypes], details),
  onFollowUpChange: (action: 'created' | 'updated' | 'deleted' = 'created', details?: any) => 
    notifyDashboardUpdate(DashboardUpdateTypes[`FOLLOWUP_${action.toUpperCase()}` as keyof typeof DashboardUpdateTypes], details),
  onDealChange: (action: 'created' | 'updated' | 'deleted' = 'created', details?: any) => 
    notifyDashboardUpdate(DashboardUpdateTypes[`DEAL_${action.toUpperCase()}` as keyof typeof DashboardUpdateTypes], details),
  onUserChange: (action: 'created' | 'updated' | 'deleted' = 'created', details?: any) => 
    notifyDashboardUpdate(DashboardUpdateTypes[`USER_${action.toUpperCase()}` as keyof typeof DashboardUpdateTypes], details),
  onSubscriptionChange: (details?: any) => 
    notifyDashboardUpdate(DashboardUpdateTypes.SUBSCRIPTION_CHANGED, details),
  onAnalyticsUpdate: (details?: any) => 
    notifyDashboardUpdate(DashboardUpdateTypes.ANALYTICS_UPDATED, details),
  onDataRefresh: (details?: any) => 
    notifyDashboardUpdate(DashboardUpdateTypes.DATA_REFRESH, details),
  onGeneralUpdate: (details?: any) => 
    notifyDashboardUpdate('general', details)
}; 