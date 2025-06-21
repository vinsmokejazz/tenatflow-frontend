"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { UserCog, Users, Shield, Calendar, Search, Plus, Edit, Trash2, Filter } from 'lucide-react';

export default function StaffManagementPage() {
  const { user, loading: authLoading, hasRole } = useAuth();
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"admin" | "staff">("staff");
  const [loading, setLoading] = useState(false);
  const [staff, setStaff] = useState<any[]>([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [staffError, setStaffError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchStaff = useCallback(async () => {
    setStaffLoading(true);
    setStaffError(null);
    try {
      const data = await apiClient.getUsers();
      setStaff(data || []);
    } catch (error: any) {
      setStaffError(error.message || "Failed to fetch staff");
    }
    setStaffLoading(false);
  }, []);

  useEffect(() => {
    if (!authLoading && (!user || !hasRole('admin'))) {
      router.replace('/dashboard');
    }
  }, [authLoading, user, hasRole, router]);

  useEffect(() => {
    if (user && hasRole('admin')) {
      fetchStaff();
    }
  }, [fetchStaff, user, hasRole]);

  const handleInviteStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.createUser({ email, name, role });
      toast.success(`Invitation sent to ${email}!`);
      setEmail("");
      setName("");
      setRole("staff");
      setIsModalOpen(false);
      fetchStaff();
    } catch (error: any) {
      toast.error(error.message || "An error occurred while sending invitation");
    }
    setLoading(false);
  };

  const handleDeleteStaff = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await apiClient.deleteUser(deleteId);
      setStaff(prevStaff => prevStaff.filter(staffMember => staffMember.id !== deleteId));
      setDeleteId(null);
      toast.success("Staff member deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete staff member");
    }
    setDeleteLoading(false);
  };

  const filteredStaff = staff.filter((staffMember) => {
    const matchesSearch =
      !search ||
      staffMember.email.toLowerCase().includes(search.toLowerCase()) ||
      (staffMember.name && staffMember.name.toLowerCase().includes(search.toLowerCase()));
    
    const matchesRoleFilter = 
      roleFilter === "all" || 
      staffMember.role === roleFilter;
    
    return matchesSearch && matchesRoleFilter;
  });

  const staffStats = {
    totalStaff: staff.length,
    admins: staff.filter(staffMember => staffMember.role === 'admin').length,
    staffMembers: staff.filter(staffMember => staffMember.role === 'staff').length,
  };

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen">Checking permissions...</div>;
  }
  if (!user || !hasRole('admin')) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">You do not have permission to access this page.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <UserCog className="h-8 w-8 text-primary" />
            </div>
            Staff Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage your team members and their roles</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Invite Staff
        </Button>
      </div>

      {/* Statistics Dashboard */}
      {!staffLoading && !staffError && staff.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Staff</p>
                <p className="text-2xl font-bold text-foreground">{staffStats.totalStaff}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold text-foreground">{staffStats.admins}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Staff Members</p>
                <p className="text-2xl font-bold text-foreground">{staffStats.staffMembers}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold">All Staff Members</h2>
        </div>
        
        {staffLoading ? (
          <div className="p-6 text-center text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            Loading staff members...
          </div>
        ) : staffError ? (
          <div className="p-6 text-center text-red-500">
            <p className="text-red-600 font-medium mb-2">Error loading staff</p>
            <p className="text-sm text-muted-foreground">{staffError}</p>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No staff members found</h3>
            <p className="mb-4">
              {search || roleFilter !== "all" ? 'No staff members match your search criteria.' : 'Start by inviting your first team member.'}
            </p>
            <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 mx-auto">
              <Plus className="h-4 w-4" /> Invite Staff
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-4 text-left font-semibold">User</th>
                  <th className="px-6 py-4 text-left font-semibold">Role</th>
                  <th className="px-6 py-4 text-left font-semibold">Joined</th>
                  <th className="px-6 py-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((staffMember) => (
                  <tr key={staffMember.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{staffMember.name || 'No name'}</p>
                          <p className="text-xs text-muted-foreground">{staffMember.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        staffMember.role === 'admin' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {staffMember.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(staffMember.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {staffMember.id !== user?.id ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                className="p-2 rounded-lg hover:bg-destructive/20 text-destructive transition-colors"
                                aria-label="Delete staff member"
                                onClick={() => setDeleteId(staffMember.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Staff Member?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete {staffMember.name || staffMember.email} from your team.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setDeleteId(null)}>
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleDeleteStaff}
                                  disabled={deleteLoading}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {deleteLoading ? 'Deleting...' : 'Delete Staff Member'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <span className="text-xs text-muted-foreground">Current user</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite Staff Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Staff Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your team. They will receive an email with setup instructions.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInviteStaff}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(value: "admin" | "staff") => setRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Invitation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 