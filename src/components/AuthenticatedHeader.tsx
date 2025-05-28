
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const AuthenticatedHeader = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out. Thank you for your participation!",
      });
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Sign out failed",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="absolute top-4 right-4 z-20 flex items-center space-x-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center space-x-3 shadow-lg border border-green-600/30">
        {user?.user_metadata?.avatar_url ? (
          <img 
            src={user.user_metadata.avatar_url} 
            alt="Profile" 
            className="w-8 h-8 rounded-full border-2 border-green-500"
          />
        ) : (
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-green-800 font-medium text-sm">
            {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
          </span>
          <span className="text-green-600 text-xs">
            {user?.email}
          </span>
        </div>
        <Button
          onClick={handleSignOut}
          variant="ghost"
          size="sm"
          className="text-green-700 hover:text-red-600 hover:bg-red-50 p-1 transition-colors"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default AuthenticatedHeader;
