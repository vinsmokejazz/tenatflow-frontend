'use client';

import React from 'react';
import { Briefcase, DollarSign, User, Edit, Trash2, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api';

const DealsPage: React.FC = () => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [deals, setDeals] = React.useState<any[]>([]);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editDeal, setEditDeal] = React.useState<any | null>(null);
  const [form, setForm] = React.useState({ name: '', value: '', owner: '' });
  const [formLoading, setFormLoading] = React.useState(false);

  // Fetch deals from backend
  const fetchDeals = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.customRequest('/deals');
      setDeals(data.deals || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch deals');
    }
    setLoading(false);
  };
  React.useEffect(() => { fetchDeals(); }, []);

  // Open Add modal
  const openAddModal = () => {
    setEditDeal(null);
    setForm({ name: '', value: '', owner: '' });
    setModalOpen(true);
  };
  // Open Edit modal
  const openEditModal = (deal: any) => {
    setEditDeal(deal);
    setForm({ name: deal.name, value: deal.value, owner: deal.owner });
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
    try {
      if (editDeal) {
        await apiClient.customRequest(`/deals/${editDeal.id}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        });
      } else {
        await apiClient.customRequest('/deals', {
          method: 'POST',
          body: JSON.stringify(form),
        });
      }
      setModalOpen(false);
      fetchDeals();
    } catch (err) {
      // handle error
    }
    setFormLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Briefcase className="h-6 w-6" /> Deals
        </h1>
        <button
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium shadow hover:bg-primary/90 transition-colors flex items-center gap-2"
          onClick={openAddModal}
        >
          <Plus className="h-4 w-4" /> Add Deal
        </button>
      </div>
      <div className="bg-card border border-border rounded-lg shadow p-0 overflow-x-auto">
        {loading ? (
          <div className="p-6 text-muted-foreground">Loading deals...</div>
        ) : error ? (
          <div className="p-6 text-red-500">{error}</div>
        ) : deals.length === 0 ? (
          <div className="p-6 text-muted-foreground">No deals found. Start by adding a new deal.</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-semibold">Deal Name</th>
                <th className="px-4 py-3 text-left font-semibold">Value</th>
                <th className="px-4 py-3 text-left font-semibold">Owner</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((deal) => (
                <tr key={deal.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-2 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" /> {deal.name}
                  </td>
                  <td className="px-4 py-2 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" /> {deal.value}
                  </td>
                  <td className="px-4 py-2 flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" /> {deal.owner}
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      className="p-2 rounded hover:bg-muted transition-colors"
                      aria-label="Edit deal"
                      onClick={() => openEditModal(deal)}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-2 rounded hover:bg-destructive/20 text-destructive transition-colors" aria-label="Delete deal">
                      <Trash2 className="h-4 w-4" />
                    </button>
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
            <DialogTitle>{editDeal ? 'Edit Deal' : 'Add Deal'}</DialogTitle>
            <DialogDescription>
              {editDeal ? 'Update the deal details below.' : 'Fill in the details to add a new deal.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium" htmlFor="name">Deal Name</label>
              <Input id="name" name="name" value={form.name} onChange={handleFormChange} required autoFocus />
            </div>
            <div>
              <label className="block mb-1 font-medium" htmlFor="value">Value</label>
              <Input id="value" name="value" value={form.value} onChange={handleFormChange} required />
            </div>
            <div>
              <label className="block mb-1 font-medium" htmlFor="owner">Owner</label>
              <Input id="owner" name="owner" value={form.owner} onChange={handleFormChange} required />
            </div>
            <DialogFooter>
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium shadow hover:bg-primary/90 transition-colors"
                disabled={formLoading}
              >
                {formLoading ? (editDeal ? 'Saving...' : 'Adding...') : (editDeal ? 'Save Changes' : 'Add Deal')}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DealsPage;