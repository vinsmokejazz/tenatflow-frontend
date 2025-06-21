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
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";

export default function ManageStaffPage() {
  // AUTH HOOKS FIRST
  const { user, loading: authLoading, hasRole } = useAuth();
  const router = useRouter();

  // ALL OTHER HOOKS NEXT
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "staff">("staff");
  const [loading, setLoading] = useState(false);
  const [staff, setStaff] = useState<any[]>([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [staffError, setStaffError] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<any | null>(null);
  const [editRole, setEditRole] = useState<"admin" | "staff">("staff");
  const [editLoading, setEditLoading] = useState(false);
  const [removeUser, setRemoveUser] = useState<any | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [resendLoadingId, setResendLoadingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [auditLogOpen, setAuditLogOpen] = useState(false);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);

  // Fetch staff list (API) - useCallback must be declared before useEffect
  const fetchStaff = useCallback(async () => {
    setStaffLoading(true);
    setStaffError(null);
    try {
      const data = await apiClient.getUsers(); // Should return array of users
      setStaff(data || []);
    } catch (error: any) {
      setStaffError(error.message || "Failed to fetch staff");
    }
    setStaffLoading(false);
  }, []);

  // AUTHORIZATION CHECK (NO HOOKS AFTER THIS)
  useEffect(() => {
    if (!authLoading && (!user || !hasRole('admin'))) {
      router.replace('/dashboard');
    }
  }, [authLoading, user, hasRole, router]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // Fetch audit log
  const fetchAuditLog = async () => {
    setAuditLoading(true);
    setAuditError(null);
    try {
      const data = await apiClient.getAuditLog();
      setAuditLog(data.auditLog || []);
    } catch (error: any) {
      setAuditError(error.message || 'Failed to fetch audit log');
    }
    setAuditLoading(false);
  };

  // Invite Staff
  const handleInviteStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiClient.createUser({ email, role });
      if (response.tempPassword) {
        toast.success(`Invitation sent to ${email}! Temporary password: ${response.tempPassword}`, {
          duration: 10000, // Show for 10 seconds
        });
      } else {
        toast.success(`Invitation sent to ${email}!`);
      }
      setEmail("");
      setRole("staff");
      setIsModalOpen(false);
      fetchStaff();
    } catch (error: any) {
      toast.error(error.message || "An error occurred while sending invitation");
    }
    setLoading(false);
  };

  // Edit Role
  const handleEditRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setEditLoading(true);
    try {
      await apiClient.updateUserById(editUser.id, { role: editRole });
      toast.success("Role updated successfully");
      setEditUser(null);
      fetchStaff();
    } catch (error: any) {
      toast.error(error.message || "Failed to update role");
    }
    setEditLoading(false);
  };

  // Remove Staff
  const handleRemoveUser = async () => {
    if (!removeUser) return;
    setRemoveLoading(true);
    try {
      await apiClient.deleteUser(removeUser.id);
      toast.success("Staff member removed");
      setRemoveUser(null);
      fetchStaff();
    } catch (error: any) {
      toast.error(error.message || "Failed to remove staff");
    }
    setRemoveLoading(false);
  };

  // Resend Invite
  const handleResendInvite = async (user: any) => {
    setResendLoadingId(user.id);
    try {
      const response = await apiClient.resendInvite(user.id);
      if (response.tempPassword) {
        toast.success(`Invitation resent to ${user.email}! New temporary password: ${response.tempPassword}`, {
          duration: 10000, // Show for 10 seconds
        });
      } else {
        toast.success(`Invitation resent to ${user.email}`);
      }
      fetchStaff();
    } catch (error: any) {
      toast.error(error.message || "Failed to resend invitation");
    }
    setResendLoadingId(null);
  };

  // Filtered staff
  const filteredStaff = staff.filter((user) => {
    const matchesSearch =
      !search ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      (user.name && user.name.toLowerCase().includes(search.toLowerCase()));
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen">Checking permissions...</div>;
  }
  if (!user || !hasRole('admin')) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">You do not have permission to access this page.</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Staff</h1>

      {/* Search and Filter */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <Button variant="secondary" onClick={() => { setAuditLogOpen(true); fetchAuditLog(); }}>
          View Audit Log
        </Button>
        <Input
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invite Staff Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen} aria-label="Invite Staff Dialog">
        <DialogTrigger asChild>
          <Button onClick={() => setIsModalOpen(true)} aria-label="Open Invite Staff Dialog">Invite New Staff</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]" aria-modal="true" role="dialog">
          <DialogHeader>
            <DialogTitle>Invite Staff Member</DialogTitle>
            <DialogDescription>
              Enter the email address and assign a role for the new staff member.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInviteStaff} className="grid gap-4 py-4" aria-label="Invite Staff Form">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="col-span-3"
                aria-required="true"
                aria-label="Staff Email"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">Role</Label>
              <Select value={role} onValueChange={(value: 'admin' | 'staff') => setRole(value)}>
                <SelectTrigger className="col-span-3" id="role" aria-label="Select Role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading} aria-label="Send Invitation">
                {loading ? 'Sending Invitation...' : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Staff List Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Existing Staff</h2>
        {staffLoading ? (
          <p>Loading staff...</p>
        ) : staffError ? (
          <p className="text-red-500">Error: {staffError}</p>
        ) : filteredStaff.length === 0 ? (
          <p className="text-muted-foreground">No staff members found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg" role="table" aria-label="Staff Table">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left" scope="col">Name</th>
                  <th className="px-4 py-2 text-left" scope="col">Email</th>
                  <th className="px-4 py-2 text-left" scope="col">Role</th>
                  <th className="px-4 py-2 text-left" scope="col">Status</th>
                  <th className="px-4 py-2 text-left" scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((user) => (
                  <tr key={user.id} className="border-t border-gray-100 dark:border-slate-700">
                    <td className="px-4 py-2">{user.name || "-"}</td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2 capitalize">{user.role}</td>
                    <td className="px-4 py-2">{user.status || "Active"}</td>
                    <td className="px-4 py-2 space-x-2">
                      <Button size="sm" variant="outline" onClick={() => { setEditUser(user); setEditRole(user.role); }} aria-label={`Edit ${user.email}`}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => setRemoveUser(user)} aria-label={`Remove ${user.email}`}>Remove</Button>
                      {user.status === "pending" && (
                        <Button size="sm" variant="secondary" onClick={() => handleResendInvite(user)} disabled={resendLoadingId === user.id} aria-label={`Resend Invite to ${user.email}`}>
                          {resendLoadingId === user.id ? "Resending..." : "Resend Invite"}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={!!editUser} onOpenChange={(open) => { if (!open) setEditUser(null); }} aria-label="Edit Role Dialog">
        <DialogContent className="sm:max-w-[400px]" aria-modal="true" role="dialog">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Change the role for <span className="font-semibold">{editUser?.email}</span>.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditRole} className="space-y-4" aria-label="Edit Role Form">
            <div>
              <Label htmlFor="editRole">Role</Label>
              <Select value={editRole} onValueChange={(value: 'admin' | 'staff') => setEditRole(value)}>
                <SelectTrigger id="editRole" aria-label="Select Role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={editLoading} aria-label="Save Role">{editLoading ? 'Saving...' : 'Save'}</Button>
              <Button type="button" variant="outline" onClick={() => setEditUser(null)} aria-label="Cancel Edit">Cancel</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Remove Staff Dialog */}
      <Dialog open={!!removeUser} onOpenChange={(open) => { if (!open) setRemoveUser(null); }} aria-label="Remove Staff Dialog">
        <DialogContent className="sm:max-w-[400px]" aria-modal="true" role="dialog">
          <DialogHeader>
            <DialogTitle>Remove Staff Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <span className="font-semibold">{removeUser?.email}</span>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="destructive" onClick={handleRemoveUser} disabled={removeLoading} aria-label="Confirm Remove">{removeLoading ? 'Removing...' : 'Remove'}</Button>
            <Button variant="outline" onClick={() => setRemoveUser(null)} aria-label="Cancel Remove">Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Audit Log Modal */}
      <Dialog open={auditLogOpen} onOpenChange={setAuditLogOpen} aria-label="Audit Log Dialog">
        <DialogContent className="sm:max-w-[600px]" aria-modal="true" role="dialog">
          <DialogHeader>
            <DialogTitle>Staff Audit Log</DialogTitle>
            <DialogDescription>Recent staff-related activities (invites, removals, role changes).</DialogDescription>
          </DialogHeader>
          {auditLoading ? (
            <p>Loading audit log...</p>
          ) : auditError ? (
            <p className="text-red-500">{auditError}</p>
          ) : auditLog.length === 0 ? (
            <p className="text-muted-foreground">No audit log entries found.</p>
          ) : (
            <ul className="space-y-2 max-h-96 overflow-y-auto" aria-label="Audit Log List">
              {auditLog.map((entry, idx) => (
                <li key={idx} className="border-b border-border pb-2" tabIndex={0} aria-label={`Audit log entry ${idx + 1}`}> 
                  <div className="font-medium">{entry.action}</div>
                  <div className="text-sm text-muted-foreground">{entry.userEmail} &mdash; {entry.timestamp}</div>
                  {entry.details && <div className="text-xs text-muted-foreground">{entry.details}</div>}
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
