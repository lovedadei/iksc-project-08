
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { PledgeFormData } from '@/utils/pledgeValidation';

interface PledgeSubmissionResult {
  fullName: string;
  email: string;
  referralCode: string;
  pledgeId: string;
}

export const usePledgeSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitPledge = async (
    formData: PledgeFormData,
    userEmail: string,
    onSuccess: (result: PledgeSubmissionResult) => void
  ) => {
    setIsSubmitting(true);
    
    try {
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
        return;
      }

      if (existingPledges) {
        toast({
          title: "You've already made a pledge!",
          description: `Welcome back, ${existingPledges.full_name}! Thank you for your commitment.`,
        });
        
        onSuccess({
          fullName: existingPledges.full_name,
          email: userEmail,
          referralCode: existingPledges.referral_code || '',
          pledgeId: existingPledges.id
        });
        
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

      onSuccess({
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
  };

  return { submitPledge, isSubmitting };
};
