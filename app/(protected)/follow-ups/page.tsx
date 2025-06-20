'use client';

import React from 'react';
import { FileText, Calendar, User, Edit, Trash2, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const FollowUpsPage: React.FC = () => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [followUps, setFollowUps] = React.useState<any[]>([]);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editFollowUp, setEditFollowUp] = React.useState<any | null>(null);
  const [form, setForm] = React.useState({ subject: '', due: '', owner: '' });
  const [formLoading, setFormLoading] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const { toast } = useToast();

  // Fetch follow-ups from backend
  const fetchFollowUps = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getFollowUps();
      setFollowUps(Array.isArray(data) ? data : data.followUps || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch follow-ups');
    }
    setLoading(false);
  };
  React.useEffect(() => { fetchFollowUps(); }, []);

  // Open Add modal
  const openAddModal = () => {
    setEditFollowUp(null);
    setForm({ subject: '', due: '', owner: '' });
    setFormError(null);
    setModalOpen(true);
  };
  // Open Edit modal
  const openEditModal = (item: any) => {
    setEditFollowUp(item);
    setForm({ subject: item.subject, due: item.due, owner: item.owner });
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
      if (!form.subject || !form.due || !form.owner) {
        setFormError('All fields are required.');
        setFormLoading(false);
        return;
      }
      if (editFollowUp) {
        await apiClient.customRequest(`/followUp/${editFollowUp.id}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        });
      } else {
        await apiClient.createFollowUp(form);
      }
      setModalOpen(false);
      fetchFollowUps();
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
      await apiClient.customRequest(`/followUp/${deleteId}`, { method: 'DELETE' });
      setDeleteId(null);
      fetchFollowUps();
      toast({ title: 'Deleted', description: 'Follow-up deleted successfully.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete follow-up.', variant: 'destructive' });
    }
    setDeleteLoading(false);
  };

  // Filtered follow-ups
  const filteredFollowUps = followUps.filter(item =>
    item.subject.toLowerCase().includes(search.toLowerCase()) ||
    item.owner.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <FileText className="h-6 w-6" /> Follow Ups
        </h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search by subject or owner..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="sm:w-64"
          />
          <button
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium shadow hover:bg-primary/90 transition-colors flex items-center gap-2"
            onClick={openAddModal}
          >
            <Plus className="h-4 w-4" /> Add Follow Up
          </button>
        </div>
      </div>
      <div className="bg-card border border-border rounded-lg shadow p-0 overflow-x-auto">
        {loading ? (
          <div className="p-6 text-muted-foreground">Loading follow-ups...</div>
        ) : error ? (
          <div className="p-6 text-red-500">{error}</div>
        ) : filteredFollowUps.length === 0 ? (
          <div className="p-6 text-muted-foreground">No follow-ups found. Start by adding a new follow-up.</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-semibold">Subject</th>
                <th className="px-4 py-3 text-left font-semibold">Due Date</th>
                <th className="px-4 py-3 text-left font-semibold">Owner</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFollowUps.map((item) => (
                <tr key={item.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" /> {item.subject}
                  </td>
                  <td className="px-4 py-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" /> {item.due}
                  </td>
                  <td className="px-4 py-2 flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" /> {item.owner}
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      className="p-2 rounded hover:bg-muted transition-colors"
                      aria-label="Edit follow-up"
                      onClick={() => openEditModal(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          className="p-2 rounded hover:bg-destructive/20 text-destructive transition-colors"
                          aria-label="Delete follow-up"
                          onClick={() => setDeleteId(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Follow Up?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. Are you sure you want to delete this follow-up?
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
            <DialogTitle>{editFollowUp ? 'Edit Follow Up' : 'Add Follow Up'}</DialogTitle>
            <DialogDescription>
              {editFollowUp ? 'Update the follow-up details below.' : 'Fill in the details to add a new follow-up.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium" htmlFor="subject">Subject</label>
              <Input id="subject" name="subject" value={form.subject} onChange={handleFormChange} required autoFocus />
            </div>
            <div>
              <label className="block mb-1 font-medium" htmlFor="due">Due Date</label>
              <Input id="due" name="due" type="date" value={form.due} onChange={handleFormChange} required />
            </div>
            <div>
              <label className="block mb-1 font-medium" htmlFor="owner">Owner</label>
              <Input id="owner" name="owner" value={form.owner} onChange={handleFormChange} required />
            </div>
            {formError && <div className="text-red-500 text-sm">{formError}</div>}
            <DialogFooter>
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium shadow hover:bg-primary/90 transition-colors"
                disabled={formLoading}
              >
                {formLoading ? (editFollowUp ? 'Saving...' : 'Adding...') : (editFollowUp ? 'Save Changes' : 'Add Follow Up')}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FollowUpsPage;