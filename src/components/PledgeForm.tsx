
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { validatePledgeForm, PledgeFormData } from '@/utils/pledgeValidation';
import { usePledgeSubmission } from '@/hooks/usePledgeSubmission';
import PledgeFormInput from './pledge/PledgeFormInput';
import PledgeSubmitButton from './pledge/PledgeSubmitButton';
import UserInfoDisplay from './pledge/UserInfoDisplay';

interface PledgeFormProps {
  onPledgeSubmit: (pledgeData: {
    fullName: string;
    email: string;
    referralCode: string;
    pledgeId: string;
  }) => void;
}

const PledgeForm: React.FC<PledgeFormProps> = ({ onPledgeSubmit }) => {
  const { user } = useAuth();
  const { submitPledge, isSubmitting } = usePledgeSubmission();
  const [formData, setFormData] = useState<PledgeFormData>({
    fullName: '',
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

  // Auto-fill user's name from Google profile
  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setFormData(prev => ({ ...prev, fullName: user.user_metadata.full_name }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSubmitEnabled || isSubmitting || !user?.email) return;
    
    const validationErrors = validatePledgeForm(formData, user?.email);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      await submitPledge(formData, user.email, (pledgeData) => {
        setFormData({ fullName: '', referralCode: '' });
        onPledgeSubmit(pledgeData);
      });
    }
  };

  const handleInputChange = (field: keyof PledgeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl bg-gradient-to-br from-slate-50 to-white border-0 overflow-hidden" id="pledge-form">
      <CardHeader className="text-center bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 via-teal-400/20 to-cyan-400/20"></div>
        <div className="relative z-10">
          <CardTitle className="text-2xl font-bold mb-2">
            🌸 Take the Pledge
          </CardTitle>
          <p className="text-white/90 text-sm leading-relaxed">
            Join the movement for healthier lungs
          </p>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-5">
        {user && <UserInfoDisplay user={user} />}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <PledgeFormInput
            id="fullName"
            label="Full Name"
            value={formData.fullName}
            onChange={(value) => handleInputChange('fullName', value)}
            placeholder="Enter your full name"
            error={errors.fullName}
            required
          />

          <PledgeFormInput
            id="referralCode"
            label="Referral Code (Optional)"
            value={formData.referralCode}
            onChange={(value) => handleInputChange('referralCode', value)}
            placeholder="Enter referral code if you have one"
            transform={(value) => value.toUpperCase()}
          />

          <PledgeSubmitButton
            isEnabled={isSubmitEnabled}
            isSubmitting={isSubmitting}
            isUserSignedIn={!!user}
            countdown={countdown}
          />
        </form>

        <div className="text-center text-xs text-slate-500 mt-4 leading-relaxed">
          By submitting, you commit to a tobacco-free lifestyle
        </div>
      </CardContent>
    </Card>
  );
};

export default PledgeForm;
