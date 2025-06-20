'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: user?.user_metadata?.name || '',
    company: user?.user_metadata?.company || '',
  });
  const [loading, setLoading] = useState(false);
  const [business, setBusiness] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);

  React.useEffect(() => {
    // Fetch business and subscription info if available
    const fetchBusiness = async () => {
      try {
        const data = await apiClient.getBusiness();
        setBusiness(data.business || data);
        setSubscription(data.subscription || null);
      } catch (err) {
        // ignore for now
      }
    };
    fetchBusiness();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.updateUser({ name: form.name, company: form.company });
      toast({ title: 'Profile updated', description: 'Your details have been updated.' });
      setEditMode(false);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to update profile', variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <CardDescription>View and edit your profile information.</CardDescription>
        </CardHeader>
        <CardContent>
          {editMode ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium" htmlFor="name">Name</label>
                <Input id="name" name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div>
                <label className="block mb-1 font-medium" htmlFor="company">Company</label>
                <Input id="company" name="company" value={form.company} onChange={handleChange} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
                <Button type="button" variant="outline" onClick={() => setEditMode(false)}>Cancel</Button>
              </div>
            </form>
          ) : (
            <div className="space-y-2">
              <div><span className="font-medium">Name:</span> {form.name || '-'}</div>
              <div><span className="font-medium">Email:</span> {user?.email}</div>
              <div><span className="font-medium">Role:</span> <span className="capitalize">{user?.user_metadata?.role || 'N/A'}</span></div>
              <div><span className="font-medium">Company:</span> {form.company || '-'}</div>
              <Button className="mt-2" variant="outline" onClick={() => setEditMode(true)}>Edit</Button>
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Business Info</CardTitle>
          <CardDescription>Details about your business.</CardDescription>
        </CardHeader>
        <CardContent>
          {business ? (
            <div className="space-y-2">
              <div><span className="font-medium">Business Name:</span> {business.name || '-'}</div>
              <div><span className="font-medium">Type:</span> {business.type || '-'}</div>
              <div><span className="font-medium">Address:</span> {business.address || '-'}</div>
              {/* Add more business fields as needed */}
            </div>
          ) : (
            <div className="text-muted-foreground">No business info available.</div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Your current plan and status.</CardDescription>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="space-y-2">
              <div><span className="font-medium">Plan:</span> {subscription.plan || '-'}</div>
              <div><span className="font-medium">Status:</span> {subscription.status || '-'}</div>
              <div><span className="font-medium">Renewal Date:</span> {subscription.renewalDate || '-'}</div>
              {/* Add more subscription fields as needed */}
            </div>
          ) : (
            <div className="text-muted-foreground">No subscription info available.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage; 