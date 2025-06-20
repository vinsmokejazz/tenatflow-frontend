'use client';

import React from 'react';
import { Sun, Moon, User, Settings, Bell, LogOut, MoreHorizontal, UploadCloud } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';

const TopNavbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = React.useState(user?.user_metadata?.avatar_url || '');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [notifEnabled, setNotifEnabled] = React.useState(true);

  React.useEffect(() => { setMounted(true); }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // TODO: Upload logic here (e.g., to Supabase or backend)
    // For now, just show preview
    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
    // Optionally: update user profile in backend
  };

  return (
    <header className="h-16 w-full flex items-center justify-between px-6 bg-card border-b border-border shadow-sm z-10">
      {/* App Title/Logo */}
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold tracking-tight">TenantFlow</span>
      </div>
      {/* Right Section: Profile & Theme Toggle */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          className="p-2 rounded hover:bg-muted transition-colors"
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {mounted && (theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />)}
        </button>
        {/* User Profile Dropdown */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="flex items-center gap-2 px-3 py-2 rounded hover:bg-muted transition-colors"
              aria-label="Open profile dropdown"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatarUrl} alt={user?.user_metadata?.name || user?.email || 'User'} />
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm font-medium">
                {user?.email || 'User'}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0 border-none shadow-xl">
            <div className="rounded-lg bg-card p-4 flex flex-col gap-4">
              {/* Avatar + Upload */}
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={avatarUrl} alt={user?.user_metadata?.name || user?.email || 'User'} />
                    <AvatarFallback>
                      <User className="h-7 w-7" />
                    </AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 bg-background border rounded-full p-1 shadow group-hover:opacity-100 opacity-80 transition"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Upload avatar"
                  >
                    <UploadCloud className="h-4 w-4 text-primary" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <div>
                  <div className="font-semibold text-base">{user?.user_metadata?.name || user?.email || 'User'}</div>
                  <div className="text-muted-foreground text-xs">{user?.email}</div>
                  <div className="text-xs mt-1">Role: <span className="capitalize">{user?.user_metadata?.role || 'N/A'}</span></div>
                </div>
              </div>
              {/* Quick Settings */}
              <div className="border-t pt-3 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm"><Sun className="h-4 w-4" /> Theme</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-2"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    aria-label="Toggle theme"
                  >
                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm"><Bell className="h-4 w-4" /> Notifications</span>
                  <Switch checked={notifEnabled} onCheckedChange={setNotifEnabled} />
                </div>
              </div>
              {/* More Actions */}
              <div className="border-t pt-3 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="text-sm">Account Settings</span>
                </div>
                <div className="flex items-center gap-2">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="text-sm">More Actions</span>
                </div>
              </div>
              {/* Profile & Sign Out */}
              <div className="flex flex-col gap-2 mt-2">
                <Button variant="outline" className="w-full" onClick={() => router.push('/profile')}>
                  View More / Edit
                </Button>
                <Button variant="destructive" className="w-full" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
};

export default TopNavbar;