
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const LoginPage = () => {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 relative overflow-hidden flex items-center justify-center">
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

      {/* Login Content */}
      <div className="relative z-10 w-full max-w-md px-4">
        {/* Header with Logos */}
        <div className="flex justify-center items-center mb-8 space-x-8">
          <img 
            src="/lovable-uploads/fbdff461-1ffb-485c-8e93-3141b2515bc0.png" 
            alt="IKSC Logo" 
            className="h-16 w-auto object-contain drop-shadow-lg"
          />
          <img 
            src="/lovable-uploads/9c57fcd0-54f8-4f2a-8ff5-70b9175a0fb4.png" 
            alt="KARE Logo" 
            className="h-16 w-auto object-contain drop-shadow-lg"
          />
        </div>

        <Card className="bg-white/95 backdrop-blur-sm border-green-600/30 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="text-5xl mb-4">🌺</div>
            <CardTitle className="text-3xl font-bold text-green-800">
              Welcome to Bloom for Lungs
            </CardTitle>
            <CardDescription className="text-green-700 text-lg">
              Join the movement for healthier lungs and a tobacco-free future
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-center text-green-800 font-semibold">
                🌟 IKSC KARE Initiative 🌟
              </p>
              <p className="text-center text-green-700 text-sm mt-1">
                Promoting healthy lungs and tobacco-free communities
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={signInWithGoogle}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-md flex items-center justify-center space-x-3 py-6 text-lg font-medium transition-all duration-300 hover:shadow-lg"
                variant="outline"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </Button>

              <div className="text-center text-sm text-green-600">
                <p>By continuing, you agree to join our mission for</p>
                <p className="font-semibold">healthier lungs and tobacco-free communities</p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mt-6">
              <span className="bg-green-100 text-green-800 rounded-full px-3 py-1 text-xs font-medium">
                🌱 #BloomForLungs
              </span>
              <span className="bg-green-100 text-green-800 rounded-full px-3 py-1 text-xs font-medium">
                💚 #HealthyChoice
              </span>
              <span className="bg-green-100 text-green-800 rounded-full px-3 py-1 text-xs font-medium">
                🚭 #TobaccoFree
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-green-100 text-sm">
            Every pledge brings us closer to maximum lung health
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
