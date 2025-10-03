import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import TheCanon from './components/TheCanon';
import Login from './components/Login';
import TermsOfService from './components/TermsOfService';
import PrivacyPolicy from './components/PrivacyPolicy';
import ShareProfile from './components/ShareProfile';
import { supabase } from './lib/supabase';
import './index.css';

function AppContent() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleAutoFriend = async (currentUserId, friendId) => {
    try {
      // Check if already friends
      const { data: existingFriendship } = await supabase
        .from('friendships')
        .select('*')
        .or(`user_id.eq.${currentUserId},friend_id.eq.${currentUserId}`)
        .or(`user_id.eq.${friendId},friend_id.eq.${friendId}`)
        .single();

      if (existingFriendship) {
        console.log('Already friends or friendship request exists');
        return;
      }

      // Send friend request
      const { error } = await supabase
        .from('friendships')
        .insert({
          user_id: currentUserId,
          friend_id: friendId,
          status: 'pending'
        });

      if (error) throw error;
      console.log('Friend request sent successfully');
    } catch (err) {
      console.error('Error sending auto-friend request:', err);
    }
  };

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for login/logout
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<TheCanon supabase={supabase} />} />
      <Route path="/login" element={<Login />} />
      <Route path="/share/:userId" element={<ShareProfile supabase={supabase} currentSession={session} />} />
      <Route path="/u/:username" element={<ShareProfile supabase={supabase} currentSession={session} />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

console.log("DEPLOYED VERSION: v7-mobile-fixes");

export default App;