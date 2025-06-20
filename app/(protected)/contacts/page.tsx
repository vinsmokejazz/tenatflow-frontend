'use client';

import React from 'react';
import { User, Mail, Phone, Edit, Trash2, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const ContactsPage: React.FC = () => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [contacts, setContacts] = React.useState<any[]>([]);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editContact, setEditContact] = React.useState<any | null>(null);
  const [form, setForm] = React.useState({ name: '', email: '', phone: '' });
  const [formLoading, setFormLoading] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const { toast } = useToast();

  // Fetch contacts from backend
  const fetchContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.customRequest('/contacts');
      setContacts(data.contacts || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch contacts');
    }
    setLoading(false);
  };
  React.useEffect(() => { fetchContacts(); }, []);

  // Open Add modal
  const openAddModal = () => {
    setEditContact(null);
    setForm({ name: '', email: '', phone: '' });
    setFormError(null);
    setModalOpen(true);
  };
  // Open Edit modal
  const openEditModal = (contact: any) => {
    setEditContact(contact);
    setForm({ name: contact.name, email: contact.email, phone: contact.phone });
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
      if (!form.name || !form.email || !form.phone) {
        setFormError('All fields are required.');
        setFormLoading(false);
        return;
      }
      if (editContact) {
        await apiClient.customRequest(`/contacts/${editContact.id}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        });
        toast({ title: 'Contact updated', description: 'Contact updated successfully.' });
      } else {
        await apiClient.customRequest('/contacts', {
          method: 'POST',
          body: JSON.stringify(form),
        });
        toast({ title: 'Contact added', description: 'Contact added successfully.' });
      }
      setModalOpen(false);
      fetchContacts();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save contact');
    }
    setFormLoading(false);
  };
  // Handle delete
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await apiClient.customRequest(`/contacts/${deleteId}`, { method: 'DELETE' });
      setDeleteId(null);
      fetchContacts();
      toast({ title: 'Deleted', description: 'Contact deleted successfully.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete contact.', variant: 'destructive' });
    }
    setDeleteLoading(false);
  };
  // Filtered contacts
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(search.toLowerCase()) ||
    contact.email.toLowerCase().includes(search.toLowerCase()) ||
    contact.phone.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <User className="h-6 w-6" /> Contacts
        </h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="sm:w-64"
          />
          <button
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium shadow hover:bg-primary/90 transition-colors flex items-center gap-2"
            onClick={openAddModal}
          >
            <Plus className="h-4 w-4" /> Add Contact
          </button>
        </div>
      </div>
      <div className="bg-card border border-border rounded-lg shadow p-0 overflow-x-auto">
        {loading ? (
          <div className="p-6 text-muted-foreground">Loading contacts...</div>
        ) : error ? (
          <div className="p-6 text-red-500">{error}</div>
        ) : filteredContacts.length === 0 ? (
          <div className="p-6 text-muted-foreground">No contacts found. Start by adding a new contact.</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-semibold">Name</th>
                <th className="px-4 py-3 text-left font-semibold">Email</th>
                <th className="px-4 py-3 text-left font-semibold">Phone</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map((contact) => (
                <tr key={contact.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-2 flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" /> {contact.name}
                  </td>
                  <td className="px-4 py-2 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" /> {contact.email}
                  </td>
                  <td className="px-4 py-2 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" /> {contact.phone}
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      className="p-2 rounded hover:bg-muted transition-colors"
                      aria-label="Edit contact"
                      onClick={() => openEditModal(contact)}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          className="p-2 rounded hover:bg-destructive/20 text-destructive transition-colors"
                          aria-label="Delete contact"
                          onClick={() => setDeleteId(contact.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Contact?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. Are you sure you want to delete this contact?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setDeleteId(null)}>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleteLoading}
                          >
                            {deleteLoading ? 'Deleting...' : 'Delete'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{editContact ? 'Edit Contact' : 'Add Contact'}</DialogTitle>
            <DialogDescription>
              {editContact ? 'Update the contact details below.' : 'Fill in the details to add a new contact.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium" htmlFor="name">Name</label>
              <Input id="name" name="name" value={form.name} onChange={handleFormChange} required autoFocus />
            </div>
            <div>
              <label className="block mb-1 font-medium" htmlFor="email">Email</label>
              <Input id="email" name="email" type="email" value={form.email} onChange={handleFormChange} required />
            </div>
            <div>
              <label className="block mb-1 font-medium" htmlFor="phone">Phone</label>
              <Input id="phone" name="phone" value={form.phone} onChange={handleFormChange} required />
            </div>
            {formError && <div className="text-red-500 text-sm">{formError}</div>}
            <DialogFooter>
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium shadow hover:bg-primary/90 transition-colors"
                disabled={formLoading}
              >
                {formLoading ? (editContact ? 'Saving...' : 'Adding...') : (editContact ? 'Save Changes' : 'Add Contact')}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactsPage;