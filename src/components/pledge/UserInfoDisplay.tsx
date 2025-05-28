
import React from 'react';
import { User } from '@supabase/supabase-js';

interface UserInfoDisplayProps {
  user: User;
}

const UserInfoDisplay: React.FC<UserInfoDisplayProps> = ({ user }) => {
  return (
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 mb-4">
      <div className="flex items-center space-x-3">
        {user.user_metadata?.avatar_url && (
          <img 
            src={user.user_metadata.avatar_url} 
            alt="Profile" 
            className="w-10 h-10 rounded-full border-2 border-emerald-300"
          />
        )}
        <div>
          <p className="text-sm font-medium text-emerald-800">
            Signed in as: {user.email}
          </p>
          <p className="text-xs text-emerald-600">Email automatically secured</p>
        </div>
      </div>
    </div>
  );
};

export default UserInfoDisplay;
