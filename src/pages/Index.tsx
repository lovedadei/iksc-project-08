
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
        setShouldAnimateLungs(true);
        // Stop animation after 3 seconds
        setTimeout(() => {
          setShouldAnimateLungs(false);
        }, 3000);
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
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 relative overflow-hidden">
      {/* Background Images */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-1/3 h-1/2 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
            alt="Forest background" 
            className="w-full h-full object-cover rounded-br-3xl"
          />
        </div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/3 opacity-15">
          <img 
            src="https://images.unsplash.com/photo-1518495973542-4542c06a5843?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
            alt="Nature background" 
            className="w-full h-full object-cover rounded-tl-3xl"
          />
        </div>
        <div className="absolute top-1/4 right-1/4 w-1/4 h-1/4 opacity-10">
          <img 
            src="https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
            alt="Pine trees" 
            className="w-full h-full object-cover rounded-full"
          />
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8 md:py-16">
          {/* Header with Logos */}
          <div className="flex justify-between items-center mb-8 md:mb-16">
            <img 
              src="/lovable-uploads/fbdff461-1ffb-485c-8e93-3141b2515bc0.png" 
              alt="IKSC Logo" 
              className="h-16 md:h-20 w-auto object-contain drop-shadow-lg"
            />
            <img 
              src="/lovable-uploads/9c57fcd0-54f8-4f2a-8ff5-70b9175a0fb4.png" 
              alt="KARE Logo" 
              className="h-16 md:h-20 w-auto object-contain drop-shadow-lg"
            />
          </div>
          
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <div className="text-4xl md:text-6xl mb-4">🌺</div>
            <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-2xl leading-tight">
              Bloom for Lungs
            </h1>
            <p className="text-lg md:text-2xl text-green-100 leading-relaxed max-w-3xl mx-auto">
              Join the movement for healthier lungs and a tobacco-free future. 
              <br className="hidden md:block" />
              Every pledge helps our community reach maximum lung health.
            </p>
            <div className="bg-green-800/50 backdrop-blur-sm rounded-2xl px-6 py-4 inline-block border border-green-600/30">
              <p className="text-green-100 font-semibold text-lg">
                🌟 IKSC KARE Initiative 🌟
              </p>
              <p className="text-green-200 text-sm mt-1">
                Promoting healthy lungs and tobacco-free communities
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <span className="bg-green-700/60 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-green-100 border border-green-600/30">
                🌱 #BloomForLungs
              </span>
              <span className="bg-green-700/60 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-green-100 border border-green-600/30">
                💚 #HealthyChoice
              </span>
              <span className="bg-green-700/60 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-green-100 border border-green-600/30">
                🚭 #TobaccoFree
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative z-10 py-12 mt-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-8">
            Our Growing Impact
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-sm border-green-600/30 hover:bg-white/15 transition-all duration-300">
                <CardContent className="p-4 md:p-6 text-center space-y-2">
                  <div className="text-2xl md:text-3xl">{stat.icon}</div>
                  <div className="text-xl md:text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs md:text-sm text-green-200 leading-tight">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-12 md:py-16">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Pledge Form */}
          <div className="space-y-6 order-2 lg:order-1">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Take Your Pledge Today
              </h2>
              <p className="text-green-100 text-base md:text-lg leading-relaxed">
                Join thousands of others who have committed to healthier lungs and a tobacco-free lifestyle. 
                Your pledge makes a difference!
              </p>
            </div>
            <div id="pledge-form">
              <PledgeForm onPledgeSubmit={handlePledgeSubmit} />
            </div>
          </div>

          {/* 3D Lungs Model with Animation */}
          <div className="space-y-6 order-1 lg:order-2">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Watch Our Lungs Heal
              </h2>
              <p className="text-green-100 text-base md:text-lg leading-relaxed">
                Every pledge brings us closer to maximum lung health! 
                See the progress towards our goal of 200 pledges.
              </p>
            </div>
            <LungsModel3D pledgeCount={pledgeCount} shouldAnimate={shouldAnimateLungs} />
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="relative z-10 bg-green-800/30 backdrop-blur-sm py-12 md:py-16 border-t border-green-600/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-base md:text-lg text-green-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Your commitment to a tobacco-free lifestyle inspires others and contributes to a healthier world. 
            Together, we can achieve maximum lung health!
          </p>
          <div className="flex justify-center">
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white px-6 md:px-8 py-3 text-base md:text-lg font-semibold rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl"
              onClick={() => document.querySelector('#pledge-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              🌸 Take the Pledge
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
