
import React from 'react';
import { Button } from '@/components/ui/button';

interface PledgeSubmitButtonProps {
  isEnabled: boolean;
  isSubmitting: boolean;
  isUserSignedIn: boolean;
  countdown: number;
}

const PledgeSubmitButton: React.FC<PledgeSubmitButtonProps> = ({
  isEnabled,
  isSubmitting,
  isUserSignedIn,
  countdown
}) => {
  const getButtonText = () => {
    if (isSubmitting) {
      return (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          Submitting...
        </div>
      );
    }
    
    if (!isUserSignedIn) {
      return 'Please Sign In First';
    }
    
    if (!isEnabled) {
      return `Wait ${countdown}s to submit`;
    }
    
    return '🌸 Make My Pledge';
  };

  return (
    <Button
      type="submit"
      disabled={!isEnabled || isSubmitting || !isUserSignedIn}
      className={`w-full py-3 text-lg font-semibold transition-all duration-300 transform ${
        isEnabled && !isSubmitting && isUserSignedIn
          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
          : 'bg-slate-300 text-slate-500 cursor-not-allowed'
      }`}
    >
      {getButtonText()}
    </Button>
  );
};

export default PledgeSubmitButton;
