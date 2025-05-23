import React, { useState, useEffect } from 'react';
import PledgeForm from '../components/PledgeForm';
import LungsModel3D from '../components/LungsModel3D';
import PledgeSuccessModal from '../components/PledgeSuccessModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [pledgeCount, setPledgeCount] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [shouldAnimateLungs, setShouldAnimateLungs] = useState(false);
  const [currentPledge, setCurrentPledge] = useState({
    userName: '',
    referralLink: '',
    pledgeId: ''
  });

  // Fetch pledge count on component mount
  useEffect(() => {
    const fetchPledgeCount = async () => {
      const { count, error } = await supabase
        .from('pledges')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error('Error fetching pledge count:', error);
        return;
      }
      
      if (count !== null) {
        console.log('Initial pledge count from database:', count);
        setPledgeCount(count);
      }
    };

    fetchPledgeCount();

    // Subscribe to real-time changes on pledges table
    const channel = supabase
      .channel('pledges-changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'pledges' 
      }, (payload) => {
        console.log('New pledge inserted:', payload);
        setPledgeCount(prevCount => prevCount + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handlePledgeSubmit = async (pledgeData: {
    fullName: string;
    email: string;
    referralCode: string;
    pledgeId: string;
  }) => {
    console.log('Pledge submitted:', pledgeData);
    
    const referralLink = `${window.location.origin}?ref=${pledgeData.referralCode}`;
    
    // Update state and trigger blooming animation
    setShouldAnimateLungs(true);
    setCurrentPledge({
      userName: pledgeData.fullName,
      referralLink: referralLink,
      pledgeId: pledgeData.pledgeId
    });
    setShowSuccessModal(true);
    
    // Stop animation after 3 seconds
    setTimeout(() => {
      setShouldAnimateLungs(false);
    }, 3000);
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
        
        {/* Logos positioned at top */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
          <img 
            src="/lovable-uploads/fbdff461-1ffb-485c-8e93-3141b2515bc0.png" 
            alt="IKSC Logo" 
            className="h-20 w-auto object-contain drop-shadow-lg"
          />
          <img 
            src="/lovable-uploads/9c57fcd0-54f8-4f2a-8ff5-70b9175a0fb4.png" 
            alt="KARE Logo" 
            className="h-20 w-auto object-contain drop-shadow-lg"
          />
        </div>
        
        <div className="relative container mx-auto px-4 py-16 pt-32">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <div className="text-6xl mb-4">🌺</div>
            <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
              Bloom for Lungs
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-white/95 drop-shadow-lg">
              IKSC KARE Initiative
            </h2>
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

          {/* 3D Lungs Model with Animation */}
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
            <LungsModel3D pledgeCount={pledgeCount} shouldAnimate={shouldAnimateLungs} />
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
        pledgeId={currentPledge.pledgeId}
      />
    </div>
  );
};

export default Index;
