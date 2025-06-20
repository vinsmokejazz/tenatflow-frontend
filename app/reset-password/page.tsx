"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase"; // Adjust the import path as needed
import { Button } from "@/components/ui/button"; // Adjust the import path as needed
import { Input } from "@/components/ui/input"; // Adjust the import path as needed
import { Label } from "@/components/ui/label"; // Adjust the import path as needed
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"; // Adjust the import path as needed
import { useToast } from "@/hooks/use-toast"; // Adjust the import path as needed

const supabase = createClientComponentClient<Database>();

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    // Supabase automatically handles the token exchange for the user session
    // upon landing on this page via the email link.
    // We can check if a session exists to confirm token validity.
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        setIsValidToken(true);
      } else {
        // Redirect or show an error if the token is invalid or expired
        toast({
          title: "Invalid or expired token",
          description: "Please request a new password reset link.",
          variant: "destructive",
        });
        // Optional: Redirect to forgot password page or home
        // router.push('/forgot-password');
      }
    };

    checkSession();
  }, [toast]); // Re-run if toast hook changes (unlikely, but good practice)


  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please ensure the passwords match.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (!password) {
         toast({
            title: "Password cannot be empty",
            description: "Please enter a new password.",
            variant: "destructive",
         });
         setIsSubmitting(false);
         return;
    }


    // The user's session should already be established by Supabase when landing on this page.
    // We can directly update the user's password.
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast({
        title: "Error resetting password",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Password reset successful",
        description: "You can now sign in with your new password.",
      });
      router.push("/signin"); // Redirect to signin page after successful reset
    }

    setIsSubmitting(false);
  };

  if (!isValidToken) {
    // Optionally render a loading state or a message while checking token validity,
    // or if the token is found to be invalid after the effect runs.
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Checking token validity...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>Enter your new password below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}