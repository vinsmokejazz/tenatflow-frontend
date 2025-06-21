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
import { Button } from '@/components/ui/button';

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
    completed?: boolean;
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
    setForm({ notes: '', dueDate: '', clientId: '', assignedTo: 'unassigned', completed: false });
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
      assignedTo: item.assignedTo || 'unassigned',
      completed: item.completed || false
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
    console.log('=== FOLLOW-UP FORM SUBMISSION STARTED ===');
    e.preventDefault();
    console.log('Form submission started');
    console.log('Form data:', form);
    console.log('User role:', hasRole('admin') ? 'admin' : 'staff');
    
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
        dueDate: new Date(form.dueDate).toISOString(),
        completed: form.completed || false
      };

      // Only send assignedTo if admin, and convert 'unassigned' to undefined
      if (!hasRole('admin')) {
        delete formData.assignedTo;
      } else {
        if (formData.assignedTo === 'unassigned') {
          formData.assignedTo = undefined;
        } else {
          formData.assignedTo = formData.assignedTo;
        }
      }
      
      console.log('Payload being sent to API:', formData);
      
      if (editFollowUp) {
        console.log('Updating follow-up with ID:', editFollowUp.id);
        const updatedFollowUp = await apiClient.updateFollowUp(editFollowUp.id, formData);
        console.log('Updated follow-up response:', updatedFollowUp);
        console.log('Updated follow-up assignedTo:', updatedFollowUp.assignedTo);
        console.log('Updated follow-up assignedUser:', updatedFollowUp.assignedUser);
        
        setFollowUps(prevFollowUps => 
          prevFollowUps.map(followUp => 
            followUp.id === editFollowUp.id ? updatedFollowUp : followUp
          )
        );
        toast({ title: 'Follow-up updated', description: 'Follow-up updated successfully.' });
      } else {
        console.log('Creating new follow-up');
        const newFollowUp = await apiClient.createFollowUp(formData);
        console.log('Created follow-up response:', newFollowUp);
        console.log('Created follow-up assignedTo:', newFollowUp.assignedTo);
        console.log('Created follow-up assignedUser:', newFollowUp.assignedUser);
        
        setFollowUps(prevFollowUps => [newFollowUp, ...prevFollowUps]);
        toast({ title: 'Follow-up added', description: 'Follow-up added successfully.' });
      }
      setModalOpen(false);
    } catch (err: any) {
      console.error('Error in form submission:', err);
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

  // Enhanced task filtering and sorting
  const filteredAndSortedTasks = React.useMemo(() => {
    let filtered = followUps.filter(task => {
      if (!search) return true;
      const searchLower = search.toLowerCase();
      return (
        task.notes.toLowerCase().includes(searchLower) ||
        (task.client?.name && task.client.name.toLowerCase().includes(searchLower)) ||
        (task.assignedUser?.name && task.assignedUser.name.toLowerCase().includes(searchLower))
      );
    });

    // Staff only see their assigned follow-ups
    if (hasRole('staff')) {
      filtered = filtered.filter(followUp => followUp.assignedTo === backendUser?.id);
    }

    // Sort by priority: overdue first, then due today, then upcoming
    filtered.sort((a, b) => {
      const now = new Date();
      const aDue = new Date(a.dueDate);
      const bDue = new Date(b.dueDate);
      
      // Overdue tasks first
      const aOverdue = !a.completed && aDue < now;
      const bOverdue = !b.completed && bDue < now;
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      
      // Then by due date
      if (aOverdue && bOverdue) {
        return aDue.getTime() - bDue.getTime();
      }
      
      // Non-overdue tasks by due date
      return aDue.getTime() - bDue.getTime();
    });

    return filtered;
  }, [followUps, search, hasRole, backendUser]);

  // Calculate task statistics
  const taskStats = React.useMemo(() => {
    const now = new Date();
    const overdue = followUps.filter(task => !task.completed && new Date(task.dueDate) < now).length;
    const dueToday = followUps.filter(task => {
      if (task.completed) return false;
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      return dueDate.toDateString() === today.toDateString();
    }).length;
    const upcoming = followUps.filter(task => {
      if (task.completed) return false;
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return dueDate > today && dueDate <= weekFromNow;
    }).length;
    const completed = followUps.filter(task => task.completed).length;
    
    return { overdue, dueToday, upcoming, completed, total: followUps.length };
  }, [followUps]);

  // Get task status and styling
  const getTaskStatus = (task: any) => {
    if (task.completed) return { status: 'Completed', variant: 'default' as const, color: 'text-green-600' };
    
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dueDate < now) {
      return { status: 'Overdue', variant: 'destructive' as const, color: 'text-red-600' };
    } else if (daysUntilDue === 0) {
      return { status: 'Due Today', variant: 'secondary' as const, color: 'text-orange-600' };
    } else if (daysUntilDue === 1) {
      return { status: 'Due Tomorrow', variant: 'secondary' as const, color: 'text-yellow-600' };
    } else if (daysUntilDue <= 7) {
      return { status: `Due in ${daysUntilDue} days`, variant: 'outline' as const, color: 'text-blue-600' };
    } else {
      return { status: `Due in ${daysUntilDue} days`, variant: 'outline' as const, color: 'text-gray-600' };
    }
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {hasRole('staff') ? 'My Follow-ups' : 'Total Follow-ups'}
              </p>
              <p className="text-2xl font-bold">{taskStats.total}</p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-950/30 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{taskStats.completed}</p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-950/30 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Due Today</p>
              <p className="text-2xl font-bold">{taskStats.dueToday}</p>
            </div>
            <div className="p-2 bg-orange-100 dark:bg-orange-950/30 rounded-lg">
              <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
              <p className="text-2xl font-bold">{taskStats.upcoming}</p>
            </div>
            <div className="p-2 bg-yellow-100 dark:bg-yellow-950/30 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Overdue</p>
              <p className="text-2xl font-bold">{taskStats.overdue}</p>
            </div>
            <div className="p-2 bg-red-100 dark:bg-red-950/30 rounded-lg">
              <Clock className="h-6 w-6 text-red-600 dark:text-red-400" />
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
        ) : filteredAndSortedTasks.length === 0 ? (
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
                {filteredAndSortedTasks.map((item) => (
                  <tr key={item.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{item.client?.name || 'Unassigned'}</p>
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
                      <Badge variant={getTaskStatus(item).variant} className={getTaskStatus(item).color}>
                        {getTaskStatus(item).status}
                      </Badge>
                    </td>
                    {hasRole('admin') && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {item.assignedUser?.name || 'Unassigned'}
                          </span>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant={item.completed ? 'secondary' : 'outline'}
                          size="icon"
                          className={`h-8 w-8 ${item.completed ? 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-950/30 dark:text-green-400' : ''}`}
                          aria-label={item.completed ? 'Mark as incomplete' : 'Mark as complete'}
                          onClick={async () => {
                            try {
                              await apiClient.updateFollowUp(item.id, { 
                                completed: !item.completed,
                                notes: item.notes,
                                dueDate: item.dueDate
                              });
                              // Update local state immediately for better UX
                              setFollowUps(prevFollowUps => 
                                prevFollowUps.map(followUp => 
                                  followUp.id === item.id 
                                    ? { ...followUp, completed: !followUp.completed }
                                    : followUp
                                )
                              );
                              toast({ 
                                title: item.completed ? 'Marked as incomplete' : 'Marked as complete', 
                                description: `Follow-up ${item.completed ? 'marked as incomplete' : 'marked as complete'} successfully.` 
                              });
                            } catch (err: any) {
                              toast({ 
                                title: 'Error', 
                                description: err.message || 'Failed to update follow-up status.', 
                                variant: 'destructive' 
                              });
                            }
                          }}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Edit follow-up"
                          onClick={() => openEditModal(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              aria-label="Delete follow-up"
                              onClick={() => setDeleteId(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Follow-up?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the follow-up for {item.client?.name || 'Unassigned'}.
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
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  id="completed"
                  name="completed"
                  type="checkbox"
                  checked={form.completed || false}
                  onChange={(e) => setForm({ ...form, completed: e.target.checked })}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="completed" className="text-sm font-medium">
                  Mark as completed
                </label>
              </div>
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
                    {editFollowUp ? 'Saving...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    {editFollowUp ? 'Save Changes' : 'Create Follow-up'}
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

export default FollowUpsPage;