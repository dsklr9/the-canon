import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Trophy, 
  Plus, 
  Swords, 
  TrendingUp,
  Users,
  Sparkles,
  Music
} from 'lucide-react';

const LiveActivityFeed = ({ 
  supabase, 
  currentUser, 
  friends = [],
  onUserClick,
  onArtistClick,
  className = '' 
}) => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Activity type configs with colors and icons
  const activityConfig = {
    ranking_created: {
      icon: Trophy,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      format: (activity) => `created a new ranking "${activity.metadata?.title}"`
    },
    artist_added: {
      icon: Plus,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      format: (activity) => `added ${activity.metadata?.artist} to their Top 10`
    },
    debate_posted: {
      icon: MessageCircle,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      format: (activity) => `started a debate: "${activity.metadata?.title}"`
    },
    faceoff_vote: {
      icon: Swords,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      format: (activity) => `voted for ${activity.metadata?.winner} over ${activity.metadata?.loser}`
    },
    friend_added: {
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      format: (activity) => `became friends with ${activity.metadata?.friendName}`
    },
    achievement_earned: {
      icon: Sparkles,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      format: (activity) => `earned the "${activity.metadata?.badge}" badge! 🏆`
    },
    hot_take: {
      icon: TrendingUp,
      color: 'text-pink-400',
      bg: 'bg-pink-500/10',
      format: (activity) => `${activity.metadata?.artistRank} should be #1`
    },
    list_liked: {
      icon: Heart,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      format: (activity) => `liked ${activity.metadata?.ownerName}'s ranking`
    },
    now_playing: {
      icon: Music,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      format: (activity) => `is listening to ${activity.metadata?.artist}`
    }
  };

  // Load recent activities
  useEffect(() => {
    loadActivities();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('activity-feed')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'activities',
          filter: friends.length > 0 ? `user_id=in.(${friends.map(f => f.id).join(',')})` : null
        }, 
        (payload) => {
          // Add new activity to top of feed
          if (payload.new) {
            setActivities(prev => [formatActivity(payload.new), ...prev].slice(0, 20));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [friends, supabase]);

  const loadActivities = async () => {
    if (!currentUser || friends.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      // Get friend IDs
      const friendIds = friends.map(f => f.id);
      
      // Mock activities for now (replace with actual DB query)
      const mockActivities = generateMockActivities(friends);
      setActivities(mockActivities);
      
      // In production, use:
      /*
      const { data, error } = await supabase
        .from('activities')
        .select('*, profiles!user_id(username, avatar_url)')
        .in('user_id', friendIds)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (data) {
        setActivities(data.map(formatActivity));
      }
      */
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatActivity = (activity) => {
    return {
      ...activity,
      timeAgo: getTimeAgo(activity.created_at || new Date())
    };
  };

  const generateMockActivities = (friends) => {
    const types = Object.keys(activityConfig);
    const mockData = [];
    
    for (let i = 0; i < 10; i++) {
      const friend = friends[Math.floor(Math.random() * friends.length)] || { username: 'User' };
      const type = types[Math.floor(Math.random() * types.length)];
      
      mockData.push({
        id: `mock-${i}`,
        user_id: friend.id,
        username: friend.username,
        type,
        created_at: new Date(Date.now() - Math.random() * 3600000),
        metadata: getMockMetadata(type)
      });
    }
    
    return mockData
      .sort((a, b) => b.created_at - a.created_at)
      .map(formatActivity);
  };

  const getMockMetadata = (type) => {
    const artists = ['Kendrick Lamar', 'J. Cole', 'Drake', 'Nas', 'Jay-Z', 'Eminem'];
    const titles = ['GOAT Debate', 'Lyricists Only', 'Best Albums 2024', 'Underground Kings'];
    
    switch(type) {
      case 'artist_added':
        return { artist: artists[Math.floor(Math.random() * artists.length)] };
      case 'debate_posted':
        return { title: titles[Math.floor(Math.random() * titles.length)] };
      case 'faceoff_vote':
        const [winner, loser] = [artists[0], artists[1]];
        return { winner, loser };
      case 'ranking_created':
        return { title: titles[Math.floor(Math.random() * titles.length)] };
      case 'achievement_earned':
        return { badge: 'Tastemaker' };
      case 'hot_take':
        return { artistRank: artists[Math.floor(Math.random() * artists.length)] };
      case 'friend_added':
        return { friendName: 'MusicHead2024' };
      case 'list_liked':
        return { ownerName: 'HipHopFan' };
      case 'now_playing':
        return { artist: artists[Math.floor(Math.random() * artists.length)] };
      default:
        return {};
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (isLoading) {
    return (
      <div className={`${className} animate-pulse`}>
        <div className="h-6 bg-gray-700 rounded w-32 mb-4" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-3 p-3 mb-2">
            <div className="w-8 h-8 bg-gray-700 rounded-full" />
            <div className="flex-1">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-700 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities.length) {
    return (
      <div className={`${className} text-center py-8 text-gray-400`}>
        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No friend activity yet</p>
        <p className="text-xs mt-1">Add friends to see their activity!</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          Friend Activity
        </h3>
        <span className="text-xs text-gray-400">Live</span>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {activities.map((activity) => {
          const config = activityConfig[activity.type];
          if (!config) return null;
          
          const Icon = config.icon;
          
          return (
            <div 
              key={activity.id}
              className={`flex items-start gap-3 p-3 ${config.bg} border border-white/5 rounded-lg hover:border-white/10 transition-all cursor-pointer group`}
              onClick={() => onUserClick?.(activity.user_id)}
            >
              <div className={`w-8 h-8 ${config.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${config.color}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUserClick?.(activity.user_id || activity.username);
                    }}
                    className="font-medium text-white hover:text-purple-400 transition-colors"
                  >
                    {activity.username}
                  </button>
                  <span className="text-gray-300 ml-1">
                    {config.format(activity)}
                  </span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {activity.timeAgo}
                </p>
              </div>

              {/* Quick action button */}
              <button 
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white/10 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle quick action based on type
                }}
              >
                <Heart className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

      {activities.length >= 20 && (
        <button className="w-full mt-3 py-2 text-xs text-gray-400 hover:text-white transition-colors">
          Load more activity
        </button>
      )}
    </div>
  );
};

export default LiveActivityFeed;