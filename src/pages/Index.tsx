
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
    <div className="min-h-screen nature-gradient organic-bg">
      {/* Enhanced Hero Section with natural textures */}
      <div className="relative overflow-hidden">
        {/* Enhanced background with organic patterns */}
        <div className="absolute inset-0 bg-gradient-to-br from-forest-green/20 via-leaf-green/10 to-fresh-mint/20 backdrop-blur-sm"></div>
        <div className="absolute inset-0 organic-texture opacity-30"></div>
        
        {/* Floating leaf elements for ambiance */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 text-4xl opacity-30 gentle-sway">🍃</div>
          <div className="absolute top-40 right-20 text-3xl opacity-40 float" style={{animationDelay: '2s'}}>🌿</div>
          <div className="absolute bottom-40 left-1/4 text-5xl opacity-20 pulse-grow" style={{animationDelay: '1s'}}>🌱</div>
        </div>
        
        <div className="relative container mx-auto px-4 py-16">
          {/* Enhanced logos with glass morphism */}
          <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-10">
            <div className="glass-card rounded-xl p-3">
              <img 
                src="/lovable-uploads/fbdff461-1ffb-485c-8e93-3141b2515bc0.png" 
                alt="IKSC Logo" 
                className="h-20 w-auto object-contain drop-shadow-lg"
              />
            </div>
            <div className="glass-card rounded-xl p-3">
              <img 
                src="/lovable-uploads/9c57fcd0-54f8-4f2a-8ff5-70b9175a0fb4.png" 
                alt="KARE Logo" 
                className="h-20 w-auto object-contain drop-shadow-lg"
              />
            </div>
          </div>
          
          <div className="text-center space-y-8 max-w-4xl mx-auto mt-20">
            <div className="text-7xl mb-6 animate-pulse">🌺</div>
            <h1 className="text-6xl md:text-7xl font-bold text-white drop-shadow-2xl tracking-tight">
              Bloom for Lungs
            </h1>
            <p className="text-xl md:text-2xl text-white/95 leading-relaxed font-medium">
              Join the movement for healthier lungs and a tobacco-free future. 
              <br />
              Every pledge helps our community reach maximum lung health.
            </p>
            <div className="glass-card rounded-2xl px-8 py-4 inline-block nature-shadow">
              <p className="text-white font-bold text-xl mb-1">
                🌟 IKSC KARE Initiative 🌟
              </p>
              <p className="text-white/90 text-base">
                Promoting healthy lungs and tobacco-free communities
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-white/90">
              <span className="glass-card rounded-full px-6 py-3 text-sm font-semibold hover:scale-105 transition-transform">
                🌱 #BloomForLungs
              </span>
              <span className="glass-card rounded-full px-6 py-3 text-sm font-semibold hover:scale-105 transition-transform">
                💚 #HealthyChoice
              </span>
              <span className="glass-card rounded-full px-6 py-3 text-sm font-semibold hover:scale-105 transition-transform">
                🚭 #TobaccoFree
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Section */}
      <div className="py-16 bg-white/95 backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-forest-green mb-12 tracking-tight">
            Our Growing Impact
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center p-8 hover:shadow-organic transition-all duration-300 hover:scale-105 border-2 border-leaf-green/20 bg-gradient-to-br from-white to-fresh-mint/10">
                <CardContent className="space-y-3">
                  <div className="text-4xl pulse-grow" style={{animationDelay: `${index * 0.5}s`}}>{stat.icon}</div>
                  <div className="text-3xl font-bold text-forest-green">{stat.value}</div>
                  <div className="text-sm text-leaf-green font-medium">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Main Content */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Enhanced Pledge Form Section */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">
                Take Your Pledge Today
              </h2>
              <p className="text-white/95 text-xl leading-relaxed">
                Join thousands of others who have committed to healthier lungs and a tobacco-free lifestyle. 
                Your pledge makes a difference!
              </p>
            </div>
            <div className="glass-card rounded-3xl p-8 nature-shadow">
              <PledgeForm onPledgeSubmit={handlePledgeSubmit} />
            </div>
          </div>

          {/* Enhanced 3D Lungs Model */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">
                Watch Our Lungs Heal
              </h2>
              <p className="text-white/95 text-xl leading-relaxed">
                Every pledge brings us closer to maximum lung health! 
                See the progress towards our goal of 200 pledges.
              </p>
            </div>
            <div className="nature-shadow rounded-3xl overflow-hidden">
              <LungsModel3D pledgeCount={pledgeCount} shouldAnimate={shouldAnimateLungs} />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Call to Action */}
      <div className="bg-gradient-to-br from-white/95 to-fresh-mint/20 backdrop-blur-lg py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-forest-green mb-8 tracking-tight">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-leaf-green mb-12 max-w-3xl mx-auto leading-relaxed">
            Your commitment to a tobacco-free lifestyle inspires others and contributes to a healthier world. 
            Together, we can achieve maximum lung health!
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              className="bg-gradient-to-r from-forest-green to-leaf-green hover:from-leaf-green hover:to-fresh-mint text-white px-10 py-4 text-xl rounded-full shadow-nature hover:shadow-organic transition-all duration-300 hover:scale-105 font-semibold"
              onClick={() => document.querySelector('#pledge-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              🌸 Take the Pledge
            </Button>
            <Button 
              variant="outline"
              className="border-2 border-forest-green text-forest-green hover:bg-forest-green hover:text-white px-10 py-4 text-xl rounded-full shadow-leaf hover:shadow-organic transition-all duration-300 hover:scale-105 font-semibold"
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
