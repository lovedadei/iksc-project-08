
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface PledgeFormProps {
  onPledgeSubmit: (pledgeData: {
    fullName: string;
    email: string;
    referralCode: string;
    pledgeId: string;
  }) => void;
}

interface PledgeData {
  id: string;
  referral_code: string | null;
  full_name: string;
}

const PledgeForm: React.FC<PledgeFormProps> = ({ onPledgeSubmit }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    referralCode: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill form with user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.user_metadata?.full_name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSubmitEnabled || isSubmitting || !user) return;
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        // Check if user already has a pledge - query by email since user_id doesn't exist in pledges table
        const { data: existingPledges, error: pledgeCheckError } = await supabase
          .from('pledges')
          .select('id, referral_code, full_name')
          .eq('email', user.email || '');

        if (pledgeCheckError) {
          console.error('Error checking existing pledges:', pledgeCheckError);
          toast({
            title: "Error checking existing pledges",
            description: "Please try again later.",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }

        const existingPledge = existingPledges?.[0] as PledgeData | undefined;

        if (existingPledge) {
          // User already pledged
          toast({
            title: "You've already made a pledge!",
            description: `Welcome back, ${existingPledge.full_name}! Thank you for your continued commitment.`,
          });
          
          // Still trigger success with existing pledge data
          onPledgeSubmit({
            fullName: existingPledge.full_name,
            email: formData.email,
            referralCode: existingPledge.referral_code || '',
            pledgeId: existingPledge.id
          });
          
          setIsSubmitting(false);
          return;
        }

        // Generate referral code
        let referralCode = '';
        try {
          const { data: generatedCode, error: codeError } = await supabase
            .rpc('generate_referral_code', { user_name: formData.fullName });

          if (codeError) {
            console.error('Error generating referral code:', codeError);
            // Fallback to manual generation
            const cleanName = formData.fullName.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase();
            referralCode = `${cleanName || 'USER'}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
          } else {
            referralCode = generatedCode || '';
          }
        } catch (error) {
          console.error('Error calling generate_referral_code function:', error);
          // Fallback to manual generation
          const cleanName = formData.fullName.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase();
          referralCode = `${cleanName || 'USER'}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
        }

        // Create new pledge without user_id since it doesn't exist in the schema
        const { data: newPledges, error: insertError } = await supabase
          .from('pledges')
          .insert({
            full_name: formData.fullName.trim(),
            email: formData.email.trim(),
            referral_code: referralCode
          })
          .select('id, full_name, referral_code');

        if (insertError) {
          console.error('Error creating pledge:', insertError);
          toast({
            title: "Error creating pledge",
            description: "Please try again later.",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }

        const newPledge = newPledges?.[0] as PledgeData | undefined;
        if (!newPledge) {
          console.error('No pledge data returned');
          toast({
            title: "Error creating pledge",
            description: "Please try again later.",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }

        console.log('Pledge created successfully:', newPledge);

        // Handle referral if there's a referral code
        if (formData.referralCode.trim()) {
          const { data: referrerPledges, error: referrerError } = await supabase
            .from('pledges')
            .select('id, full_name')
            .eq('referral_code', formData.referralCode.trim());

          if (referrerError) {
            console.error('Error finding referrer:', referrerError);
          } else {
            const referrerPledge = referrerPledges?.[0];
            if (referrerPledge) {
              // Add referral record
              const { error: referralInsertError } = await supabase
                .from('referrals')
                .insert({
                  referrer_pledge_id: referrerPledge.id,
                  referred_pledge_id: newPledge.id,
                  referral_code: formData.referralCode.trim()
                });

              if (referralInsertError) {
                console.error('Error creating referral:', referralInsertError);
              } else {
                console.log('Referral created successfully for referrer:', referrerPledge.full_name);
                toast({
                  title: "Referral bonus!",
                  description: `You were referred by ${referrerPledge.full_name}. Thank you for joining!`,
                });
              }
            } else {
              console.log('Referral code not found:', formData.referralCode);
            }
          }
        }

        // Reset form
        setFormData(prev => ({ ...prev, referralCode: '' }));
        
        // Call onPledgeSubmit with the new pledge data
        onPledgeSubmit({
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          referralCode: referralCode,
          pledgeId: newPledge.id
        });
        
        toast({
          title: "Pledge submitted successfully!",
          description: "Welcome to the Bloom for Lungs community!",
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
              disabled={true}
              className="bg-gray-50 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500">Email is pre-filled from your account</p>
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
              onChange={(e) => handleInputChange('referralCode', e.target.value.toUpperCase())}
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
