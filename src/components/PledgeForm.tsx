
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PledgeFormProps {
  onPledgeSubmit: (pledgeData: {
    fullName: string;
    email: string;
    referralCode: string;
  }) => void;
}

const PledgeForm: React.FC<PledgeFormProps> = ({ onPledgeSubmit }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    referralCode: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
  const [countdown, setCountdown] = useState(30);

  // Handle 30-second wait timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsSubmitEnabled(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-fill referral code from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      setFormData(prev => ({ ...prev, referralCode: refCode }));
    }
  }, []);

  const blockedDomains = [
    'tempmail.com',
    '10minutemail.com',
    'guerrillamail.com',
    'mailinator.com',
    'throwaway.email'
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      } else {
        const domain = formData.email.split('@')[1];
        if (blockedDomains.includes(domain)) {
          newErrors.email = 'Temporary email addresses are not allowed';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSubmitEnabled) return;
    
    if (validateForm()) {
      onPledgeSubmit(formData);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl bg-white/95 backdrop-blur-sm border-0">
      <CardHeader className="text-center bg-bloom-gradient rounded-t-lg">
        <CardTitle className="text-2xl font-bold text-white">
          Take the Pledge
        </CardTitle>
        <p className="text-white/90 text-sm">
          Join the movement for healthier lungs and a tobacco-free life
        </p>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-gray-700 font-medium">
              Full Name *
            </Label>
            <Input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="Enter your full name"
              className={`transition-all duration-200 ${
                errors.fullName ? 'border-red-500 focus:border-red-500' : 'focus:border-nature-green'
              }`}
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm">{errors.fullName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 font-medium">
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter your email"
              className={`transition-all duration-200 ${
                errors.email ? 'border-red-500 focus:border-red-500' : 'focus:border-nature-green'
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="referralCode" className="text-gray-700 font-medium">
              Referral Code (Optional)
            </Label>
            <Input
              id="referralCode"
              type="text"
              value={formData.referralCode}
              onChange={(e) => handleInputChange('referralCode', e.target.value)}
              placeholder="Enter referral code if you have one"
              className="focus:border-nature-green transition-all duration-200"
            />
          </div>

          <Button
            type="submit"
            disabled={!isSubmitEnabled}
            className={`w-full py-3 text-lg font-semibold transition-all duration-300 ${
              isSubmitEnabled
                ? 'bg-nature-green hover:bg-nature-green/90 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitEnabled ? (
              '🌸 Make My Pledge'
            ) : (
              `Wait ${countdown}s to submit`
            )}
          </Button>
        </form>

        <div className="text-center text-xs text-gray-500 mt-4">
          By submitting, you commit to a tobacco-free lifestyle and join our healthy lungs community
        </div>
      </CardContent>
    </Card>
  );
};

export default PledgeForm;
