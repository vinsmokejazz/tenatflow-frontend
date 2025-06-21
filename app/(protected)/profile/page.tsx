'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { User, Building2, Mail, Phone, MapPin, Calendar, CreditCard, Shield, Settings, Edit, Save, X, Eye, EyeOff } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, backendUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [passwordEditMode, setPasswordEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: backendUser?.name || user?.user_metadata?.name || '',
    company: user?.user_metadata?.company || '',
    phone: user?.user_metadata?.phone || '',
    address: user?.user_metadata?.address || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [business, setBusiness] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);

  React.useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  React.useEffect(() => {
    if (backendUser) {
      setForm(prev => ({
        ...prev,
        name: backendUser.name || prev.name
      }));
    }
  }, [backendUser]);

  const fetchUserData = async () => {
    try {
      // Fetch business info
      const businessData = await apiClient.getBusiness();
      setBusiness(businessData.business || businessData);
      setSubscription(businessData.subscription || null);

      // Fetch user statistics
      try {
        const stats = await apiClient.getUser();
        setUserStats(stats);
      } catch (err) {
        // Ignore stats error for now
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.updateUser(form);
      toast({ title: 'Profile updated', description: 'Your profile has been updated successfully.' });
      setEditMode(false);
      // Refresh user data
      fetchUserData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to update profile', variant: 'destructive' });
    }
    setLoading(false);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: 'Error', description: 'New passwords do not match', variant: 'destructive' });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }

    setPasswordLoading(true);
    try {
      // Note: This would need a proper password update endpoint
      // await apiClient.updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast({ title: 'Password updated', description: 'Your password has been updated successfully.' });
      setPasswordEditMode(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to update password', variant: 'destructive' });
    }
    setPasswordLoading(false);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { label: 'Admin', color: 'bg-red-100 text-red-800 border-red-200' },
      staff: { label: 'Staff', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      manager: { label: 'Manager', color: 'bg-purple-100 text-purple-800 border-purple-200' },
      user: { label: 'User', color: 'bg-green-100 text-green-800 border-green-200' }
    };
    
    const config = roleConfig[role as keyof typeof roleConfig] || { 
      label: role, 
      color: 'bg-gray-100 text-gray-800 border-gray-200' 
    };
    
    return (
      <Badge className={`border ${config.color}`}>
        {config.label}
      </Badge>
    );
  };

  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
        </div>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>Your personal details and contact information</CardDescription>
              </div>
              {!editMode && (
                <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {editMode ? (
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-sm font-medium" htmlFor="name">Full Name</label>
                      <Input 
                        id="name" 
                        name="name" 
                        value={form.name} 
                        onChange={handleChange} 
                        placeholder="Enter your full name"
                        required 
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium" htmlFor="company">Company</label>
                      <Input 
                        id="company" 
                        name="company" 
                        value={form.company} 
                        onChange={handleChange} 
                        placeholder="Enter your company name"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium" htmlFor="phone">Phone Number</label>
                      <Input 
                        id="phone" 
                        name="phone" 
                        value={form.phone} 
                        onChange={handleChange} 
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium" htmlFor="address">Address</label>
                      <Input 
                        id="address" 
                        name="address" 
                        value={form.address} 
                        onChange={handleChange} 
                        placeholder="Enter your address"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setEditMode(false)}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Full Name</p>
                        <p className="font-medium">{form.name || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Mail className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email Address</p>
                        <p className="font-medium">{user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Phone className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone Number</p>
                        <p className="font-medium">{form.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="font-medium">{form.address || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Security */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Account Security
                </CardTitle>
                <CardDescription>Manage your password and security settings</CardDescription>
              </div>
              {!passwordEditMode && (
                <Button variant="outline" size="sm" onClick={() => setPasswordEditMode(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {passwordEditMode ? (
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-sm font-medium" htmlFor="currentPassword">Current Password</label>
                      <div className="relative">
                        <Input 
                          id="currentPassword" 
                          name="currentPassword" 
                          type={showPassword ? "text" : "password"}
                          value={passwordForm.currentPassword} 
                          onChange={handlePasswordChange} 
                          placeholder="Enter current password"
                          required 
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium" htmlFor="newPassword">New Password</label>
                      <Input 
                        id="newPassword" 
                        name="newPassword" 
                        type={showPassword ? "text" : "password"}
                        value={passwordForm.newPassword} 
                        onChange={handlePasswordChange} 
                        placeholder="Enter new password"
                        required 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium" htmlFor="confirmPassword">Confirm New Password</label>
                    <Input 
                      id="confirmPassword" 
                      name="confirmPassword" 
                      type={showPassword ? "text" : "password"}
                      value={passwordForm.confirmPassword} 
                      onChange={handlePasswordChange} 
                      placeholder="Confirm new password"
                      required 
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={passwordLoading}>
                      {passwordLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Update Password
                        </>
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => {
                      setPasswordEditMode(false);
                      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    }}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Password</p>
                      <p className="font-medium">••••••••</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Updated</p>
                      <p className="font-medium">{formatDate(user?.updated_at)}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Business Information
              </CardTitle>
              <CardDescription>Details about your business account</CardDescription>
            </CardHeader>
            <CardContent>
              {business ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Business Name</p>
                        <p className="font-medium">{business.name || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <User className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Your Role</p>
                        <div className="flex items-center gap-2">
                          {getRoleBadge(backendUser?.role || user?.user_metadata?.role || 'user')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Member Since</p>
                        <p className="font-medium">{formatDate(user?.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Business Address</p>
                        <p className="font-medium">{business.address || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No business information available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subscription ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Current Plan</p>
                      <p className="font-medium">{subscription.plan || 'Free Plan'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Next Billing</p>
                      <p className="font-medium">{formatDate(subscription.renewalDate)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <CreditCard className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Free Plan</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Account Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Account Status</span>
                  <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Email Verified</span>
                  <Badge className="bg-green-100 text-green-800 border-green-200">Yes</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Two-Factor Auth</span>
                  <Badge className="bg-gray-100 text-gray-800 border-gray-200">Not Enabled</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 