import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PledgeFormProps {
  onPledgeSubmit: (pledgeData: {
    fullName: string;
    email: string;
    referralCode: string;
    pledgeId: string;
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSubmitEnabled || isSubmitting) return;
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        // Check if email already exists
        const { data: existingPledges } = await supabase
          .from('pledges')
          .select('id, referral_code')
          .eq('email', formData.email)
          .maybeSingle();

        if (existingPledges) {
          // User already pledged
          toast({
            title: "You've already made a pledge!",
            description: "Thank you for your continued commitment to healthy lungs.",
          });
          
          // Still trigger success with existing pledge data
          onPledgeSubmit({
            fullName: formData.fullName,
            email: formData.email,
            referralCode: existingPledges.referral_code || '',
            pledgeId: existingPledges.id
          });
          
          setIsSubmitting(false);
          return;
        }

        // Create new pledge
        const { data: newPledge, error: pledgeError } = await supabase
          .from('pledges')
          .insert({
            full_name: formData.fullName,
            email: formData.email
          })
          .select()
          .single();

        if (pledgeError) {
          console.error('Error creating pledge:', pledgeError);
          toast({
            title: "Error creating pledge",
            description: "Please try again later.",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }

        // Generate referral code
        const { data: referralCodeData, error: referralCodeError } = await supabase
          .rpc('generate_referral_code', { user_name: formData.fullName });

        if (referralCodeError) {
          console.error('Error generating referral code:', referralCodeError);
        }

        // Update pledge with referral code
        const referralCode = referralCodeData || `${formData.fullName.substring(0, 4).toUpperCase()}${Math.floor(Math.random() * 1000)}`;
        const { error: updateError } = await supabase
          .from('pledges')
          .update({ referral_code: referralCode })
          .eq('id', newPledge.id);

        if (updateError) {
          console.error('Error updating pledge with referral code:', updateError);
        }

        // Handle referral if there's a referral code
        if (formData.referralCode) {
          const { data: referrerPledge } = await supabase
            .from('pledges')
            .select('id')
            .eq('referral_code', formData.referralCode)
            .maybeSingle();

          if (referrerPledge) {
            // Add referral record
            const { error: referralError } = await supabase
              .from('referrals')
              .insert({
                referrer_pledge_id: referrerPledge.id,
                referred_pledge_id: newPledge.id,
                referral_code: formData.referralCode
              });

            if (referralError) {
              console.error('Error creating referral:', referralError);
            }
          }
        }

        // Call onPledgeSubmit with the new pledge data
        onPledgeSubmit({
          fullName: formData.fullName,
          email: formData.email,
          referralCode: referralCode,
          pledgeId: newPledge.id
        });
        
      } catch (error) {
        console.error('Error during pledge submission:', error);
        toast({
          title: "Error submitting pledge",
          description: "Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl bg-white/95 backdrop-blur-sm border-0" id="pledge-form">
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
            disabled={!isSubmitEnabled || isSubmitting}
            className={`w-full py-3 text-lg font-semibold transition-all duration-300 ${
              isSubmitEnabled && !isSubmitting
                ? 'bg-nature-green hover:bg-nature-green/90 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              'Submitting...'
            ) : !isSubmitEnabled ? (
              `Wait ${countdown}s to submit`
            ) : (
              '🌸 Make My Pledge'
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
