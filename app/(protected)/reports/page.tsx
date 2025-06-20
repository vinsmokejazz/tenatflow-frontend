'use client';

import React from 'react';
import { BarChart2, FileText, Calendar, Edit, Trash2, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const ReportsPage: React.FC = () => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [reports, setReports] = React.useState<any[]>([]);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editReport, setEditReport] = React.useState<any | null>(null);
  const [form, setForm] = React.useState({ name: '', type: '', date: '' });
  const [formLoading, setFormLoading] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const { toast } = useToast();

  // Fetch reports from backend
  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.customRequest('/reports');
      setReports(data.reports || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reports');
    }
    setLoading(false);
  };
  React.useEffect(() => { fetchReports(); }, []);

  // Open Add modal
  const openAddModal = () => {
    setEditReport(null);
    setForm({ name: '', type: '', date: '' });
    setFormError(null);
    setModalOpen(true);
  };
  // Open Edit modal
  const openEditModal = (report: any) => {
    setEditReport(report);
    setForm({ name: report.name, type: report.type, date: report.date });
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
      if (!form.name || !form.type || !form.date) {
        setFormError('All fields are required.');
        setFormLoading(false);
        return;
      }
      if (editReport) {
        await apiClient.customRequest(`/reports/${editReport.id}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        });
        toast({ title: 'Report updated', description: 'Report updated successfully.' });
      } else {
        await apiClient.customRequest('/reports', {
          method: 'POST',
          body: JSON.stringify(form),
        });
        toast({ title: 'Report generated', description: 'Report generated successfully.' });
      }
      setModalOpen(false);
      fetchReports();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save report');
    }
    setFormLoading(false);
  };
  // Handle delete
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await apiClient.customRequest(`/reports/${deleteId}`, { method: 'DELETE' });
      setDeleteId(null);
      fetchReports();
      toast({ title: 'Deleted', description: 'Report deleted successfully.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete report.', variant: 'destructive' });
    }
    setDeleteLoading(false);
  };
  // Filtered reports
  const filteredReports = reports.filter(report =>
    report.name.toLowerCase().includes(search.toLowerCase()) ||
    report.type.toLowerCase().includes(search.toLowerCase()) ||
    report.date.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BarChart2 className="h-6 w-6" /> Reports
        </h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search by name, type, or date..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="sm:w-64"
          />
          <button
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium shadow hover:bg-primary/90 transition-colors flex items-center gap-2"
            onClick={openAddModal}
          >
            <Plus className="h-4 w-4" /> Generate Report
          </button>
        </div>
      </div>
      <div className="bg-card border border-border rounded-lg shadow p-0 overflow-x-auto">
        {loading ? (
          <div className="p-6 text-muted-foreground">Loading reports...</div>
        ) : error ? (
          <div className="p-6 text-red-500">{error}</div>
        ) : filteredReports.length === 0 ? (
          <div className="p-6 text-muted-foreground">No reports found. Start by generating a new report.</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-semibold">Report Name</th>
                <th className="px-4 py-3 text-left font-semibold">Type</th>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" /> {report.name}
                  </td>
                  <td className="px-4 py-2 flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-muted-foreground" /> {report.type}
                  </td>
                  <td className="px-4 py-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" /> {report.date}
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      className="p-2 rounded hover:bg-muted transition-colors"
                      aria-label="Edit report"
                      onClick={() => openEditModal(report)}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          className="p-2 rounded hover:bg-destructive/20 text-destructive transition-colors"
                          aria-label="Delete report"
                          onClick={() => setDeleteId(report.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Report?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. Are you sure you want to delete this report?
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
            <DialogTitle>{editReport ? 'Edit Report' : 'Generate Report'}</DialogTitle>
            <DialogDescription>
              {editReport ? 'Update the report details below.' : 'Fill in the details to generate a new report.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium" htmlFor="name">Report Name</label>
              <Input id="name" name="name" value={form.name} onChange={handleFormChange} required autoFocus />
            </div>
            <div>
              <label className="block mb-1 font-medium" htmlFor="type">Type</label>
              <Input id="type" name="type" value={form.type} onChange={handleFormChange} required />
            </div>
            <div>
              <label className="block mb-1 font-medium" htmlFor="date">Date</label>
              <Input id="date" name="date" type="date" value={form.date} onChange={handleFormChange} required />
            </div>
            {formError && <div className="text-red-500 text-sm">{formError}</div>}
            <DialogFooter>
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium shadow hover:bg-primary/90 transition-colors"
                disabled={formLoading}
              >
                {formLoading ? (editReport ? 'Saving...' : 'Generating...') : (editReport ? 'Save Changes' : 'Generate Report')}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportsPage;