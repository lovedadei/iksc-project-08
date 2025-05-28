
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

const LoginPage = () => {
  const { signInWithGoogle } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
      toast({
        title: "Signing you in...",
        description: "Please wait while we authenticate you with Google.",
      });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Sign-in failed",
        description: "Please try again or check your internet connection.",
        variant: "destructive"
      });
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 relative overflow-hidden">
      {/* Background decorative elements */}
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

      {/* Floating particles animation */}
      <div className="absolute inset-0 z-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Header with Logos */}
        <div className="flex justify-center items-center mb-8 space-x-8">
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

        {/* Welcome Section */}
        <div className="text-center mb-8 max-w-2xl">
          <div className="text-6xl mb-4 animate-bounce">🌺</div>
          <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-2xl mb-4">
            Bloom for Lungs
          </h1>
          <p className="text-lg md:text-xl text-green-100 leading-relaxed">
            Join the movement for healthier lungs and a tobacco-free future
          </p>
          <div className="bg-green-800/50 backdrop-blur-sm rounded-2xl px-6 py-4 inline-block border border-green-600/30 mt-4">
            <p className="text-green-100 font-semibold">
              🌟 IKSC KARE Initiative 🌟
            </p>
            <p className="text-green-200 text-sm mt-1">
              Promoting healthy lungs and tobacco-free communities
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="w-full max-w-md shadow-2xl bg-white/95 backdrop-blur-sm border-0 transform transition-all duration-300 hover:scale-105">
          <CardHeader className="text-center bg-gradient-to-r from-green-600 to-green-700 rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-white">
              Welcome Back
            </CardTitle>
            <p className="text-white/90 text-sm">
              Sign in to make your pledge and join our community
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Sign in with Google
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Secure authentication to prevent fake pledges and ensure community integrity
                </p>
              </div>

              <Button
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="w-full py-4 text-lg font-semibold bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 hover:border-gray-400 transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
              >
                {isSigningIn ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </Button>

              <div className="text-center">
                <p className="text-xs text-gray-500 leading-relaxed">
                  By signing in, you agree to our terms and join our mission for tobacco-free communities. 
                  Your Google account ensures secure, verified pledges.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-green-600/30">
            <div className="text-2xl mb-2">🔒</div>
            <h4 className="font-semibold text-white mb-1">Secure Authentication</h4>
            <p className="text-green-200 text-sm">Google sign-in prevents fake users</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-green-600/30">
            <div className="text-2xl mb-2">🌱</div>
            <h4 className="font-semibold text-white mb-1">Real Impact</h4>
            <p className="text-green-200 text-sm">Every pledge creates real change</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-green-600/30">
            <div className="text-2xl mb-2">👥</div>
            <h4 className="font-semibold text-white mb-1">Join Community</h4>
            <p className="text-green-200 text-sm">Connect with like-minded people</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
