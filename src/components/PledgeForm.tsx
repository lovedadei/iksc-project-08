
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

const PledgeForm: React.FC<PledgeFormProps> = ({ onPledgeSubmit }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
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

  // Auto-fill user's name from Google profile
  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setFormData(prev => ({ ...prev, fullName: user.user_metadata.full_name }));
    }
  }, [user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (!user?.email) {
      newErrors.email = 'Please sign in to make a pledge';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSubmitEnabled || isSubmitting || !user?.email) return;
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        const userEmail = user.email;
        
        // Check if email already exists
        const { data: existingPledges, error: checkError } = await supabase
          .from('pledges')
          .select('id, referral_code, full_name')
          .eq('email', userEmail)
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
          toast({
            title: "You've already made a pledge!",
            description: `Welcome back, ${existingPledges.full_name}! Thank you for your commitment.`,
          });
          
          onPledgeSubmit({
            fullName: existingPledges.full_name,
            email: userEmail,
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
            const cleanName = formData.fullName.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase();
            referralCode = `${cleanName || 'USER'}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
          } else {
            referralCode = referralCodeData;
          }
        } catch (error) {
          console.error('Error calling generate_referral_code function:', error);
          const cleanName = formData.fullName.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase();
          referralCode = `${cleanName || 'USER'}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
        }

        // Create new pledge
        const { data: newPledge, error: pledgeError } = await supabase
          .from('pledges')
          .insert({
            full_name: formData.fullName.trim(),
            email: userEmail,
            referral_code: referralCode
          })
          .select()
          .single();

        if (pledgeError) {
          console.error('Error creating pledge:', pledgeError);
          if (pledgeError.code === '23505') {
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
        setFormData({ fullName: '', referralCode: '' });
        
        // Call onPledgeSubmit with the new pledge data
        onPledgeSubmit({
          fullName: formData.fullName.trim(),
          email: userEmail,
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
        {user && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 mb-4">
            <div className="flex items-center space-x-3">
              {user.user_metadata?.avatar_url && (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full border-2 border-emerald-300"
                />
              )}
              <div>
                <p className="text-sm font-medium text-emerald-800">
                  Signed in as: {user.email}
                </p>
                <p className="text-xs text-emerald-600">Email automatically secured</p>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-slate-700 font-medium text-sm">
              Full Name *
            </Label>
            <Input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="Enter your full name"
              className={`transition-all duration-300 border-2 focus:ring-2 focus:ring-emerald-500/20 ${
                errors.fullName 
                  ? 'border-red-400 focus:border-red-500' 
                  : 'border-slate-200 focus:border-emerald-500 hover:border-slate-300'
              }`}
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <span className="text-xs">⚠️</span>
                {errors.fullName}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="referralCode" className="text-slate-700 font-medium text-sm">
              Referral Code (Optional)
            </Label>
            <Input
              id="referralCode"
              type="text"
              value={formData.referralCode}
              onChange={(e) => handleInputChange('referralCode', e.target.value.toUpperCase())}
              placeholder="Enter referral code if you have one"
              className="border-2 border-slate-200 focus:border-teal-500 hover:border-slate-300 transition-all duration-300 focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <Button
            type="submit"
            disabled={!isSubmitEnabled || isSubmitting || !user}
            className={`w-full py-3 text-lg font-semibold transition-all duration-300 transform ${
              isSubmitEnabled && !isSubmitting && user
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Submitting...
              </div>
            ) : !user ? (
              'Please Sign In First'
            ) : !isSubmitEnabled ? (
              `Wait ${countdown}s to submit`
            ) : (
              '🌸 Make My Pledge'
            )}
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 mt-4 leading-relaxed">
          By submitting, you commit to a tobacco-free lifestyle
        </div>
      </CardContent>
    </Card>
  );
};

export default PledgeForm;
