import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import EmailLogin from './EmailLogin';

const Login = () => {
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const location = useLocation();
  const [autoFriendId, setAutoFriendId] = useState(null);
  const [returnUrl, setReturnUrl] = useState(null);

  useEffect(() => {
    // Check if we have state from navigation (auto-friend functionality)
    if (location.state) {
      setAutoFriendId(location.state.autoFriend);
      setReturnUrl(location.state.returnUrl);
    }
  }, [location]);

  const handleGoogleLogin = async () => {
    try {
      // Store auto-friend data in sessionStorage for after OAuth redirect
      if (autoFriendId && returnUrl) {
        sessionStorage.setItem('autoFriendId', autoFriendId);
        sessionStorage.setItem('returnUrl', returnUrl);
      }
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (error) {
      alert('Error logging in: ' + error.message);
    }
  };

  if (showEmailLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="bg-slate-800 border border-white/20 p-8 max-w-md w-full mx-4">
          <h1 className="text-3xl font-bold text-white text-center mb-8">THE CANON</h1>
          <EmailLogin onBack={() => setShowEmailLogin(false)} autoFriendId={autoFriendId} returnUrl={returnUrl} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
      <div className="bg-slate-800 border border-white/20 p-8 max-w-md w-full mx-4">
        <h1 className="text-3xl font-bold text-white text-center mb-2">THE CANON</h1>
        <p className="text-gray-400 text-center mb-8">Settle the Canon. Start the war.</p>
        
        <div className="space-y-3">
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-3 px-4 flex items-center justify-center gap-3 transition-colors"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Sign in with Google
          </button>
          
          <button
            onClick={() => setShowEmailLogin(true)}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 transition-colors"
          >
            Sign in with Email
          </button>
        </div>
        
        <p className="text-gray-500 text-sm text-center mt-6">
          {autoFriendId 
            ? "Sign in to add your friend and join the community"
            : "Join the community and start ranking the greatest rappers of all time"
          }
        </p>
      </div>
    </div>
  );
};

export default Login;