'use client';

import React from 'react';
import { Briefcase, DollarSign, User, Edit, Trash2, Plus, Calendar, TrendingUp, CheckCircle, Clock, Search, Handshake, Target } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';

const DealsPage: React.FC = () => {
  const { backendUser, hasRole } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [deals, setDeals] = React.useState<any[]>([]);
  const [clients, setClients] = React.useState<any[]>([]);
  const [staff, setStaff] = React.useState<any[]>([]);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editDeal, setEditDeal] = React.useState<any | null>(null);
  const [form, setForm] = React.useState<{
    title: string;
    value: string;
    stage: string;
    clientId?: string;
    assignedTo?: string;
  }>({ 
    title: '', 
    value: '', 
    stage: 'prospecting'
  });
  const [formLoading, setFormLoading] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const { toast } = useToast();

  // Fetch deals, clients, and staff (if admin)
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dealsData, clientsData, staffData] = await Promise.all([
        apiClient.getDeals(),
        apiClient.getClients(),
        hasRole('admin') ? apiClient.getUsers() : Promise.resolve([])
      ]);
      setDeals(dealsData || []);
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
    setEditDeal(null);
    setForm({ title: '', value: '', stage: 'prospecting', clientId: 'no-client', assignedTo: 'unassigned' });
    setFormError(null);
    setModalOpen(true);
  };
  
  // Open Edit modal
  const openEditModal = (deal: any) => {
    setEditDeal(deal);
    setForm({ 
      title: deal.title, 
      value: deal.value.toString(), 
      stage: deal.stage,
      clientId: deal.clientId || 'no-client',
      assignedTo: deal.assignedTo || 'unassigned'
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
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      if (!form.title || !form.stage) {
        setFormError('Title and stage are required.');
        setFormLoading(false);
        return;
      }

      // Clean the value field - remove currency symbols and ensure it's a number
      let cleanValue = form.value;
      if (cleanValue) {
        // Remove currency symbols, commas, and spaces
        cleanValue = cleanValue.replace(/[$,\s]/g, '');
        // Ensure it's a valid number
        const numValue = parseFloat(cleanValue);
        if (isNaN(numValue)) {
          setFormError('Value must be a valid number (e.g., 1000 or 1000.50)');
          setFormLoading(false);
          return;
        }
        cleanValue = numValue.toString();
      }

      // Prepare deal data
      const dealData: any = {
        title: form.title,
        value: cleanValue || '0',
        stage: form.stage,
        clientId: form.clientId === 'no-client' ? undefined : form.clientId
      };

      // Only send assignedTo if admin, and convert 'unassigned' to undefined
      if (hasRole('admin')) {
        if (form.assignedTo === 'unassigned') {
          dealData.assignedTo = undefined;
        } else {
          dealData.assignedTo = form.assignedTo;
        }
      }

      if (editDeal) {
        const updatedDeal = await apiClient.updateDeal(editDeal.id, dealData);
        // Immediately update local state for better UX
        setDeals(prevDeals => 
          prevDeals.map(deal => 
            deal.id === editDeal.id ? updatedDeal : deal
          )
        );
        toast({ title: 'Deal updated', description: 'Deal updated successfully.' });
      } else {
        const newDeal = await apiClient.createDeal(dealData);
        // Immediately update local state for better UX
        setDeals(prevDeals => [newDeal, ...prevDeals]);
        toast({ title: 'Deal added', description: 'Deal added successfully.' });
      }
      setModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save deal');
    }
    setFormLoading(false);
  };

  // Handle delete deal
  const handleDeleteDeal = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await apiClient.deleteDeal(deleteId);
      // Immediately update local state for better UX
      setDeals(prevDeals => prevDeals.filter(deal => deal.id !== deleteId));
      setDeleteId(null);
      toast({ title: 'Deleted', description: 'Deal deleted successfully.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete deal.', variant: 'destructive' });
    }
    setDeleteLoading(false);
  };

  // Filter deals based on user role
  const getFilteredDeals = () => {
    let filtered = deals;
    
    // Staff only see their assigned deals
    if (hasRole('staff')) {
      filtered = deals.filter(deal => deal.assignedTo === backendUser?.id);
    }
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(deal => {
        const title = deal.title || '';
        const stage = deal.stage || '';
        const value = deal.value?.toString() || '';
        const clientName = deal.client?.name || '';
        const assignedStaffName = staff.find(s => s.id === deal.assignedTo)?.name || '';
        return (
          title.toLowerCase().includes(searchLower) ||
          stage.toLowerCase().includes(searchLower) ||
          value.includes(search) ||
          clientName.toLowerCase().includes(searchLower) ||
          assignedStaffName.toLowerCase().includes(searchLower)
        );
      });
    }
    
    return filtered;
  };

  const filteredDeals = getFilteredDeals();

  // Calculate deal statistics based on filtered data
  const dealStats = React.useMemo(() => {
    const totalDeals = filteredDeals.length;
    const totalValue = filteredDeals.reduce((sum, deal) => sum + (parseFloat(deal.value) || 0), 0);
    const dealsByStage = filteredDeals.reduce((acc, deal) => {
      acc[deal.stage] = (acc[deal.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalDeals,
      totalValue,
      prospecting: dealsByStage.prospecting || 0,
      negotiating: dealsByStage.negotiating || 0,
      closed: dealsByStage.closed || 0
    };
  }, [filteredDeals]);

  // Format value as currency
  const formatValue = (value: any) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(numValue);
  };

  // Format stage with proper styling
  const formatStage = (stage: string) => {
    const stageConfig = {
      prospecting: { 
        label: 'Prospecting', 
        color: 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        icon: <Search className="h-4 w-4" />
      },
      negotiating: { 
        label: 'Negotiating', 
        color: 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
        icon: <Handshake className="h-4 w-4" />
      },
      closed: { 
        label: 'Closed', 
        color: 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
        icon: <CheckCircle className="h-4 w-4" />
      }
    };
    
    const config = stageConfig[stage as keyof typeof stageConfig] || { 
      label: stage, 
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

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Briefcase className="h-8 w-8 text-primary" />
            </div>
            Deals
            {hasRole('staff') && (
              <Badge variant="secondary" className="ml-2">
                My Deals Only
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            {hasRole('staff') 
              ? 'Manage your assigned deals' 
              : 'Track and manage your sales deals'
            }
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Input
            placeholder="Search deals..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="sm:w-64"
          />
          <Button
            onClick={openAddModal}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Deal
          </Button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {hasRole('staff') ? 'My Deals' : 'Total Deals'}
              </p>
              <p className="text-2xl font-bold">{dealStats.totalDeals}</p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-950/30 rounded-lg">
              <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold">{formatValue(dealStats.totalValue)}</p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-950/30 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Prospecting</p>
              <p className="text-2xl font-bold">{dealStats.prospecting}</p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-950/30 rounded-lg">
              <Search className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Closed</p>
              <p className="text-2xl font-bold">{dealStats.closed}</p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-950/30 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Deals Table */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold">
            {hasRole('staff') ? 'My Deals' : 'All Deals'}
          </h2>
        </div>
        
        {loading ? (
          <div className="p-6 text-center text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            Loading deals...
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : filteredDeals.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No deals found</h3>
            <p className="mb-4">
              {hasRole('staff') 
                ? "You don't have any assigned deals yet." 
                : "Start by adding your first deal to track sales opportunities."
              }
            </p>
            <Button
              onClick={openAddModal}
              className="flex items-center gap-2 mx-auto"
            >
              <Plus className="h-4 w-4" /> Add Deal
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-4 text-left font-semibold">Title</th>
                  <th className="px-6 py-4 text-left font-semibold">Value</th>
                  <th className="px-6 py-4 text-left font-semibold">Stage</th>
                  <th className="px-6 py-4 text-left font-semibold">Client</th>
                  {hasRole('admin') && (
                    <th className="px-6 py-4 text-left font-semibold">Assigned To</th>
                  )}
                  <th className="px-6 py-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeals.map((deal) => (
                  <tr key={deal.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
                          <Briefcase className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{deal.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{formatValue(deal.value)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {formatStage(deal.stage)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {deal.client?.name || 'No client'}
                        </span>
                      </div>
                    </td>
                    {hasRole('admin') && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {getAssignedStaffName(deal.assignedTo, deal.assignedUser)}
                          </span>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-2 rounded-lg hover:bg-muted transition-colors"
                          aria-label="Edit deal"
                          onClick={() => openEditModal(deal)}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              className="p-2 rounded-lg hover:bg-destructive/20 text-destructive transition-colors"
                              aria-label="Delete deal"
                              onClick={() => setDeleteId(deal.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Deal?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the deal "{deal.title}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setDeleteId(null)}>
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDeleteDeal}
                                disabled={deleteLoading}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {deleteLoading ? 'Deleting...' : 'Delete Deal'}
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
              <Briefcase className="h-5 w-5" />
              {editDeal ? 'Edit Deal' : 'Add New Deal'}
            </DialogTitle>
            <DialogDescription>
              {editDeal ? 'Update the deal details below.' : 'Fill in the details to create a new deal.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="title">Title</label>
              <Input 
                id="title" 
                name="title" 
                value={form.title} 
                onChange={(e) => handleFormChange('title', e.target.value)} 
                placeholder="Enter deal title..."
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="value">Value</label>
              <Input 
                id="value" 
                name="value" 
                value={form.value} 
                onChange={(e) => handleFormChange('value', e.target.value)} 
                placeholder="Enter value (e.g., 1000 or 1000.50)"
              />
              <p className="text-xs text-muted-foreground">Enter the deal value without currency symbols</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="stage">Stage</label>
              <Select value={form.stage} onValueChange={(value) => handleFormChange('stage', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prospecting">Prospecting</SelectItem>
                  <SelectItem value="negotiating">Negotiating</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="clientId">Client (Optional)</label>
              <Select value={form.clientId} onValueChange={(value) => handleFormChange('clientId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-client">No client</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} ({client.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                    {editDeal ? 'Saving...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Briefcase className="h-4 w-4" />
                    {editDeal ? 'Save Changes' : 'Create Deal'}
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

export default DealsPage;