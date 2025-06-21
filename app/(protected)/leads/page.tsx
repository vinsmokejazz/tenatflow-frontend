'use client';

import React from 'react';
import { Target, Users, Edit, Trash2, Plus, Eye, Calendar, TrendingUp, CheckCircle, Clock, XCircle, User, Search, Phone } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';

const LeadsPage: React.FC = () => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [leads, setLeads] = React.useState<any[]>([]);
  const [clients, setClients] = React.useState<any[]>([]);
  const [staff, setStaff] = React.useState<any[]>([]);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editLead, setEditLead] = React.useState<any | null>(null);
  const [form, setForm] = React.useState<{ status: string; notes: string; clientId: string; assignedTo?: string }>({ status: 'new', notes: '', clientId: '' });
  const [formLoading, setFormLoading] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const { toast } = useToast();
  const { backendUser, hasRole } = useAuth();

  // Fetch leads, clients, and staff (if admin)
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [leadsData, clientsData, staffData] = await Promise.all([
        apiClient.getLeads(),
        apiClient.getClients(),
        hasRole('admin') ? apiClient.getUsers() : Promise.resolve([])
      ]);
      setLeads(leadsData || []);
      setClients(clientsData || []);
      setStaff(staffData || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    }
    setLoading(false);
  };

  React.useEffect(() => { 
    if (backendUser) {
      fetchData(); 
    }
  }, [backendUser]);

  // Open Add modal
  const openAddModal = () => {
    setEditLead(null);
    setForm({ status: 'new', notes: '', clientId: '', assignedTo: 'unassigned' });
    setFormError(null);
    setModalOpen(true);
  };

  // Open Edit modal
  const openEditModal = (lead: any) => {
    setEditLead(lead);
    setForm({ 
      status: lead.status, 
      notes: lead.notes || '', 
      clientId: lead.clientId,
      assignedTo: lead.assignedTo || 'unassigned'
    });
    setFormError(null);
    setModalOpen(true);
  };

  // Handle form change
  const handleFormChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  // Handle form submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    console.log('=== LEAD FORM SUBMISSION STARTED ===');
    e.preventDefault();
    console.log('Form submission started');
    console.log('Form data:', form);
    console.log('User role:', hasRole('admin') ? 'admin' : 'staff');
    
    setFormLoading(true);
    setFormError(null);
    try {
      if (!form.clientId) {
        setFormError('Client is required.');
        setFormLoading(false);
        return;
      }
      // Only send assignedTo if admin, and convert 'unassigned' to undefined
      const payload = { ...form };
      if (!hasRole('admin')) {
        delete payload.assignedTo;
      } else {
        if (payload.assignedTo === 'unassigned') {
          payload.assignedTo = undefined;
        } else {
          payload.assignedTo = payload.assignedTo;
        }
      }
      
      console.log('Payload being sent to API:', payload);
      
      if (editLead) {
        console.log('Updating lead with ID:', editLead.id);
        const updatedLead = await apiClient.updateLead(editLead.id, payload);
        console.log('Updated lead response:', updatedLead);
        console.log('Updated lead assignedTo:', updatedLead.assignedTo);
        console.log('Updated lead assignedUser:', updatedLead.assignedUser);
        
        setLeads(prevLeads => 
          prevLeads.map(lead => 
            lead.id === editLead.id ? updatedLead : lead
          )
        );
        toast({ title: 'Lead updated', description: 'Lead updated successfully.' });
      } else {
        console.log('Creating new lead');
        const newLead = await apiClient.createLead(payload);
        console.log('Created lead response:', newLead);
        console.log('Created lead assignedTo:', newLead.assignedTo);
        console.log('Created lead assignedUser:', newLead.assignedUser);
        
        setLeads(prevLeads => [newLead, ...prevLeads]);
        toast({ title: 'Lead created', description: 'Lead created successfully.' });
      }
      setModalOpen(false);
    } catch (err: any) {
      console.error('Error in form submission:', err);
      setFormError(err.message || 'Failed to save lead');
    }
    setFormLoading(false);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await apiClient.deleteLead(deleteId);
      // Immediately update local state for better UX
      setLeads(prevLeads => prevLeads.filter(lead => lead.id !== deleteId));
      setDeleteId(null);
      toast({ title: 'Deleted', description: 'Lead deleted successfully.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete lead.', variant: 'destructive' });
    }
    setDeleteLoading(false);
  };

  // Filter leads based on user role
  const getFilteredLeads = () => {
    let filtered = leads;
    
    // Staff only see their assigned leads
    if (hasRole('staff')) {
      filtered = leads.filter(lead => lead.assignedTo === backendUser?.id);
    }
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(lead => {
        const clientName = lead.client?.name || '';
        const notes = lead.notes || '';
        const assignedStaffName = lead.assignedUser?.name || (lead.assignedTo ? staff.find(s => s.id === lead.assignedTo)?.name : '') || 'Unassigned';
        return (
          clientName.toLowerCase().includes(searchLower) ||
          lead.status.toLowerCase().includes(searchLower) ||
          notes.toLowerCase().includes(searchLower) ||
          assignedStaffName.toLowerCase().includes(searchLower)
        );
      });
    }
    
    return filtered;
  };

  const filteredLeads = getFilteredLeads();

  // Calculate statistics based on filtered leads
  const totalLeads = filteredLeads.length;
  const leadsByStatus = filteredLeads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const newLeads = leadsByStatus.new || 0;
  const contactedLeads = leadsByStatus.contacted || 0;
  const qualifiedLeads = leadsByStatus.qualified || 0;
  const lostLeads = leadsByStatus.lost || 0;

  // Get status badge color
  const getStatusBadge = (status: string) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || colors.new;
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    const icons = {
      new: Clock,
      contacted: TrendingUp,
      qualified: CheckCircle,
      lost: XCircle
    };
    return icons[status as keyof typeof icons] || Clock;
  };

  // Get assigned staff name
  const getAssignedStaffName = (assignedTo: string | null, assignedUser?: any) => {
    if (!assignedTo || assignedTo === 'unassigned') return 'Unassigned';
    // Use assignedUser data from API response if available
    if (assignedUser) {
      return assignedUser.name || 'Unknown Staff';
    }
    // Fallback to local staff array lookup
    const staffMember = staff.find(s => s.id === assignedTo);
    return staffMember?.name || 'Unknown Staff';
  };

  const formatStatus = (status: string) => {
    const stageConfig = {
      new: { 
        label: 'New', 
        color: 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        icon: <Search className="h-4 w-4" />
      },
      contacted: { 
        label: 'Contacted', 
        color: 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
        icon: <Phone className="h-4 w-4" />
      },
      qualified: { 
        label: 'Qualified', 
        color: 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
        icon: <CheckCircle className="h-4 w-4" />
      },
      lost: {
        label: 'Lost',
        color: 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
        icon: <XCircle className="h-4 w-4" />
      }
    };
    
    const config = stageConfig[status.toLowerCase() as keyof typeof stageConfig] || { 
      label: status, 
      color: 'bg-gray-50 dark:bg-gray-950/20 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800',
      icon: <Target className="h-4 w-4" />
    };
    
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${config.color}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="h-8 w-8 text-primary" />
            </div>
            Leads
            {hasRole('staff') && (
              <Badge variant="secondary" className="ml-2">
                My Leads Only
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            {hasRole('staff') 
              ? 'Manage your assigned leads' 
              : 'Manage and track your sales leads'
            }
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Input
            placeholder="Search leads..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="sm:w-64"
          />
          <Button
            onClick={openAddModal}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Lead
          </Button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {hasRole('staff') ? 'My Leads' : 'Total Leads'}
              </p>
              <p className="text-2xl font-bold">{totalLeads}</p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-950/30 rounded-lg">
              <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">New Leads</p>
              <p className="text-2xl font-bold">{newLeads}</p>
            </div>
            <div className="p-2 bg-yellow-100 dark:bg-yellow-950/30 rounded-lg">
              <Plus className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Qualified</p>
              <p className="text-2xl font-bold">{qualifiedLeads}</p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-950/30 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Lost Leads</p>
              <p className="text-2xl font-bold">{lostLeads}</p>
            </div>
            <div className="p-2 bg-red-100 dark:bg-red-950/30 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold">
            {hasRole('staff') ? 'My Leads' : 'All Leads'}
          </h2>
        </div>
        
        {loading ? (
          <div className="p-6 text-center text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            Loading leads...
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No leads found</h3>
            <p className="mb-4">
              {hasRole('staff') 
                ? "You don't have any assigned leads yet." 
                : "Start by adding your first lead to track potential customers."
              }
            </p>
            <Button
              onClick={openAddModal}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium shadow hover:bg-primary/90 transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus className="h-4 w-4" /> Add Lead
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-4 text-left font-semibold">Client</th>
                  <th className="px-6 py-4 text-left font-semibold">Status</th>
                  <th className="px-6 py-4 text-left font-semibold">Notes</th>
                  <th className="px-6 py-4 text-left font-semibold">Created</th>
                  {hasRole('admin') && (
                    <th className="px-6 py-4 text-left font-semibold">Assigned To</th>
                  )}
                  <th className="px-6 py-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => {
                  const StatusIcon = getStatusIcon(lead.status);
                  return (
                    <tr key={lead.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{lead.client?.name || 'Unknown Client'}</p>
                            <p className="text-xs text-muted-foreground">{lead.client?.email || 'No email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <StatusIcon className="h-4 w-4 text-muted-foreground" />
                          {formatStatus(lead.status)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-muted-foreground max-w-xs truncate">
                          {lead.notes || 'No notes'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                      {hasRole('admin') && (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {getAssignedStaffName(lead.assignedTo, lead.assignedUser)}
                            </span>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                            aria-label="View lead"
                            onClick={() => {
                              toast({ title: 'View Lead', description: 'Lead viewing coming soon!' });
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                            aria-label="Edit lead"
                            onClick={() => openEditModal(lead)}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                className="p-2 rounded-lg hover:bg-destructive/20 text-destructive transition-colors"
                                aria-label="Delete lead"
                                onClick={() => setDeleteId(lead.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Lead?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the lead for {lead.client?.name || 'this client'}.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setDeleteId(null)}>
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleDelete}
                                  disabled={deleteLoading}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {deleteLoading ? 'Deleting...' : 'Delete Lead'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {editLead ? 'Edit Lead' : 'Add New Lead'}
            </DialogTitle>
            <DialogDescription>
              {editLead ? 'Update the lead details below.' : 'Fill in the details to create a new lead.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="clientId">Client</label>
              <Select value={form.clientId} onValueChange={(value) => handleFormChange('clientId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} ({client.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="status">Status</label>
              <Select value={form.status} onValueChange={(value) => handleFormChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="notes">Notes</label>
              <Input 
                id="notes" 
                name="notes" 
                value={form.notes} 
                onChange={(e) => handleFormChange('notes', e.target.value)} 
                placeholder="Enter lead notes..."
              />
            </div>
            
            {hasRole('admin') && (
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="assignedTo">Assigned To</label>
                <Select value={form.assignedTo} onValueChange={(value) => handleFormChange('assignedTo', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {staff.filter(s => s.role === 'staff').map((staffMember) => (
                      <SelectItem key={staffMember.id} value={staffMember.id}>
                        {staffMember.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {formError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                {formError}
              </div>
            )}
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={formLoading}
                className="flex items-center gap-2"
              >
                {formLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {editLead ? 'Saving...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4" />
                    {editLead ? 'Save Changes' : 'Create Lead'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadsPage; 