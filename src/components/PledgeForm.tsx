
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
    'throwaway.email',
    'temp-mail.org',
    'disposablemail.com',
    'fakeinbox.com'
  ];

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    
    const domain = email.split('@')[1]?.toLowerCase();
    if (blockedDomains.includes(domain)) {
      return 'Temporary email addresses are not allowed';
    }
    
    return '';
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailError = validateEmail(formData.email.trim());
      if (emailError) {
        newErrors.email = emailError;
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
        const normalizedEmail = formData.email.trim().toLowerCase();
        
        // Check if email already exists with better error handling
        const { data: existingPledges, error: checkError } = await supabase
          .from('pledges')
          .select('id, referral_code, full_name')
          .eq('email', normalizedEmail)
          .maybeSingle();

        if (checkError) {
          console.error('Error checking existing pledges:', checkError);
          toast({
            title: "Error checking existing pledges",
            description: "Please try again later.",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }

        if (existingPledges) {
          // User already pledged
          toast({
            title: "You've already made a pledge!",
            description: `Welcome back, ${existingPledges.full_name}! Thank you for your continued commitment.`,
          });
          
          // Still trigger success with existing pledge data
          onPledgeSubmit({
            fullName: existingPledges.full_name,
            email: normalizedEmail,
            referralCode: existingPledges.referral_code || '',
            pledgeId: existingPledges.id
          });
          
          setIsSubmitting(false);
          return;
        }

        // Generate referral code
        let referralCode = '';
        try {
          const { data: referralCodeData, error: referralCodeError } = await supabase
            .rpc('generate_referral_code', { user_name: formData.fullName });

          if (referralCodeError) {
            console.error('Error generating referral code:', referralCodeError);
            // Fallback to manual generation
            const cleanName = formData.fullName.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase();
            referralCode = `${cleanName || 'USER'}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
          } else {
            referralCode = referralCodeData;
          }
        } catch (error) {
          console.error('Error calling generate_referral_code function:', error);
          // Fallback to manual generation
          const cleanName = formData.fullName.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase();
          referralCode = `${cleanName || 'USER'}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
        }

        // Create new pledge with normalized email
        const { data: newPledge, error: pledgeError } = await supabase
          .from('pledges')
          .insert({
            full_name: formData.fullName.trim(),
            email: normalizedEmail,
            referral_code: referralCode
          })
          .select()
          .single();

        if (pledgeError) {
          console.error('Error creating pledge:', pledgeError);
          if (pledgeError.code === '23505') { // Unique constraint violation
            toast({
              title: "Email already exists",
              description: "This email has already been used for a pledge.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Error creating pledge",
              description: "Please try again later.",
              variant: "destructive"
            });
          }
          setIsSubmitting(false);
          return;
        }

        console.log('Pledge created successfully:', newPledge);

        // Handle referral if there's a referral code
        if (formData.referralCode.trim()) {
          const { data: referrerPledge, error: referrerError } = await supabase
            .from('pledges')
            .select('id, full_name')
            .eq('referral_code', formData.referralCode.trim())
            .maybeSingle();

          if (referrerError) {
            console.error('Error finding referrer:', referrerError);
          } else if (referrerPledge) {
            // Add referral record
            const { error: referralError } = await supabase
              .from('referrals')
              .insert({
                referrer_pledge_id: referrerPledge.id,
                referred_pledge_id: newPledge.id,
                referral_code: formData.referralCode.trim()
              });

            if (referralError) {
              console.error('Error creating referral:', referralError);
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

        // Reset form
        setFormData({ fullName: '', email: '', referralCode: '' });
        
        // Call onPledgeSubmit with the new pledge data
        onPledgeSubmit({
          fullName: formData.fullName.trim(),
          email: normalizedEmail,
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
