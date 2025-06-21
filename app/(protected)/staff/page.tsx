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
import { UserCog, Users, Shield, Calendar, Search, Plus, Edit, Trash2, Filter, User, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function StaffManagementPage() {
  const { user, loading: authLoading, hasRole } = useAuth();
  const router = useRouter();

  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"admin" | "staff">("staff");
  const [inviteLoading, setInviteLoading] = useState(false);
  
  const [editUser, setEditUser] = useState<any | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const [staff, setStaff] = useState<any[]>([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [staffError, setStaffError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const openInviteModal = () => {
    setEmail("");
    setName("");
    setRole("staff");
    setInviteModalOpen(true);
  };

  const openEditModal = (userToEdit: any) => {
    setEditUser(userToEdit);
    setName(userToEdit.name || '');
    setRole(userToEdit.role);
    setEditModalOpen(true);
  };

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
    setInviteLoading(true);
    try {
      const response = await apiClient.createUser({ email, name, role });
      if (response.tempPassword) {
        toast.success(`Invitation sent to ${email}! Temporary password: ${response.tempPassword}`, {
          duration: 10000, // Show for 10 seconds
        });
      } else {
        toast.success(`Invitation sent to ${email}!`);
      }
      setInviteModalOpen(false);
      fetchStaff();
    } catch (error: any) {
      toast.error(error.message || "An error occurred while sending invitation");
    }
    setInviteLoading(false);
  };

  const handleEditStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setEditLoading(true);
    try {
      const payload: { name: string; role: 'admin' | 'staff'; } = { name, role };
      await apiClient.updateUserById(editUser.id, payload);
      toast.success("Staff member updated successfully!");
      setEditModalOpen(false);
      fetchStaff();
    } catch (error: any) {
      toast.error(error.message || "An error occurred while updating staff member");
    }
    setEditLoading(false);
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
    total: staff.length,
    admins: staff.filter(s => s.role === 'admin').length,
    pending: staff.filter(s => !s.name).length, // Example: users without a name are pending
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
        <Button onClick={openInviteModal} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Invite Staff
        </Button>
      </div>

      {/* Statistics Dashboard */}
      {!staffLoading && !staffError && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Staff</p>
                <p className="text-2xl font-bold">{staffStats.total}</p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-950/30 rounded-lg">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">{staffStats.admins}</p>
              </div>
              <div className="p-2 bg-purple-100 dark:bg-purple-950/30 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Invites</p>
                <p className="text-2xl font-bold">{staffStats.pending}</p>
              </div>
              <div className="p-2 bg-yellow-100 dark:bg-yellow-950/30 rounded-lg">
                <Mail className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
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
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {filteredStaff.length} Staff Member{filteredStaff.length === 1 ? '' : 's'}
          </h2>
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
            <Button onClick={openInviteModal} className="flex items-center gap-2 mx-auto">
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
                      <Badge variant={staffMember.role === 'admin' ? 'default' : 'secondary'}>
                        {staffMember.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(staffMember.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Edit user"
                          onClick={() => openEditModal(staffMember)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              aria-label="Delete user"
                              onClick={() => setDeleteId(staffMember.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
      <Dialog open={isInviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite New Staff Member</DialogTitle>
            <DialogDescription>
              Enter the details of the new staff member. They will receive an email to set up their account.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInviteStaff} className="space-y-4 py-2">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@example.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select onValueChange={(value: "admin" | "staff") => setRole(value)} defaultValue={role}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setInviteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={inviteLoading}
                className="flex items-center gap-2"
              >
                {inviteLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    Send Invite
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Staff Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription>
              Update the details for {editUser?.email}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditStaff} className="space-y-4 py-2">
            <div>
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-role">Role</Label>
              <Select onValueChange={(value: "admin" | "staff") => setRole(value)} defaultValue={role}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={editLoading}
                className="flex items-center gap-2"
              >
                {editLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <UserCog className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 