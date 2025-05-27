
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
    <Card className="w-full max-w-md mx-auto shadow-2xl bg-gray-900/95 backdrop-blur-sm border border-gray-700 hover:shadow-3xl transition-all duration-500 hover:scale-105" id="pledge-form">
      <CardHeader className="text-center bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-t-lg hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 transition-all duration-300">
        <CardTitle className="text-2xl font-bold text-white hover:scale-105 transition-transform duration-300">
          Take the Pledge
        </CardTitle>
        <p className="text-white/90 text-sm hover:text-white transition-colors duration-300">
          Join the movement for healthier lungs and a tobacco-free life
        </p>
      </CardHeader>
      <CardContent className="p-6 space-y-4 bg-gray-800/90">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-gray-200 font-medium hover:text-white transition-colors duration-300">
              Full Name *
            </Label>
            <Input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="Enter your full name"
              className={`transition-all duration-300 bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:bg-gray-600 focus:bg-gray-600 ${
                errors.fullName ? 'border-red-500 focus:border-red-500' : 'focus:border-purple-500'
              }`}
            />
            {errors.fullName && (
              <p className="text-red-400 text-sm animate-fade-in">{errors.fullName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-200 font-medium hover:text-white transition-colors duration-300">
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter your email"
              className={`transition-all duration-300 bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:bg-gray-600 focus:bg-gray-600 ${
                errors.email ? 'border-red-500 focus:border-red-500' : 'focus:border-purple-500'
              }`}
            />
            {errors.email && (
              <p className="text-red-400 text-sm animate-fade-in">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="referralCode" className="text-gray-200 font-medium hover:text-white transition-colors duration-300">
              Referral Code (Optional)
            </Label>
            <Input
              id="referralCode"
              type="text"
              value={formData.referralCode}
              onChange={(e) => handleInputChange('referralCode', e.target.value.toUpperCase())}
              placeholder="Enter referral code if you have one"
              className="focus:border-purple-500 transition-all duration-300 bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:bg-gray-600 focus:bg-gray-600"
            />
          </div>

          <Button
            type="submit"
            disabled={!isSubmitEnabled || isSubmitting}
            className={`w-full py-3 text-lg font-semibold transition-all duration-300 ${
              isSubmitEnabled && !isSubmitting
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:scale-105 hover:shadow-lg'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2">⏳</span>
                Submitting...
              </span>
            ) : !isSubmitEnabled ? (
              `Wait ${countdown}s to submit`
            ) : (
              '🌸 Make My Pledge'
            )}
          </Button>
        </form>

        <div className="text-center text-xs text-gray-400 mt-4 hover:text-gray-300 transition-colors duration-300">
          By submitting, you commit to a tobacco-free lifestyle and join our healthy lungs community
        </div>
      </CardContent>
    </Card>
  );
};

export default PledgeForm;
