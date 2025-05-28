
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
    <Card className="w-full max-w-md mx-auto shadow-2xl bg-white/95 backdrop-blur-sm border-0 relative overflow-hidden" id="pledge-form">
      {/* Rainbow border effect */}
      <div className="absolute inset-0 bg-rainbow-border rainbow-animate rounded-lg p-1">
        <div className="bg-white rounded-lg h-full w-full"></div>
      </div>
      
      <div className="relative z-10">
        <CardHeader className="text-center bg-rainbow-gradient rainbow-animate rounded-t-lg">
          <CardTitle className="text-2xl font-bold text-white drop-shadow-lg">
            Take the Pledge
          </CardTitle>
          <p className="text-white/90 text-sm font-medium drop-shadow">
            Join the movement for healthier lungs and a tobacco-free life
          </p>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6 bg-white rounded-b-lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-3">
              <Label htmlFor="fullName" className="text-gray-700 font-semibold text-sm">
                Full Name *
              </Label>
              <div className="relative">
                <div className="absolute inset-0 bg-rainbow-gradient opacity-20 rounded-md blur-sm"></div>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Enter your full name"
                  className={`relative z-10 transition-all duration-300 border-2 focus:border-transparent focus:ring-2 focus:ring-offset-2 ${
                    errors.fullName 
                      ? 'border-red-400 focus:ring-red-400' 
                      : 'border-gray-200 hover:border-gray-300 focus:ring-blue-400'
                  }`}
                />
              </div>
              {errors.fullName && (
                <p className="text-red-500 text-sm font-medium">{errors.fullName}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="email" className="text-gray-700 font-semibold text-sm">
                Email Address *
              </Label>
              <div className="relative">
                <div className="absolute inset-0 bg-rainbow-gradient opacity-20 rounded-md blur-sm"></div>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  className={`relative z-10 transition-all duration-300 border-2 focus:border-transparent focus:ring-2 focus:ring-offset-2 ${
                    errors.email 
                      ? 'border-red-400 focus:ring-red-400' 
                      : 'border-gray-200 hover:border-gray-300 focus:ring-purple-400'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm font-medium">{errors.email}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="referralCode" className="text-gray-700 font-semibold text-sm">
                Referral Code (Optional)
              </Label>
              <div className="relative">
                <div className="absolute inset-0 bg-rainbow-gradient opacity-15 rounded-md blur-sm"></div>
                <Input
                  id="referralCode"
                  type="text"
                  value={formData.referralCode}
                  onChange={(e) => handleInputChange('referralCode', e.target.value.toUpperCase())}
                  placeholder="Enter referral code if you have one"
                  className="relative z-10 border-2 border-gray-200 hover:border-gray-300 focus:border-transparent focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition-all duration-300"
                />
              </div>
            </div>

            <div className="pt-2">
              {isSubmitEnabled && !isSubmitting ? (
                <div className="relative">
                  <div className="absolute inset-0 bg-rainbow-gradient rounded-xl blur-sm opacity-75"></div>
                  <Button
                    type="submit"
                    className="relative z-10 w-full py-4 text-lg font-bold bg-rainbow-gradient rainbow-animate text-white rounded-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    🌈 Make My Pledge 🌸
                  </Button>
                </div>
              ) : (
                <Button
                  type="submit"
                  disabled={true}
                  className="w-full py-4 text-lg font-semibold bg-gray-300 text-gray-500 cursor-not-allowed rounded-xl"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </span>
                  ) : (
                    `Wait ${countdown}s to submit`
                  )}
                </Button>
              )}
            </div>
          </form>

          <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
            By submitting, you commit to a tobacco-free lifestyle and join our healthy lungs community
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default PledgeForm;
