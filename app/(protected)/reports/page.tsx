'use client';

import React from 'react';
import { BarChart2, FileText, Calendar, Edit, Trash2, Plus, Download, Eye, TrendingUp, Users, Target, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';

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
  const [viewReport, setViewReport] = React.useState<any | null>(null);
  const [viewModalOpen, setViewModalOpen] = React.useState(false);
  const [viewLoading, setViewLoading] = React.useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch reports from backend
  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getReports();
      setReports(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reports');
    }
    setLoading(false);
  };

  React.useEffect(() => { 
    if (user) {
      fetchReports(); 
    }
  }, [user]);

  // Open Add modal
  const openAddModal = () => {
    setEditReport(null);
    setForm({ name: '', type: '', date: new Date().toISOString().split('T')[0] });
    setFormError(null);
    setModalOpen(true);
  };

  // Open Edit modal
  const openEditModal = (report: any) => {
    setEditReport(report);
    setForm({ 
      name: report.name, 
      type: report.type, 
      date: new Date(report.createdAt).toISOString().split('T')[0] 
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
      if (!form.name || !form.type || !form.date) {
        setFormError('All fields are required.');
        setFormLoading(false);
        return;
      }
      if (editReport) {
        await apiClient.updateReport(editReport.id, form);
        toast({ title: 'Report updated', description: 'Report updated successfully.' });
      } else {
        await apiClient.createReport(form);
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
      await apiClient.deleteReport(deleteId);
      // Immediately update local state for better UX
      setReports(prevReports => prevReports.filter(report => report.id !== deleteId));
      setDeleteId(null);
      toast({ title: 'Deleted', description: 'Report deleted successfully.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete report.', variant: 'destructive' });
    }
    setDeleteLoading(false);
  };

  // Handle view report
  const handleViewReport = async (reportId: string) => {
    setViewLoading(true);
    try {
      const reportData = await apiClient.getReportData(reportId);
      setViewReport(reportData);
      setViewModalOpen(true);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to load report data.', variant: 'destructive' });
    }
    setViewLoading(false);
  };

  // Filtered reports
  const filteredReports = reports.filter(report =>
    report.name.toLowerCase().includes(search.toLowerCase()) ||
    report.type.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate statistics
  const totalReports = reports.length;
  const reportsByType = reports.reduce((acc, report) => {
    acc[report.type] = (acc[report.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const recentReports = reports.slice(0, 5);

  // Get type badge color
  const getTypeBadge = (type: string) => {
    const colors = {
      leads: 'bg-blue-100 text-blue-800',
      clients: 'bg-green-100 text-green-800',
      followups: 'bg-yellow-100 text-yellow-800',
      sales: 'bg-purple-100 text-purple-800',
      custom: 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || colors.custom;
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    const icons = {
      leads: Target,
      clients: Users,
      followups: Calendar,
      sales: DollarSign,
      custom: BarChart2
    };
    return icons[type as keyof typeof icons] || BarChart2;
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart2 className="h-8 w-8 text-primary" />
            </div>
            Reports
          </h1>
          <p className="text-muted-foreground mt-1">Generate and manage business reports</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Input
            placeholder="Search reports..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="sm:w-64"
          />
          <button
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium shadow hover:bg-primary/90 transition-colors flex items-center gap-2"
            onClick={openAddModal}
          >
            <Plus className="h-4 w-4" /> Generate Report
          </button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Reports</p>
              <p className="text-2xl font-bold">{totalReports}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Lead Reports</p>
              <p className="text-2xl font-bold">{reportsByType.leads || 0}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Client Reports</p>
              <p className="text-2xl font-bold">{reportsByType.clients || 0}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sales Reports</p>
              <p className="text-2xl font-bold">{reportsByType.sales || 0}</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold">All Reports</h2>
        </div>
        
        {loading ? (
          <div className="p-6 text-center text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            Loading reports...
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : filteredReports.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No reports found</h3>
            <p className="mb-4">Start by generating your first report to track your business metrics.</p>
            <button
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium shadow hover:bg-primary/90 transition-colors flex items-center gap-2 mx-auto"
              onClick={openAddModal}
            >
              <Plus className="h-4 w-4" /> Generate Report
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-4 text-left font-semibold">Report Name</th>
                  <th className="px-6 py-4 text-left font-semibold">Type</th>
                  <th className="px-6 py-4 text-left font-semibold">Created</th>
                  <th className="px-6 py-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => {
                  const TypeIcon = getTypeIcon(report.type);
                  return (
                    <tr key={report.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{report.name}</p>
                            <p className="text-xs text-muted-foreground">ID: {report.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-4 w-4 text-muted-foreground" />
                          <Badge className={getTypeBadge(report.type)}>
                            {report.type}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                            aria-label="View report"
                            onClick={() => handleViewReport(report.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                            aria-label="Download report"
                            onClick={() => {
                              // TODO: Implement download functionality
                              toast({ title: 'Download Report', description: 'Download functionality coming soon!' });
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                            aria-label="Edit report"
                            onClick={() => openEditModal(report)}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                className="p-2 rounded-lg hover:bg-destructive/20 text-destructive transition-colors"
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
                                  This action cannot be undone. This will permanently delete the report "{report.name}".
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
                                  {deleteLoading ? 'Deleting...' : 'Delete Report'}
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
              <BarChart2 className="h-5 w-5" />
              {editReport ? 'Edit Report' : 'Generate New Report'}
            </DialogTitle>
            <DialogDescription>
              {editReport ? 'Update the report details below.' : 'Fill in the details to generate a new report.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="name">Report Name</label>
              <Input 
                id="name" 
                name="name" 
                value={form.name} 
                onChange={(e) => handleFormChange('name', e.target.value)} 
                placeholder="Enter report name..."
                required 
                autoFocus 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="type">Report Type</label>
              <Select value={form.type} onValueChange={(value) => handleFormChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leads">Leads Report</SelectItem>
                  <SelectItem value="clients">Clients Report</SelectItem>
                  <SelectItem value="followups">Follow-ups Report</SelectItem>
                  <SelectItem value="sales">Sales Report</SelectItem>
                  <SelectItem value="custom">Custom Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="date">Report Date</label>
              <Input 
                id="date" 
                name="date" 
                type="date" 
                value={form.date} 
                onChange={(e) => handleFormChange('date', e.target.value)} 
                required 
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
                    {editReport ? 'Saving...' : 'Generating...'}
                  </>
                ) : (
                  <>
                    <BarChart2 className="h-4 w-4" />
                    {editReport ? 'Save Changes' : 'Generate Report'}
                  </>
                )}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Report Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {viewReport?.name || 'Report Details'}
            </DialogTitle>
            <DialogDescription>
              Detailed view of the report data and metrics.
            </DialogDescription>
          </DialogHeader>
          
          {viewLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : viewReport ? (
            <div className="space-y-6">
              {/* Report Header */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Report Name</p>
                    <p className="font-semibold">{viewReport.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Type</p>
                    <Badge className={getTypeBadge(viewReport.type)}>
                      {viewReport.type}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Created</p>
                    <p>{new Date(viewReport.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Report Data */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Report Data</h3>
                <div className="bg-card border border-border rounded-lg p-4">
                  <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(viewReport.data, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Summary Cards */}
              {viewReport.data && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {viewReport.data.totalLeads && (
                    <div className="bg-card border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                          <p className="text-2xl font-bold">{viewReport.data.totalLeads}</p>
                        </div>
                        <Target className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  )}
                  
                  {viewReport.data.totalClients && (
                    <div className="bg-card border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
                          <p className="text-2xl font-bold">{viewReport.data.totalClients}</p>
                        </div>
                        <Users className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  )}
                  
                  {viewReport.data.totalFollowUps && (
                    <div className="bg-card border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Follow-ups</p>
                          <p className="text-2xl font-bold">{viewReport.data.totalFollowUps}</p>
                        </div>
                        <Calendar className="h-6 w-6 text-yellow-600" />
                      </div>
                    </div>
                  )}
                  
                  {viewReport.data.totalDeals && (
                    <div className="bg-card border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Deals</p>
                          <p className="text-2xl font-bold">{viewReport.data.totalDeals}</p>
                        </div>
                        <DollarSign className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : null}
          
          <DialogFooter>
            <button
              onClick={() => setViewModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportsPage;