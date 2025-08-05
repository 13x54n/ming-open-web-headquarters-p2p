'use client';

import React from 'react';
import LoginForm from './login-form';

export default function AuthContainer() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Welcome to Ming HQ.</h1>
        </div>
        <LoginForm />
      </div>
    </div>
  );
} 