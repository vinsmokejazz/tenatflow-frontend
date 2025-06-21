'use client';

import React from 'react';
import { FileText, Calendar, User, Edit, Trash2, Plus, CheckCircle, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';

const FollowUpsPage: React.FC = () => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [followUps, setFollowUps] = React.useState<any[]>([]);
  const [clients, setClients] = React.useState<any[]>([]);
  const [staff, setStaff] = React.useState<any[]>([]);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editFollowUp, setEditFollowUp] = React.useState<any | null>(null);
  const [form, setForm] = React.useState<{
    notes: string;
    dueDate: string;
    clientId: string;
    assignedTo?: string;
  }>({
    notes: '',
    dueDate: '',
    clientId: '',
    assignedTo: 'unassigned'
  });
  const [formLoading, setFormLoading] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const { toast } = useToast();
  const { backendUser, hasRole } = useAuth();

  // Fetch follow-ups, clients, and staff (if admin)
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [followUpsData, clientsData, staffData] = await Promise.all([
        apiClient.getFollowUps(),
        apiClient.getClients(),
        hasRole('admin') ? apiClient.getUsers() : Promise.resolve([])
      ]);
      
      setFollowUps(Array.isArray(followUpsData) ? followUpsData : followUpsData.followUps || []);
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
    setEditFollowUp(null);
    setForm({ notes: '', dueDate: '', clientId: '', assignedTo: 'unassigned' });
    setFormError(null);
    setModalOpen(true);
  };
  
  // Open Edit modal
  const openEditModal = (item: any) => {
    setEditFollowUp(item);
    setForm({ 
      notes: item.notes, 
      dueDate: item.dueDate ? new Date(item.dueDate).toISOString().split('T')[0] : '', 
      clientId: item.clientId || '',
      assignedTo: item.assignedTo || 'unassigned'
    });
    setFormError(null);
    setModalOpen(true);
  };
  
  // Handle form change
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle client selection
  const handleClientChange = (value: string) => {
    setForm({ ...form, clientId: value });
  };

  // Handle staff assignment
  const handleStaffChange = (value: string) => {
    setForm({ ...form, assignedTo: value });
  };
  
  // Handle form submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      if (!form.notes || !form.dueDate || !form.clientId) {
        setFormError('Notes, due date, and client are required.');
        setFormLoading(false);
        return;
      }
      
      // Convert date to ISO string for backend validation
      const formData = {
        ...form,
        dueDate: new Date(form.dueDate).toISOString()
      };

      // Only send assignedTo if admin, and convert 'unassigned' to undefined
      if (!hasRole('admin')) {
        delete formData.assignedTo;
      } else if (formData.assignedTo === 'unassigned') {
        formData.assignedTo = undefined;
      }
      
      if (editFollowUp) {
        await apiClient.updateFollowUp(editFollowUp.id, formData);
        toast({ title: 'Follow-up updated', description: 'Follow-up updated successfully.' });
      } else {
        await apiClient.createFollowUp(formData);
        toast({ title: 'Follow-up added', description: 'Follow-up added successfully.' });
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save follow-up');
    }
    setFormLoading(false);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await apiClient.deleteFollowUp(deleteId);
      // Immediately update local state for better UX
      setFollowUps(prevFollowUps => prevFollowUps.filter(followUp => followUp.id !== deleteId));
      setDeleteId(null);
      toast({ title: 'Deleted', description: 'Follow-up deleted successfully.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete follow-up.', variant: 'destructive' });
    }
    setDeleteLoading(false);
  };

  // Filter follow-ups based on user role
  const getFilteredFollowUps = () => {
    let filtered = followUps;
    
    // Staff only see their assigned follow-ups
    if (hasRole('staff')) {
      filtered = followUps.filter(followUp => followUp.assignedTo === backendUser?.id);
    }
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(item => {
        const notes = item.notes || '';
        const clientName = getClientName(item.clientId);
        const assignedStaffName = staff.find(s => s.id === item.assignedTo)?.name || '';
        return (
          notes.toLowerCase().includes(searchLower) ||
          clientName.toLowerCase().includes(searchLower) ||
          assignedStaffName.toLowerCase().includes(searchLower)
        );
      });
    }
    
    return filtered;
  };

  const filteredFollowUps = getFilteredFollowUps();

  // Calculate follow-up statistics based on filtered data
  const followUpStats = React.useMemo(() => {
    const totalFollowUps = filteredFollowUps.length;
    const completedFollowUps = filteredFollowUps.filter(item => item.completed).length;
    const pendingFollowUps = totalFollowUps - completedFollowUps;
    const overdueFollowUps = filteredFollowUps.filter(item => 
      !item.completed && new Date(item.dueDate) < new Date()
    ).length;
    
    return {
      totalFollowUps,
      completedFollowUps,
      pendingFollowUps,
      overdueFollowUps
    };
  }, [filteredFollowUps]);

  // Format status badge
  const formatStatus = (completed: boolean, dueDate: string) => {
    const isOverdue = !completed && new Date(dueDate) < new Date();
    
    if (completed) {
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200">
          <CheckCircle className="h-4 w-4" />
          Completed
        </span>
      );
    } else if (isOverdue) {
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-red-50 text-red-700 border border-red-200">
          <span className="text-base">⚠️</span>
          Overdue
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
          <Clock className="h-4 w-4" />
          Pending
        </span>
      );
    }
  };

  // Get client name by ID
  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : clientId;
  };

  // Get assigned staff name
  const getAssignedStaffName = (assignedTo: string) => {
    if (!assignedTo) return 'Unassigned';
    const staffMember = staff.find(s => s.id === assignedTo);
    return staffMember?.name || 'Unknown Staff';
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            Follow-ups
            {hasRole('staff') && (
              <Badge variant="secondary" className="ml-2">
                My Follow-ups Only
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            {hasRole('staff') 
              ? 'Manage your assigned follow-ups' 
              : 'Track and manage client follow-ups'
            }
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Input
            placeholder="Search follow-ups..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="sm:w-64"
          />
          <button
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium shadow hover:bg-primary/90 transition-colors flex items-center gap-2"
            onClick={openAddModal}
          >
            <Plus className="h-4 w-4" /> Add Follow-up
          </button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {hasRole('staff') ? 'My Follow-ups' : 'Total Follow-ups'}
              </p>
              <p className="text-2xl font-bold">{followUpStats.totalFollowUps}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{followUpStats.completedFollowUps}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{followUpStats.pendingFollowUps}</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Overdue</p>
              <p className="text-2xl font-bold">{followUpStats.overdueFollowUps}</p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-base">⚠️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Follow-ups Table */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold">
            {hasRole('staff') ? 'My Follow-ups' : 'All Follow-ups'}
          </h2>
        </div>
        
        {loading ? (
          <div className="p-6 text-center text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            Loading follow-ups...
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : filteredFollowUps.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No follow-ups found</h3>
            <p className="mb-4">
              {hasRole('staff') 
                ? "You don't have any assigned follow-ups yet." 
                : "Start by adding your first follow-up to track client interactions."
              }
            </p>
            <button
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium shadow hover:bg-primary/90 transition-colors flex items-center gap-2 mx-auto"
              onClick={openAddModal}
            >
              <Plus className="h-4 w-4" /> Add Follow-up
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-4 text-left font-semibold">Client</th>
                  <th className="px-6 py-4 text-left font-semibold">Notes</th>
                  <th className="px-6 py-4 text-left font-semibold">Due Date</th>
                  <th className="px-6 py-4 text-left font-semibold">Status</th>
                  {hasRole('admin') && (
                    <th className="px-6 py-4 text-left font-semibold">Assigned To</th>
                  )}
                  <th className="px-6 py-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFollowUps.map((item) => (
                  <tr key={item.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{getClientName(item.clientId)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-muted-foreground max-w-xs truncate">
                        {item.notes}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(item.dueDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {formatStatus(item.completed, item.dueDate)}
                    </td>
                    {hasRole('admin') && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {getAssignedStaffName(item.assignedTo)}
                          </span>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-2 rounded-lg hover:bg-muted transition-colors"
                          aria-label="Edit follow-up"
                          onClick={() => openEditModal(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              className="p-2 rounded-lg hover:bg-destructive/20 text-destructive transition-colors"
                              aria-label="Delete follow-up"
                              onClick={() => setDeleteId(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Follow-up?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the follow-up for {getClientName(item.clientId)}.
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
                                {deleteLoading ? 'Deleting...' : 'Delete Follow-up'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
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
              <FileText className="h-5 w-5" />
              {editFollowUp ? 'Edit Follow-up' : 'Add New Follow-up'}
            </DialogTitle>
            <DialogDescription>
              {editFollowUp ? 'Update the follow-up details below.' : 'Fill in the details to create a new follow-up.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="clientId">Client</label>
              <Select value={form.clientId} onValueChange={handleClientChange}>
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
              <label className="text-sm font-medium" htmlFor="notes">Notes</label>
              <Input 
                id="notes" 
                name="notes" 
                value={form.notes} 
                onChange={handleFormChange} 
                placeholder="Enter follow-up notes..."
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="dueDate">Due Date</label>
              <Input 
                id="dueDate" 
                name="dueDate" 
                type="date" 
                value={form.dueDate} 
                onChange={handleFormChange} 
              />
            </div>
            
            {hasRole('admin') && (
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="assignedTo">Assigned To</label>
                <Select value={form.assignedTo} onValueChange={handleStaffChange}>
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
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium shadow hover:bg-primary/90 transition-colors flex items-center gap-2"
                disabled={formLoading}
              >
                {formLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {editFollowUp ? 'Saving...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    {editFollowUp ? 'Save Changes' : 'Create Follow-up'}
                  </>
                )}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FollowUpsPage;