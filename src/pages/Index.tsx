
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
    { label: 'Total Pledges', value: pledgeCount, icon: '🌸', color: 'from-pink-400 to-rose-500' },
    { label: 'Lives Impacted', value: pledgeCount * 3, icon: '❤️', color: 'from-red-400 to-pink-500' },
    { label: 'Tobacco-Free Days', value: pledgeCount * 30, icon: '📅', color: 'from-green-400 to-emerald-500' },
    { label: 'Healthy Breaths', value: `${(pledgeCount * 20000).toLocaleString()}+`, icon: '🫁', color: 'from-blue-400 to-cyan-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-purple-100 vibrant-organic-bg">
      {/* Enhanced Hero Section with rainbow magic */}
      <div className="relative overflow-hidden">
        {/* Magical background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 via-blue-400/15 to-purple-400/20 backdrop-blur-sm"></div>
        <div className="absolute inset-0 vibrant-organic-bg opacity-40"></div>
        
        {/* Floating magical elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 text-4xl opacity-60 floating-sparkle">🌈</div>
          <div className="absolute top-40 right-20 text-3xl opacity-70 gentle-bounce" style={{animationDelay: '2s'}}>✨</div>
          <div className="absolute bottom-40 left-1/4 text-5xl opacity-50 magical-rotate" style={{animationDelay: '1s'}}>🌟</div>
          <div className="absolute top-60 right-1/3 text-2xl opacity-60 pulse-rainbow" style={{animationDelay: '3s'}}>💫</div>
          <div className="absolute top-80 left-1/2 text-3xl opacity-50 floating-sparkle" style={{animationDelay: '4s'}}>🦋</div>
        </div>
        
        <div className="relative container mx-auto px-4 py-16">
          {/* Enhanced logos with rainbow glow */}
          <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-10">
            <div className="rainbow-glass-card rounded-xl p-3 rainbow-glow magic-sparkles">
              <img 
                src="/lovable-uploads/fbdff461-1ffb-485c-8e93-3141b2515bc0.png" 
                alt="IKSC Logo" 
                className="h-20 w-auto object-contain drop-shadow-2xl"
              />
            </div>
            <div className="rainbow-glass-card rounded-xl p-3 rainbow-glow magic-sparkles">
              <img 
                src="/lovable-uploads/9c57fcd0-54f8-4f2a-8ff5-70b9175a0fb4.png" 
                alt="KARE Logo" 
                className="h-20 w-auto object-contain drop-shadow-2xl"
              />
            </div>
          </div>
          
          <div className="text-center space-y-8 max-w-4xl mx-auto mt-20">
            <div className="text-8xl mb-6 pulse-rainbow magic-sparkles">🌺</div>
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow-2xl tracking-tight magic-sparkles">
              Bloom for Lungs
            </h1>
            <p className="text-xl md:text-2xl bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent leading-relaxed font-medium">
              Join the movement for healthier lungs and a tobacco-free future. 
              <br />
              Every pledge helps our community reach maximum lung health.
            </p>
            <div className="rainbow-glass-card rounded-2xl px-8 py-6 inline-block vibrant-nature-shadow magic-sparkles">
              <p className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent font-bold text-xl mb-2">
                🌟 IKSC KARE Initiative 🌟
              </p>
              <p className="bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent text-base font-semibold">
                Promoting healthy lungs and tobacco-free communities
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="rainbow-glass-card rounded-full px-6 py-3 text-sm font-semibold hover:scale-110 transition-all duration-300 bg-gradient-to-r from-green-400 to-blue-500 text-white gentle-bounce">
                🌱 #BloomForLungs
              </span>
              <span className="rainbow-glass-card rounded-full px-6 py-3 text-sm font-semibold hover:scale-110 transition-all duration-300 bg-gradient-to-r from-pink-400 to-purple-500 text-white gentle-bounce" style={{animationDelay: '1s'}}>
                💚 #HealthyChoice
              </span>
              <span className="rainbow-glass-card rounded-full px-6 py-3 text-sm font-semibold hover:scale-110 transition-all duration-300 bg-gradient-to-r from-blue-400 to-green-500 text-white gentle-bounce" style={{animationDelay: '2s'}}>
                🚭 #TobaccoFree
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Section with rainbow cards */}
      <div className="py-16 bg-gradient-to-r from-white/95 via-green-50/90 to-blue-50/95 backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-green-500 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-12 tracking-tight magic-sparkles">
            Our Growing Impact
          </h2>
          <div className="mobile-grid-fix md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className={`mobile-center p-8 hover:shadow-2xl transition-all duration-500 hover:scale-110 border-2 border-transparent bg-gradient-to-br ${stat.color} rainbow-glow magic-sparkles`}>
                <CardContent className="space-y-3">
                  <div className="text-4xl pulse-rainbow magic-sparkles" style={{animationDelay: `${index * 0.5}s`}}>{stat.icon}</div>
                  <div className="text-3xl font-bold text-white drop-shadow-lg">{stat.value}</div>
                  <div className="text-sm text-white/90 font-medium">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Main Content with rainbow theme */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Enhanced Pledge Form Section */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-500 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 tracking-tight magic-sparkles">
                Take Your Pledge Today
              </h2>
              <p className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent text-xl leading-relaxed font-medium">
                Join thousands of others who have committed to healthier lungs and a tobacco-free lifestyle. 
                Your pledge makes a difference!
              </p>
            </div>
            <div className="rainbow-glass-card rounded-3xl p-8 vibrant-nature-shadow magic-sparkles">
              <PledgeForm onPledgeSubmit={handlePledgeSubmit} />
            </div>
          </div>

          {/* Enhanced 3D Lungs Model */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-500 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 tracking-tight magic-sparkles">
                Watch Our Lungs Heal
              </h2>
              <p className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent text-xl leading-relaxed font-medium">
                Every pledge brings us closer to maximum lung health! 
                See the progress towards our goal of 200 pledges.
              </p>
            </div>
            <div className="vibrant-nature-shadow rounded-3xl overflow-hidden rainbow-glow">
              <LungsModel3D pledgeCount={pledgeCount} shouldAnimate={shouldAnimateLungs} />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Call to Action */}
      <div className="bg-gradient-to-br from-green-50/95 via-blue-50/90 to-purple-50/95 backdrop-blur-lg py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-500 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-8 tracking-tight magic-sparkles">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
            Your commitment to a tobacco-free lifestyle inspires others and contributes to a healthier world. 
            Together, we can achieve maximum lung health!
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 hover:from-green-500 hover:via-blue-600 hover:to-purple-700 text-white px-12 py-6 text-xl rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110 font-bold rainbow-glow magic-sparkles"
              onClick={() => document.querySelector('#pledge-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              🌸 Take the Pledge
            </Button>
            <Button 
              variant="outline"
              className="border-4 border-transparent bg-gradient-to-r from-green-400 to-purple-600 p-1 rounded-full hover:scale-110 transition-all duration-300 magic-sparkles"
            >
              <span className="bg-white px-10 py-5 text-xl rounded-full font-bold bg-gradient-to-r from-green-600 to-purple-600 bg-clip-text text-transparent">
                📖 Learn More
              </span>
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
