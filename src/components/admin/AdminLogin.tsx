import React, { useState, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { checkAdminExists, setPassword, verifyPassword } from '@/lib/db';

interface AdminLoginProps {
  onLogin: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [password, setPasswordInput] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false);
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const exists = await checkAdminExists();
        setIsFirstTimeSetup(!exists);
      } catch (error) {
        console.error('Failed to check admin:', error);
        toast({
          title: 'Error',
          description: 'Failed to initialize admin system',
          variant: 'destructive',
        });
      } finally {
        setIsChecking(false);
      }
    };

    checkAdmin();
  }, [toast]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isFirstTimeSetup) {
        // First time setup - validate and set password
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setIsSubmitting(false);
          return;
        }

        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setIsSubmitting(false);
          return;
        }

        await setPassword(password);
        sessionStorage.setItem('admin-auth', 'authenticated');
        toast({
          title: 'Success',
          description: 'Admin password set successfully',
        });
        onLogin();
      } else {
        // Verify password
        const isValid = await verifyPassword(password);
        if (isValid) {
          sessionStorage.setItem('admin-auth', 'authenticated');
          toast({
            title: 'Success',
            description: 'Logged in successfully',
          });
          onLogin();
        } else {
          setError('Invalid password');
          toast({
            title: 'Error',
            description: 'Invalid password',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred. Please try again.');
      toast({
        title: 'Error',
        description: 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gym-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md p-6 md:p-8 shadow-player">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            FastFit <span className="text-foreground">Admin</span>
          </h1>
          <p className="text-muted-foreground">
            {isFirstTimeSetup ? 'Create your admin password' : 'Enter your admin password'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder={isFirstTimeSetup ? 'Create password (min 6 characters)' : 'Enter password'}
              required
              disabled={isSubmitting}
            />
          </div>

          {isFirstTimeSetup && (
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                disabled={isSubmitting}
              />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full bg-gradient-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : (isFirstTimeSetup ? 'Set Password & Login' : 'Login')}
          </Button>
        </form>

        {isFirstTimeSetup && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>First Time Setup:</strong> Create a secure password to protect your admin panel.
              This password will be required to access the admin area.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminLogin;
