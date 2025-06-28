'use client';

import React from 'react';
import { User, Mail, Phone, Calendar, Target, FileText, Briefcase, Edit, Trash2, Plus, ArrowLeft, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { apiClient } from '@/lib/api';
import { dashboardUpdates } from '@/lib/dashboard-updates';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

const ClientsPage: React.FC = () => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [clients, setClients] = React.useState<any[]>([]);
  const [selectedClient, setSelectedClient] = React.useState<any | null>(null);
  const [clientDetails, setClientDetails] = React.useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editClient, setEditClient] = React.useState<any | null>(null);
  const [form, setForm] = React.useState<{
    name: string;
    email: string;
    phone: string;
  }>({
    name: '',
    email: '',
    phone: ''
  });
  const [formLoading, setFormLoading] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [detailsModalOpen, setDetailsModalOpen] = React.useState(false);
  const [limitInfo, setLimitInfo] = React.useState<any>(null);
  const { toast } = useToast();
  const { backendUser, hasRole } = useAuth();
  const router = useRouter();

  // Fetch clients
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [clientsData, limitData] = await Promise.all([
        apiClient.getClients(),
        apiClient.getClientLimitInfo()
      ]);
      setClients(Array.isArray(clientsData) ? clientsData : clientsData.clients || []);
      setLimitInfo(limitData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch clients');
    }
    setLoading(false);
  };
  
  React.useEffect(() => { 
    if (backendUser) {
      fetchData(); 
    }
  }, [backendUser]);

  // Fetch client details
  const fetchClientDetails = async (clientId: string) => {
    setDetailsLoading(true);
    try {
      const details = await apiClient.getClientDetails(clientId);
      setClientDetails(details);
      setDetailsModalOpen(true);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to fetch client details', variant: 'destructive' });
    }
    setDetailsLoading(false);
  };

  // Open Add modal
  const openAddModal = () => {
    setEditClient(null);
    setForm({ name: '', email: '', phone: '' });
    setFormError(null);
    setModalOpen(true);
  };
  
  // Open Edit modal
  const openEditModal = (client: any) => {
    setEditClient(client);
    setForm({ 
      name: client.name, 
      email: client.email || '', 
      phone: client.phone || ''
    });
    setFormError(null);
    setModalOpen(true);
  };
  
  // Handle form change
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
  // Handle form submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      if (!form.name) {
        setFormError('Name is required.');
        setFormLoading(false);
        return;
      }
      
      if (editClient) {
        const updatedClient = await apiClient.updateClient(editClient.id, form);
        setClients(prevClients => 
          prevClients.map(client => 
            client.id === editClient.id ? updatedClient : client
          )
        );
        toast({ title: 'Client updated', description: 'Client updated successfully.' });
        
        // Notify dashboard of client update
        dashboardUpdates.onClientChange('updated', { clientId: editClient.id });
      } else {
        const newClient = await apiClient.createClient(form);
        setClients(prevClients => [newClient, ...prevClients]);
        
        // Update limit info if provided in response
        if (newClient.limitInfo) {
          setLimitInfo(newClient.limitInfo);
        } else {
          // Refresh limit info
          try {
            const updatedLimitInfo = await apiClient.getClientLimitInfo();
            setLimitInfo(updatedLimitInfo);
          } catch (refreshErr) {
            console.error('Failed to refresh limit info:', refreshErr);
          }
        }
        
        toast({ title: 'Client added', description: 'Client added successfully.' });
        
        // Notify dashboard of new client
        dashboardUpdates.onClientChange('created', { clientId: newClient.id });
      }
      setModalOpen(false);
    } catch (err: any) {
      if (err.message?.includes('Client limit reached')) {
        setFormError('Client limit reached. Please upgrade your subscription to add more clients.');
        // Refresh limit info
        try {
          const updatedLimitInfo = await apiClient.getClientLimitInfo();
          setLimitInfo(updatedLimitInfo);
        } catch (refreshErr) {
          console.error('Failed to refresh limit info:', refreshErr);
        }
      } else {
        setFormError(err.message || 'Failed to save client');
      }
    }
    setFormLoading(false);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await apiClient.deleteClient(deleteId);
      setClients(prevClients => prevClients.filter(client => client.id !== deleteId));
      setDeleteId(null);
      toast({ title: 'Deleted', description: 'Client deleted successfully.' });
      
      // Notify dashboard of client deletion
      dashboardUpdates.onClientChange();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete client.', variant: 'destructive' });
    }
    setDeleteLoading(false);
  };

  // Filter clients
  const filteredClients = clients.filter(client => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      client.name.toLowerCase().includes(searchLower) ||
      (client.email && client.email.toLowerCase().includes(searchLower)) ||
      (client.phone && client.phone.toLowerCase().includes(searchLower))
    );
  });

  // Calculate client statistics
  const clientStats = React.useMemo(() => {
    const totalClients = clients.length;
    const clientsWithEmail = clients.filter(client => client.email).length;
    const clientsWithPhone = clients.filter(client => client.phone).length;
    
    return {
      totalClients,
      clientsWithEmail,
      clientsWithPhone
    };
  }, [clients]);

  // Check if approaching client limit
  const isApproachingLimit = limitInfo ? limitInfo.usagePercentage >= 80 : false;
  const isAtLimit = limitInfo ? !limitInfo.canAddMore : false;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="h-8 w-8 text-primary" />
            </div>
            Clients
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your client relationships and track their activities
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Input
            placeholder="Search clients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="sm:w-64"
          />
          <Button
            onClick={openAddModal}
            disabled={isAtLimit}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Client
          </Button>
        </div>
      </div>

      {/* Client Limit Warning */}
      {limitInfo && (isApproachingLimit || isAtLimit) && (
        <div className={`mb-6 p-4 rounded-lg border ${
          isAtLimit 
            ? 'bg-red-50 border-red-200 text-red-800' 
            : 'bg-yellow-50 border-yellow-200 text-yellow-800'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-xl">
              {isAtLimit ? '⚠️' : '⚡'}
            </span>
            <div className="flex-1">
              <p className="font-medium">
                {isAtLimit ? 'Client Limit Reached' : 'Approaching Client Limit'}
              </p>
              <p className="text-sm mt-1">
                {isAtLimit 
                  ? `You have reached the maximum of ${limitInfo.limit} clients for the ${limitInfo.subscription} tier. Please upgrade your subscription to add more clients.`
                  : `You have ${limitInfo.currentCount}/${limitInfo.limit} clients (${limitInfo.subscription} tier). Consider upgrading your subscription for unlimited clients.`
                }
              </p>
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isAtLimit ? 'bg-red-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${limitInfo.usagePercentage}%` }}
                  ></div>
                </div>
                <p className="text-xs mt-1">
                  {limitInfo.currentCount} of {limitInfo.limit} clients used ({limitInfo.usagePercentage}%)
                </p>
              </div>
            </div>
            {isAtLimit && (
              <Button
                variant="outline"
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-100"
                onClick={() => {
                  // TODO: Implement upgrade flow
                  toast({ 
                    title: 'Upgrade Required', 
                    description: 'Please contact support to upgrade your subscription.',
                    variant: 'destructive'
                  });
                }}
              >
                Upgrade Plan
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
              <p className="text-2xl font-bold">{clientStats.totalClients}</p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-950/30 rounded-lg">
              <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">With Email</p>
              <p className="text-2xl font-bold">{clientStats.clientsWithEmail}</p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-950/30 rounded-lg">
              <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">With Phone</p>
              <p className="text-2xl font-bold">{clientStats.clientsWithPhone}</p>
            </div>
            <div className="p-2 bg-yellow-100 dark:bg-yellow-950/30 rounded-lg">
              <Phone className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold">All Clients</h2>
        </div>
        
        {loading ? (
          <div className="p-6 text-center text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            Loading clients...
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : filteredClients.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No clients found</h3>
            <p className="mb-4">
              {search ? 'No clients match your search criteria.' : 'Start by adding your first client to track relationships.'}
            </p>
            <Button
              onClick={openAddModal}
              className="flex items-center gap-2 mx-auto"
            >
              <Plus className="h-4 w-4" /> Add Client
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-4 text-left font-semibold">Client</th>
                  <th className="px-6 py-4 text-left font-semibold">Contact Info</th>
                  <th className="px-6 py-4 text-left font-semibold">Created</th>
                  <th className="px-6 py-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{client.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {client.email && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span>{client.email}</span>
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                        {!client.email && !client.phone && (
                          <span className="text-sm text-muted-foreground">No contact info</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(client.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchClientDetails(client.id)}
                          disabled={detailsLoading}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(client)}
                          className="flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteId(client.id)}
                              className="flex items-center gap-2 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Client?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete {client.name} and all associated data.
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
                                {deleteLoading ? 'Deleting...' : 'Delete Client'}
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
              <User className="h-5 w-5" />
              {editClient ? 'Edit Client' : 'Add New Client'}
            </DialogTitle>
            <DialogDescription>
              {editClient ? 'Update the client information below.' : 'Fill in the details to create a new client.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="name">Full Name</label>
              <Input 
                id="name" 
                name="name" 
                value={form.name} 
                onChange={handleFormChange} 
                placeholder="Enter client's full name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">Email Address</label>
              <Input 
                id="email" 
                name="email" 
                type="email"
                value={form.email} 
                onChange={handleFormChange} 
                placeholder="Enter email address (optional)"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="phone">Phone Number</label>
              <Input 
                id="phone" 
                name="phone" 
                value={form.phone} 
                onChange={handleFormChange} 
                placeholder="Enter phone number (optional)"
              />
            </div>
            
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
                    {editClient ? 'Saving...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4" />
                    {editClient ? 'Save Changes' : 'Create Client'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Client Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Client Details
            </DialogTitle>
            <DialogDescription>
              View detailed information about this client and their activities.
            </DialogDescription>
          </DialogHeader>
          
          {detailsLoading ? (
            <div className="p-6 text-center text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              Loading client details...
            </div>
          ) : clientDetails ? (
            <div className="space-y-6">
              {/* Client Info */}
              <div className="bg-muted/30 dark:bg-muted/10 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Client Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p className="font-medium">{clientDetails.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="font-medium">{clientDetails.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p className="font-medium">{clientDetails.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Created</p>
                    <p className="font-medium">{new Date(clientDetails.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Leads */}
              <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-yellow-800 dark:text-yellow-300">
                  <Target className="h-5 w-5" />
                  Leads ({clientDetails.leads?.length || 0})
                </h3>
                {clientDetails.leads && clientDetails.leads.length > 0 ? (
                  <div className="space-y-2">
                    {clientDetails.leads.map((lead: any) => (
                      <div key={lead.id} className="flex items-center justify-between p-3 bg-background/50 dark:bg-background/20 rounded-lg border">
                        <div>
                          <p className="font-medium">{lead.status}</p>
                          <p className="text-sm text-muted-foreground">{lead.notes}</p>
                        </div>
                        <Badge variant="outline">{lead.status}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No leads found for this client.</p>
                )}
              </div>

              {/* Follow-ups */}
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-blue-800 dark:text-blue-300">
                  <FileText className="h-5 w-5" />
                  Follow-ups ({clientDetails.followUps?.length || 0})
                </h3>
                {clientDetails.followUps && clientDetails.followUps.length > 0 ? (
                  <div className="space-y-2">
                    {clientDetails.followUps.map((followUp: any) => (
                      <div key={followUp.id} className="flex items-center justify-between p-3 bg-background/50 dark:bg-background/20 rounded-lg border">
                        <div>
                          <p className="font-medium">{followUp.notes}</p>
                          <p className="text-sm text-muted-foreground">
                            Due: {new Date(followUp.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={followUp.completed ? "default" : "secondary"}>
                          {followUp.completed ? 'Completed' : 'Pending'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No follow-ups found for this client.</p>
                )}
              </div>

              {/* Deals */}
              <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-green-800 dark:text-green-300">
                  <Briefcase className="h-5 w-5" />
                  Deals ({clientDetails.deals?.length || 0})
                </h3>
                {clientDetails.deals && clientDetails.deals.length > 0 ? (
                  <div className="space-y-2">
                    {clientDetails.deals.map((deal: any) => (
                      <div key={deal.id} className="flex items-center justify-between p-3 bg-background/50 dark:bg-background/20 rounded-lg border">
                        <div>
                          <p className="font-medium">{deal.title}</p>
                          <p className="text-sm text-muted-foreground">${deal.value}</p>
                        </div>
                        <Badge variant="outline">{deal.stage}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No deals found for this client.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              No client details available.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientsPage;