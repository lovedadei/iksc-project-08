
import React, { useState } from 'react';
import PledgeForm from '../components/PledgeForm';
import LungsModel3D from '../components/LungsModel3D';
import PledgeSuccessModal from '../components/PledgeSuccessModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Index = () => {
  const [pledgeCount, setPledgeCount] = useState(47); // Starting with some example pledges
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentPledge, setCurrentPledge] = useState({
    userName: '',
    referralLink: ''
  });

  const handlePledgeSubmit = (pledgeData: {
    fullName: string;
    email: string;
    referralCode: string;
  }) => {
    console.log('Pledge submitted:', pledgeData);
    
    // Simulate generating a unique referral code
    const userCode = pledgeData.fullName.replace(/\s+/g, '').toUpperCase().slice(0, 6) + Math.floor(Math.random() * 100);
    const referralLink = `${window.location.origin}?ref=${userCode}`;
    
    // Update state
    setPledgeCount(prev => prev + 1);
    setCurrentPledge({
      userName: pledgeData.fullName,
      referralLink: referralLink
    });
    setShowSuccessModal(true);
  };

  const stats = [
    { label: 'Total Pledges', value: pledgeCount, icon: '🌸' },
    { label: 'Lives Impacted', value: pledgeCount * 3, icon: '❤️' },
    { label: 'Tobacco-Free Days', value: pledgeCount * 30, icon: '📅' },
    { label: 'Healthy Breaths', value: `${(pledgeCount * 20000).toLocaleString()}+`, icon: '🫁' }
  ];

  return (
    <div className="min-h-screen bg-fresh-gradient">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <div className="text-6xl mb-4">🌺</div>
            <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
              Bloom for Lungs
            </h1>
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
              Join the movement for healthier lungs and a tobacco-free future. 
              <br />
              Every pledge helps our community reach maximum lung health.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-white/80">
              <span className="bg-white/20 rounded-full px-4 py-2 text-sm font-medium">
                🌱 #BloomForLungs
              </span>
              <span className="bg-white/20 rounded-full px-4 py-2 text-sm font-medium">
                💚 #HealthyChoice
              </span>
              <span className="bg-white/20 rounded-full px-4 py-2 text-sm font-medium">
                🚭 #TobaccoFree
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-12 bg-white/90 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Our Growing Impact
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="space-y-2">
                  <div className="text-3xl">{stat.icon}</div>
                  <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Pledge Form */}
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold text-white mb-4">
                Take Your Pledge Today
              </h2>
              <p className="text-white/90 text-lg">
                Join thousands of others who have committed to healthier lungs and a tobacco-free lifestyle. 
                Your pledge makes a difference!
              </p>
            </div>
            <PledgeForm onPledgeSubmit={handlePledgeSubmit} />
          </div>

          {/* 3D Lungs Model */}
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold text-white mb-4">
                Watch Our Lungs Heal
              </h2>
              <p className="text-white/90 text-lg">
                Every pledge brings us closer to maximum lung health! 
                See the progress towards our goal of 200 pledges.
              </p>
            </div>
            <LungsModel3D pledgeCount={pledgeCount} />
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-white/95 backdrop-blur-sm py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Your commitment to a tobacco-free lifestyle inspires others and contributes to a healthier world. 
            Together, we can achieve maximum lung health!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-nature-green hover:bg-nature-green/90 text-white px-8 py-3 text-lg"
              onClick={() => document.querySelector('#pledge-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              🌸 Take the Pledge
            </Button>
            <Button 
              variant="outline"
              className="border-nature-green text-nature-green hover:bg-nature-green hover:text-white px-8 py-3 text-lg"
            >
              📖 Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <PledgeSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        userName={currentPledge.userName}
        referralLink={currentPledge.referralLink}
      />
    </div>
  );
};

export default Index;
