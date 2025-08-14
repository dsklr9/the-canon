import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Music, 
  TrendingUp, 
  Users, 
  Zap,
  Star,
  Award,
  ChevronRight
} from 'lucide-react';

const FriendCompatibility = ({ 
  userRankings, 
  friendRankings, 
  userName,
  friendName,
  onViewDetails,
  className = '' 
}) => {
  const [score, setScore] = useState(0);
  const [breakdown, setBreakdown] = useState(null);
  const [sharedFavorites, setSharedFavorites] = useState([]);
  const [isCalculating, setIsCalculating] = useState(true);

  useEffect(() => {
    calculateCompatibility();
  }, [userRankings, friendRankings]);

  const calculateCompatibility = () => {
    if (!userRankings?.length || !friendRankings?.length) {
      setIsCalculating(false);
      return;
    }

    // Find shared artists
    const userArtistIds = new Set(userRankings.map(a => a.id));
    const friendArtistIds = new Set(friendRankings.map(a => a.id));
    const sharedIds = [...userArtistIds].filter(id => friendArtistIds.has(id));
    
    // Calculate position differences
    let positionScore = 0;
    let sharedTop5 = 0;
    const shared = [];
    
    sharedIds.forEach(id => {
      const userPos = userRankings.findIndex(a => a.id === id) + 1;
      const friendPos = friendRankings.findIndex(a => a.id === id) + 1;
      const diff = Math.abs(userPos - friendPos);
      
      // Score based on how close the rankings are
      const artistScore = Math.max(0, 10 - diff) * 10;
      positionScore += artistScore;
      
      if (userPos <= 5 && friendPos <= 5) {
        sharedTop5++;
      }
      
      const artist = userRankings.find(a => a.id === id);
      shared.push({
        artist,
        userPos,
        friendPos,
        diff,
        score: artistScore
      });
    });
    
    // Calculate final score
    const overlapPercentage = (sharedIds.length / Math.min(userRankings.length, friendRankings.length)) * 100;
    const positionAlignment = positionScore / (sharedIds.length * 100) * 100;
    const diversityScore = Math.min(100, (sharedIds.length / 5) * 100);
    
    const finalScore = Math.round(
      (overlapPercentage * 0.4) + 
      (positionAlignment * 0.4) + 
      (diversityScore * 0.2)
    );

    setScore(Math.min(100, finalScore));
    setSharedFavorites(shared.sort((a, b) => b.score - a.score).slice(0, 3));
    setBreakdown({
      sharedCount: sharedIds.length,
      overlapPercentage: Math.round(overlapPercentage),
      positionAlignment: Math.round(positionAlignment),
      sharedTop5,
      totalPossible: Math.min(userRankings.length, friendRankings.length)
    });
    setIsCalculating(false);
  };

  const getCompatibilityLevel = () => {
    if (score >= 90) return { label: 'Twin Flames', color: 'text-purple-400', icon: '🔥' };
    if (score >= 75) return { label: 'Soulmates', color: 'text-pink-400', icon: '💜' };
    if (score >= 60) return { label: 'Vibing', color: 'text-green-400', icon: '✨' };
    if (score >= 40) return { label: 'Compatible', color: 'text-blue-400', icon: '🎵' };
    if (score >= 20) return { label: 'Different Tastes', color: 'text-yellow-400', icon: '🤔' };
    return { label: 'Opposites', color: 'text-gray-400', icon: '🎭' };
  };

  const level = getCompatibilityLevel();

  if (isCalculating) {
    return (
      <div className={`${className} animate-pulse`}>
        <div className="h-20 bg-gray-700 rounded" />
      </div>
    );
  }

  if (!breakdown) {
    return null;
  }

  return (
    <div className={`${className} bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 p-4 rounded-lg`}>
      {/* Score Display */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm text-gray-400 mb-1">Music Compatibility</h3>
          <div className="flex items-center gap-2">
            <span className={`text-3xl font-bold ${level.color}`}>{score}%</span>
            <span className="text-2xl">{level.icon}</span>
          </div>
          <p className={`text-sm ${level.color} font-medium`}>{level.label}</p>
        </div>
        
        {/* Visual Score Bar */}
        <div className="flex-1 max-w-xs mx-4">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 bg-black/30 rounded">
          <Music className="w-4 h-4 mx-auto mb-1 text-purple-400" />
          <p className="text-lg font-bold">{breakdown.sharedCount}</p>
          <p className="text-xs text-gray-400">Shared Artists</p>
        </div>
        <div className="text-center p-2 bg-black/30 rounded">
          <Star className="w-4 h-4 mx-auto mb-1 text-yellow-400" />
          <p className="text-lg font-bold">{breakdown.sharedTop5}</p>
          <p className="text-xs text-gray-400">Top 5 Match</p>
        </div>
        <div className="text-center p-2 bg-black/30 rounded">
          <TrendingUp className="w-4 h-4 mx-auto mb-1 text-green-400" />
          <p className="text-lg font-bold">{breakdown.positionAlignment}%</p>
          <p className="text-xs text-gray-400">Rank Align</p>
        </div>
      </div>

      {/* Shared Favorites */}
      {sharedFavorites.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs text-gray-400 mb-2">You Both Love</h4>
          <div className="space-y-1">
            {sharedFavorites.map(({ artist, userPos, friendPos }) => {
              // Handle artist avatar - could be emoji or URL
              const avatarDisplay = (() => {
                const avatar = artist.avatar_url || artist.avatar;
                if (!avatar) return '🎤';
                
                // Check if it's a URL (contains http or starts with /)
                if (typeof avatar === 'string' && (avatar.startsWith('http') || avatar.startsWith('/'))) {
                  return (
                    <img 
                      src={avatar} 
                      alt={artist.name} 
                      className="w-6 h-6 rounded-full object-cover"
                      onError={(e) => {
                        // Fallback to emoji if image fails to load
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'inline';
                      }}
                    />
                  );
                }
                
                // It's an emoji
                return <span className="text-lg">{avatar}</span>;
              })();
              
              return (
                <div key={artist.id} className="flex items-center justify-between p-2 bg-black/20 rounded">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      {avatarDisplay}
                      <span className="text-lg hidden">🎤</span>
                    </div>
                    <span className="text-sm font-medium">{artist.name}</span>
                  </div>
                  <div className="flex gap-3 text-xs">
                    <span className="text-gray-400">You: #{userPos}</span>
                    <span className="text-gray-400">{friendName}: #{friendPos}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button 
          onClick={onViewDetails}
          className="flex-1 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded text-sm font-medium transition-colors flex items-center justify-center gap-1"
        >
          View Full Comparison
          <ChevronRight className="w-4 h-4" />
        </button>
        <button className="p-2 bg-black/30 hover:bg-white/10 rounded transition-colors">
          <Heart className="w-4 h-4" />
        </button>
      </div>

      {/* Fun Message */}
      {score >= 75 && (
        <div className="mt-3 p-2 bg-purple-500/10 border border-purple-500/20 rounded">
          <p className="text-xs text-purple-300 text-center">
            🎉 You two should definitely share playlists!
          </p>
        </div>
      )}
    </div>
  );
};

export default FriendCompatibility;