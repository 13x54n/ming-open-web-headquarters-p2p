'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function UserProfile() {
  const { currentUser, logout, updateUserProfile } = useAuth();
  const [newDisplayName, setNewDisplayName] = useState(currentUser?.displayName || '');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleUpdateProfile() {
    if (!newDisplayName.trim()) {
      setError('Display name cannot be empty');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setLoading(true);
      await updateUserProfile(newDisplayName);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      setError('Failed to update profile');
      console.error('Update profile error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">User Profile</CardTitle>
          <CardDescription className="text-center">
            Manage your account information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm bg-destructive/15 text-destructive rounded-md border border-destructive/25">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 text-sm bg-green-500/15 text-green-600 dark:text-green-400 rounded-md border border-green-500/25">
              {success}
            </div>
          )}

          <div className="flex items-center space-x-4">
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt="Profile"
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <span className="text-2xl text-muted-foreground">
                  {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
                </span>
              </div>
            )}
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold">
                {currentUser.displayName || 'No display name'}
              </h3>
              <p className="text-muted-foreground">{currentUser.email}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              {isEditing ? (
                <div className="flex space-x-2 mt-1">
                  <Input
                    id="displayName"
                    type="text"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    size="sm"
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setNewDisplayName(currentUser.displayName || '');
                      setError('');
                    }}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm">
                    {currentUser.displayName || 'No display name set'}
                  </span>
                  <Button
                    variant="ghost"
                    onClick={() => setIsEditing(true)}
                    size="sm"
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>

            <div>
              <Label>Email</Label>
              <p className="text-sm text-muted-foreground mt-1">{currentUser.email}</p>
            </div>

            <div>
              <Label>Account Created</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {currentUser.metadata.creationTime
                  ? new Date(currentUser.metadata.creationTime).toLocaleDateString()
                  : 'Unknown'}
              </p>
            </div>

            <div>
              <Label>Last Sign In</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {currentUser.metadata.lastSignInTime
                  ? new Date(currentUser.metadata.lastSignInTime).toLocaleDateString()
                  : 'Unknown'}
              </p>
            </div>
          </div>

          <Separator />

          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full"
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 