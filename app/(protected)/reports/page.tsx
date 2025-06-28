'use client';

import React, { useRef } from 'react';
import { BarChart2, FileText, Calendar, Edit, Trash2, Plus, Download, Eye, TrendingUp, Users, Target, DollarSign, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  const reportContentRef = useRef<HTMLDivElement>(null);

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
    const typeConfig = {
      leads: { label: 'Leads', variant: 'info' as const, icon: <Target className="h-4 w-4" /> },
      clients: { label: 'Clients', variant: 'success' as const, icon: <Users className="h-4 w-4" /> },
      followups: { label: 'Follow-ups', variant: 'warning' as const, icon: <Calendar className="h-4 w-4" /> },
      sales: { label: 'Sales', variant: 'secondary' as const, icon: <DollarSign className="h-4 w-4" /> },
      custom: { label: 'Custom', variant: 'outline' as const, icon: <BarChart2 className="h-4 w-4" /> }
    };
    const config = typeConfig[type.toLowerCase() as keyof typeof typeConfig] || typeConfig.custom;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-2">
        {config.icon}
        {config.label}
      </Badge>
    );
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

  const formatStatus = (status: string) => {
    const stageConfig = {
      pending: { label: 'Pending', variant: 'warning' as const, icon: <Clock className="h-4 w-4" /> },
      generating: { label: 'Generating', variant: 'info' as const, icon: <RefreshCw className="h-4 w-4 animate-spin" /> },
      completed: { label: 'Completed', variant: 'success' as const, icon: <CheckCircle className="h-4 w-4" /> },
      failed: { label: 'Failed', variant: 'destructive' as const, icon: <XCircle className="h-4 w-4" /> }
    };
    
    const config = stageConfig[status.toLowerCase() as keyof typeof stageConfig] || { 
      label: status, 
      variant: 'outline' as const,
      icon: <FileText className="h-4 w-4" />
    };
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-2">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  // PDF Download Handler
  const handleDownloadPDF = async () => {
    if (!reportContentRef.current) return;
    const input = reportContentRef.current;
    const canvas = await html2canvas(input, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    // Calculate image dimensions to fit A4
    const imgWidth = pageWidth - 40;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight);
    pdf.save(`${viewReport?.name || 'report'}.pdf`);
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
          <Button
            onClick={openAddModal}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Generate Report
          </Button>
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
            <div className="p-2 bg-blue-100 dark:bg-blue-950/30 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Lead Reports</p>
              <p className="text-2xl font-bold">{reportsByType['leads'] || 0}</p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-950/30 rounded-lg">
              <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sales Reports</p>
              <p className="text-2xl font-bold">{reportsByType['sales'] || 0}</p>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-950/30 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Client Reports</p>
              <p className="text-2xl font-bold">{reportsByType['clients'] || 0}</p>
            </div>
            <div className="p-2 bg-yellow-100 dark:bg-yellow-950/30 rounded-lg">
              <Users className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
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
            <Button
              onClick={openAddModal}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium shadow hover:bg-primary/90 transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus className="h-4 w-4" /> Generate Report
            </Button>
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
                          {getTypeBadge(report.type)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleViewReport(report.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => openEditModal(report)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => setDeleteId(report.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
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
              {editReport ? 'Update the details of your report.' : 'Fill in the details to generate a new report.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 py-2">
            <div>
              <Label htmlFor="name">Report Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={e => handleFormChange('name', e.target.value)}
                placeholder="e.g., Q4 Sales Performance"
                required
              />
            </div>
            <div>
              <Label htmlFor="type">Report Type</Label>
              <Select value={form.type} onValueChange={value => handleFormChange('type', value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leads">Leads Analysis</SelectItem>
                  <SelectItem value="clients">Client Summary</SelectItem>
                  <SelectItem value="followups">Follow-ups Overview</SelectItem>
                  <SelectItem value="sales">Sales Performance</SelectItem>
                  <SelectItem value="custom">Custom Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date">Report Date</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={e => handleFormChange('date', e.target.value)}
                required
              />
            </div>
            {formError && <p className="text-sm text-red-500">{formError}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={formLoading} className="flex items-center gap-2">
                {formLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {editReport ? 'Saving...' : 'Generating...'}
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    {editReport ? 'Save Changes' : 'Generate'}
                  </>
                )}
              </Button>
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
          
          {/* PDF content wrapper */}
          <div ref={reportContentRef} className="print:bg-white">
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
                      {getTypeBadge(viewReport.type)}
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
                  
                  {/* Display report data based on type */}
                  {viewReport.type === 'leads' && viewReport.data && (
                    <div className="space-y-6">
                      {/* Leads Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-card border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                              <p className="text-2xl font-bold">{viewReport.data.totalLeads || 0}</p>
                            </div>
                            <Target className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        
                        <div className="bg-card border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                              <p className="text-2xl font-bold">{viewReport.data.conversionRate ? `${viewReport.data.conversionRate.toFixed(1)}%` : '0%'}</p>
                            </div>
                            <TrendingUp className="h-6 w-6 text-green-600" />
                          </div>
                        </div>
                      </div>

                      {/* Leads by Status */}
                      {viewReport.data.leadsByStatus && viewReport.data.leadsByStatus.length > 0 && (
                        <div className="bg-card border border-border rounded-lg p-4">
                          <h4 className="text-md font-semibold mb-4">Leads by Status</h4>
                          <div className="space-y-2">
                            {viewReport.data.leadsByStatus.map((status: any, index: number) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                <span className="capitalize font-medium">{status.status}</span>
                                <Badge variant="secondary">{status._count.status}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recent Leads */}
                      {viewReport.data.recentLeads && viewReport.data.recentLeads.length > 0 && (
                        <div className="bg-card border border-border rounded-lg p-4">
                          <h4 className="text-md font-semibold mb-4">Recent Leads</h4>
                          <div className="space-y-2">
                            {viewReport.data.recentLeads.slice(0, 5).map((lead: any) => (
                              <div key={lead.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                <div>
                                  <p className="font-medium">{lead.client?.name || 'Unknown Client'}</p>
                                  <p className="text-sm text-muted-foreground">{lead.status}</p>
                                </div>
                                <Badge variant="outline">{new Date(lead.createdAt).toLocaleDateString()}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {viewReport.type === 'clients' && viewReport.data && (
                    <div className="space-y-6">
                      {/* Clients Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-card border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
                              <p className="text-2xl font-bold">{viewReport.data.totalClients || 0}</p>
                            </div>
                            <Users className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        
                        <div className="bg-card border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">With Leads</p>
                              <p className="text-2xl font-bold">{viewReport.data.clientsWithLeads || 0}</p>
                            </div>
                            <Target className="h-6 w-6 text-green-600" />
                          </div>
                        </div>
                        
                        <div className="bg-card border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">With Deals</p>
                              <p className="text-2xl font-bold">{viewReport.data.clientsWithDeals || 0}</p>
                            </div>
                            <DollarSign className="h-6 w-6 text-purple-600" />
                          </div>
                        </div>
                      </div>

                      {/* Top Clients */}
                      {viewReport.data.topClients && viewReport.data.topClients.length > 0 && (
                        <div className="bg-card border border-border rounded-lg p-4">
                          <h4 className="text-md font-semibold mb-4">Top Clients by Lead Count</h4>
                          <div className="space-y-2">
                            {viewReport.data.topClients.map((client: any) => (
                              <div key={client.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                <div>
                                  <p className="font-medium">{client.name}</p>
                                  <p className="text-sm text-muted-foreground">{client.email}</p>
                                </div>
                                <div className="text-right">
                                  <Badge variant="secondary">{client._count.leads} leads</Badge>
                                  <p className="text-xs text-muted-foreground mt-1">{client._count.deals} deals</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {viewReport.type === 'followups' && viewReport.data && (
                    <div className="space-y-6">
                      {/* Follow-ups Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-card border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Total Follow-ups</p>
                              <p className="text-2xl font-bold">{viewReport.data.totalFollowUps || 0}</p>
                            </div>
                            <Calendar className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        
                        <div className="bg-card border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Completed</p>
                              <p className="text-2xl font-bold">{viewReport.data.completed || 0}</p>
                            </div>
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          </div>
                        </div>
                        
                        <div className="bg-card border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Pending</p>
                              <p className="text-2xl font-bold">{viewReport.data.pending || 0}</p>
                            </div>
                            <Clock className="h-6 w-6 text-yellow-600" />
                          </div>
                        </div>
                        
                        <div className="bg-card border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                              <p className="text-2xl font-bold">{viewReport.data.overdue || 0}</p>
                            </div>
                            <XCircle className="h-6 w-6 text-red-600" />
                          </div>
                        </div>
                      </div>

                      {/* Completion Rate */}
                      <div className="bg-card border border-border rounded-lg p-4">
                        <h4 className="text-md font-semibold mb-4">Completion Rate</h4>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="w-full bg-muted rounded-full h-4">
                              <div 
                                className="bg-primary h-4 rounded-full transition-all duration-300"
                                style={{ width: `${viewReport.data.completionRate || 0}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-lg font-semibold">{viewReport.data.completionRate ? `${viewReport.data.completionRate.toFixed(1)}%` : '0%'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {viewReport.type === 'sales' && viewReport.data && (
                    <div className="space-y-6">
                      {/* Sales Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-card border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Total Deals</p>
                              <p className="text-2xl font-bold">{viewReport.data.totalDeals || 0}</p>
                            </div>
                            <DollarSign className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        
                        <div className="bg-card border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                              <p className="text-2xl font-bold">${viewReport.data.totalValue ? viewReport.data.totalValue.toLocaleString() : '0'}</p>
                            </div>
                            <TrendingUp className="h-6 w-6 text-green-600" />
                          </div>
                        </div>
                        
                        <div className="bg-card border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Average Deal</p>
                              <p className="text-2xl font-bold">${viewReport.data.averageDealValue ? viewReport.data.averageDealValue.toLocaleString() : '0'}</p>
                            </div>
                            <BarChart2 className="h-6 w-6 text-purple-600" />
                          </div>
                        </div>
                      </div>

                      {/* Deals by Stage */}
                      {viewReport.data.dealsByStage && viewReport.data.dealsByStage.length > 0 && (
                        <div className="bg-card border border-border rounded-lg p-4">
                          <h4 className="text-md font-semibold mb-4">Deals by Stage</h4>
                          <div className="space-y-2">
                            {viewReport.data.dealsByStage.map((stage: any, index: number) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                <div>
                                  <span className="capitalize font-medium">{stage.stage}</span>
                                  <p className="text-sm text-muted-foreground">{stage._count.stage} deals</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold">${stage._sum.value ? stage._sum.value.toLocaleString() : '0'}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Fallback for other report types or if data structure is different */}
                  {(!viewReport.data || (viewReport.type !== 'leads' && viewReport.type !== 'clients' && viewReport.type !== 'followups' && viewReport.type !== 'sales')) && (
                    <div className="bg-card border border-border rounded-lg p-4">
                      <h4 className="text-md font-semibold mb-4">Report Data</h4>
                      <div className="bg-muted/50 rounded-lg p-4">
                        <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(viewReport.data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button onClick={() => setViewModalOpen(false)} variant="outline">Close</Button>
            <Button className="flex items-center gap-2" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportsPage;