import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Crown, UserPlus, Trophy, Heart, MessageCircle, Share2, Loader2 } from 'lucide-react';

const ShareProfile = ({ supabase, currentSession }) => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [goatList, setGoatList] = useState([]);
  const [addingFriend, setAddingFriend] = useState(false);
  const [friendAdded, setFriendAdded] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      setUserData(profile);

      // Get user's GOAT list
      const { data: lists, error: listsError } = await supabase
        .from('user_lists')
        .select('*')
        .eq('user_id', userId)
        .eq('is_all_time', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (listsError) throw listsError;

      let goatData = [];
      if (lists && lists.length > 0) {
        goatData = lists[0].list_data || [];
        setGoatList(goatData.slice(0, 5)); // Top 5 for preview
      }

      // Update document meta tags for social sharing
      updateMetaTags(profile, goatData.slice(0, 5));

    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('User not found');
    } finally {
      setLoading(false);
    }
  };

  const updateMetaTags = (profile, top5) => {
    const username = profile.username || 'Anonymous';
    const title = `${username}'s Greatest of All Time - The Canon`;
    const description = top5.length > 0 
      ? `${username}'s Top 5: ${top5.map(item => item.name).join(', ')}`
      : `Check out ${username}'s rankings on The Canon`;

    // Update page title
    document.title = title;

    // Update meta tags
    const metaTags = [
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'twitter:title', content: title },
      { property: 'twitter:description', content: description },
      { name: 'description', content: description }
    ];

    metaTags.forEach(({ property, name, content }) => {
      const selector = property ? `meta[property="${property}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector);
      if (!meta) {
        meta = document.createElement('meta');
        if (property) meta.setAttribute('property', property);
        if (name) meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    });
  };

  const handleAddFriend = async () => {
    if (!currentSession) {
      // Redirect to login with return URL
      navigate('/', { state: { returnUrl: `/share/${userId}`, autoFriend: userId } });
      return;
    }

    setAddingFriend(true);
    try {
      // Check if already friends
      const { data: existingFriendship } = await supabase
        .from('friendships')
        .select('*')
        .or(`requester_id.eq.${currentSession.user.id},accepter_id.eq.${currentSession.user.id}`)
        .or(`requester_id.eq.${userId},accepter_id.eq.${userId}`)
        .single();

      if (existingFriendship) {
        setFriendAdded(true);
        setAddingFriend(false);
        return;
      }

      // Send friend request
      const { error: requestError } = await supabase
        .from('friendships')
        .insert({
          requester_id: currentSession.user.id,
          accepter_id: userId,
          status: 'pending'
        });

      if (requestError) throw requestError;

      setFriendAdded(true);
    } catch (err) {
      console.error('Error adding friend:', err);
    } finally {
      setAddingFriend(false);
    }
  };

  const handleEnterApp = () => {
    if (currentSession) {
      navigate('/');
    } else {
      navigate('/', { state: { returnUrl: `/share/${userId}`, autoFriend: userId } });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <Crown className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h1 className="text-2xl font-bold mb-2">The Canon</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={handleEnterApp}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 transition-colors rounded-lg"
          >
            Enter The Canon
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Crown className="w-8 h-8 text-yellow-500" />
            <h1 className="text-xl font-bold">The Canon</h1>
          </div>
          <button
            onClick={handleEnterApp}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 transition-colors rounded-lg text-sm"
          >
            Enter App
          </button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold">
                  {userData?.username?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{userData?.username || 'Anonymous'}</h2>
                <p className="text-gray-400">Hip-hop enthusiast</p>
              </div>
            </div>
            
            {currentSession?.user?.id !== userId && (
              <button
                onClick={handleAddFriend}
                disabled={addingFriend || friendAdded}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  friendAdded 
                    ? 'bg-green-600 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {addingFriend ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : friendAdded ? (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Friend Request Sent</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Add Friend</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* GOAT List Preview */}
          {goatList.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <h3 className="text-lg font-semibold">Greatest of All Time - Top 5</h3>
              </div>
              <div className="space-y-2">
                {goatList.map((artist, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{artist.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className="bg-slate-700 rounded-lg p-4 text-center">
            <h4 className="text-lg font-semibold mb-2">Join The Canon</h4>
            <p className="text-gray-400 mb-4">
              Create your own rankings, engage in face-offs, and settle hip-hop debates with the community
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={handleEnterApp}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 transition-colors rounded-lg"
              >
                Get Started
              </button>
              {!currentSession && (
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <span>•</span>
                  <span>Sign up to add {userData?.username} as a friend</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareProfile;