
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface PledgeSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  referralLink: string;
}

const PledgeSuccessModal: React.FC<PledgeSuccessModalProps> = ({
  isOpen,
  onClose,
  userName,
  referralLink
}) => {
  const downloadBloomGraphic = () => {
    // Create a canvas element to generate the bloom graphic
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    canvas.width = 800;
    canvas.height = 800;
    
    // Create gradient background
    const gradient = ctx.createRadialGradient(400, 400, 0, 400, 400, 400);
    gradient.addColorStop(0, '#fef3e7');
    gradient.addColorStop(1, '#e0f2fe');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 800);
    
    // Add text
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🌸 Congratulations! 🌸', 400, 200);
    
    ctx.font = '32px Arial';
    ctx.fillText(`${userName}`, 400, 280);
    
    ctx.font = '24px Arial';
    ctx.fillStyle = '#4b5563';
    ctx.fillText('You\'ve taken the pledge for', 400, 350);
    ctx.fillText('healthier lungs and a tobacco-free life!', 400, 390);
    
    ctx.font = 'bold 36px Arial';
    ctx.fillStyle = '#059669';
    ctx.fillText('#BloomForLungs', 400, 500);
    
    ctx.font = '20px Arial';
    ctx.fillStyle = '#6b7280';
    ctx.fillText('@IKSC Campaign', 400, 550);
    
    // Large bloom emoji
    ctx.font = '120px Arial';
    ctx.fillText('🌺', 400, 680);
    
    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bloom-pledge-${userName.replace(/\s+/g, '-').toLowerCase()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    });
  };

  const shareOnInstagram = () => {
    const caption = encodeURIComponent(
      `I just took the pledge for healthier lungs! 🌸 Join me in choosing a tobacco-free lifestyle. #BloomForLungs #HealthyChoice #TobaccoFree @IKSC ${referralLink}`
    );
    
    // On mobile, try to open Instagram app, otherwise open web version
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      window.open(`instagram://share?text=${caption}`, '_blank');
    } else {
      window.open('https://www.instagram.com/', '_blank');
    }
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    // You could add a toast notification here
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-3xl font-bold bg-bloom-gradient bg-clip-text text-transparent">
            🌸 Congratulations, {userName}! 🌸
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 text-center">
          <div className="text-6xl animate-pulse">🌺</div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-800">
              You've joined the Bloom for Lungs movement!
            </h3>
            <p className="text-gray-600">
              Thank you for pledging to a tobacco-free lifestyle. Your commitment helps create a healthier world for everyone.
            </p>
          </div>

          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="p-4">
              <h4 className="font-semibold text-gray-800 mb-2">🎁 Your Pledge Rewards:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✅ Downloadable celebration graphic</li>
                <li>✅ Personal referral link to earn Bloom Points</li>
                <li>✅ Contributing to our growing healthy lungs garden</li>
              </ul>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={downloadBloomGraphic}
              className="bg-bloom-pink hover:bg-bloom-pink/90 text-gray-800 py-3"
            >
              📱 Download Your Bloom
            </Button>
            
            <Button 
              onClick={shareOnInstagram}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-3"
            >
              📸 Share on Instagram
            </Button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">🔗 Your Referral Link:</h4>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={referralLink} 
                readOnly 
                className="flex-1 px-3 py-2 bg-white border rounded text-sm"
              />
              <Button 
                onClick={copyReferralLink}
                variant="outline"
                size="sm"
              >
                Copy
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Share this link with friends to earn Bloom Points! (Max 5 referrals per day)
            </p>
          </div>

          <Button 
            onClick={onClose}
            className="w-full bg-nature-green hover:bg-nature-green/90 text-white py-3"
          >
            Continue to Garden 🌱
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PledgeSuccessModal;
