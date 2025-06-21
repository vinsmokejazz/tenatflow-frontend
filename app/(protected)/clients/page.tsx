'use client';

import React from 'react';
import { User, Edit, Trash2, Plus, Mail, Phone, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';

const ClientsPage: React.FC = () => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [clients, setClients] = React.useState<any[]>([]);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editClient, setEditClient] = React.useState<any | null>(null);
  const [form, setForm] = React.useState({ name: '', email: '', phone: '' });
  const [formLoading, setFormLoading] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch clients from backend
  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getClients();
      setClients(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch clients');
    }
    setLoading(false);
  };

  React.useEffect(() => { 
    if (user) {
      fetchClients(); 
    }
  }, [user]);

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
    setForm({ name: client.name, email: client.email || '', phone: client.phone || '' });
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
        await apiClient.updateClient(editClient.id, form);
        toast({ title: 'Client updated', description: 'Client updated successfully.' });
      } else {
        await apiClient.createClient(form);
        toast({ title: 'Client created', description: 'Client created successfully.' });
      }
      setModalOpen(false);
      fetchClients();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save client');
    }
    setFormLoading(false);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await apiClient.deleteClient(deleteId);
      // Immediately update local state for better UX
      setClients(prevClients => prevClients.filter(client => client.id !== deleteId));
      setDeleteId(null);
      toast({ title: 'Deleted', description: 'Client deleted successfully.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete client.', variant: 'destructive' });
    }
    setDeleteLoading(false);
  };

  // Filtered clients
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(search.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(search.toLowerCase())) ||
    (client.phone && client.phone.toLowerCase().includes(search.toLowerCase()))
  );

  // Calculate client statistics
  const clientStats = React.useMemo(() => {
    const totalClients = clients.length;
    const clientsWithEmail = clients.filter(client => client.email).length;
    const clientsWithPhone = clients.filter(client => client.phone).length;
    const completeClients = clients.filter(client => client.email && client.phone).length;

    return {
      totalClients,
      clientsWithEmail,
      clientsWithPhone,
      completeClients
    };
  }, [clients]);

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
          <p className="text-muted-foreground mt-1">Manage your client relationships</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Input
            placeholder="Search clients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="sm:w-64"
          />
          <button
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium shadow hover:bg-primary/90 transition-colors flex items-center gap-2"
            onClick={openAddModal}
          >
            <Plus className="h-4 w-4" /> Add Client
          </button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      {!loading && !error && clients.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold text-foreground">{clientStats.totalClients}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">With Email</p>
                <p className="text-2xl font-bold text-foreground">{clientStats.clientsWithEmail}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">With Phone</p>
                <p className="text-2xl font-bold text-foreground">{clientStats.clientsWithPhone}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Phone className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Complete Profiles</p>
                <p className="text-2xl font-bold text-foreground">{clientStats.completeClients}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>
      )}

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
          <div className="p-6 text-center text-red-500">
            <p className="text-red-600 font-medium mb-2">Error loading clients</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No clients found</h3>
            <p className="mb-4">
              {search ? 'No clients match your search criteria.' : 'Start by adding your first client to build your network.'}
            </p>
            <button
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium shadow hover:bg-primary/90 transition-colors flex items-center gap-2 mx-auto"
              onClick={openAddModal}
            >
              <Plus className="h-4 w-4" /> Add Client
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-4 text-left font-semibold">Name</th>
                  <th className="px-6 py-4 text-left font-semibold">Email</th>
                  <th className="px-6 py-4 text-left font-semibold">Phone</th>
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
                          <p className="text-xs text-muted-foreground">ID: {client.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className={client.email ? 'text-foreground' : 'text-muted-foreground'}>
                          {client.email || 'No email'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className={client.phone ? 'text-foreground' : 'text-muted-foreground'}>
                          {client.phone || 'No phone'}
                        </span>
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
                        <button
                          className="p-2 rounded-lg hover:bg-muted transition-colors"
                          aria-label="Edit client"
                          onClick={() => openEditModal(client)}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              className="p-2 rounded-lg hover:bg-destructive/20 text-destructive transition-colors"
                              aria-label="Delete client"
                              onClick={() => setDeleteId(client.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Client?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the client "{client.name}" and all associated data.
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
              {editClient ? 'Update the client details below.' : 'Fill in the details to create a new client.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="name">Name</label>
              <Input 
                id="name" 
                name="name" 
                value={form.name} 
                onChange={handleFormChange} 
                placeholder="Enter client name..."
                required 
                autoFocus 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">Email</label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                value={form.email} 
                onChange={handleFormChange} 
                placeholder="Enter email address..."
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="phone">Phone</label>
              <Input 
                id="phone" 
                name="phone" 
                value={form.phone} 
                onChange={handleFormChange} 
                placeholder="Enter phone number..."
              />
            </div>
            
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
                    {editClient ? 'Saving...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4" />
                    {editClient ? 'Save Changes' : 'Create Client'}
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

export default ClientsPage;