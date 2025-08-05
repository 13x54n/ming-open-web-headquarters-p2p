"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { 
  CheckCircle, 
  Wallet, 
  TrendingUp, 
  Shield, 
  ArrowRight,
  X
} from 'lucide-react';

interface NewUserWelcomeProps {
  onComplete: () => void;
  userName?: string;
  userId?: string;
}

export default function NewUserWelcome({ onComplete, userName, userId }: NewUserWelcomeProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { markWelcomeAsSeen } = useAuth();

  const steps = [
    {
      title: "Welcome to Ming HQ!",
      description: `Hi ${userName || 'there'}! Welcome to your new account. Let's get you started with a quick tour.`,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Secure Wallet",
      description: "Your wallet is automatically created and secured. You can deposit, withdraw, and manage your crypto assets safely.",
      icon: Wallet,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Start Trading",
      description: "Connect with other traders to buy and sell cryptocurrencies peer-to-peer with secure escrow protection.",
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Account Security",
      description: "Your account is protected with Google OAuth and follows industry best practices for security.",
      icon: Shield,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    // Mark welcome as seen for this user using AuthContext
    markWelcomeAsSeen();
    onComplete();
  };

  const currentStepData = steps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-between items-start mb-4">
            <Badge variant="secondary" className="text-xs">
              Step {currentStep + 1} of {steps.length}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className={`w-16 h-16 rounded-full ${currentStepData.bgColor} flex items-center justify-center mx-auto mb-4`}>
            <IconComponent className={`h-8 w-8 ${currentStepData.color}`} />
          </div>
          
          <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            {currentStepData.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Progress indicator */}
          <div className="flex gap-2 justify-center">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-3">
            {currentStep < steps.length - 1 ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  className="flex-1"
                >
                  Skip Tour
                </Button>
                <Button
                  onClick={handleNext}
                  className="flex-1 flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                onClick={handleNext}
                className="w-full flex items-center gap-2"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 