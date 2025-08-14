import React, { useState } from 'react';
import { 
  MessageCircle, 
  Swords, 
  Share2, 
  Heart, 
  Trophy,
  Zap,
  Copy,
  CheckCircle
} from 'lucide-react';

const QuickSocialActions = ({ 
  targetUser,
  targetList,
  targetArtist,
  currentUser,
  onChallenge,
  onMessage,
  onShare,
  onLike,
  className = ''
}) => {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);

  const handleChallenge = () => {
    if (targetArtist) {
      // Challenge friend to a face-off with this artist
      onChallenge?.({
        type: 'artist_battle',
        artist: targetArtist,
        opponent: targetUser,
        message: `Let's settle this - ${targetArtist.name} face-off!`
      });
    } else if (targetList) {
      // Challenge friend to make their own version
      onChallenge?.({
        type: 'list_challenge',
        list: targetList,
        opponent: targetUser,
        message: `Think you can do better? Make your own ${targetList.title}!`
      });
    }
  };

  const handleQuickMessage = (messageType) => {
    const messages = {
      fire: "🔥 This list is fire!",
      disagree: "I gotta respectfully disagree on this one...",
      curious: "What made you rank it this way?",
      collab: "We should collab on a list together!",
      respect: "Respect the taste! 🙌",
      debate: "This needs a proper debate thread..."
    };

    onMessage?.({
      recipient: targetUser,
      content: messages[messageType],
      context: { list: targetList, artist: targetArtist }
    });
  };

  const handleShare = async () => {
    const shareText = targetList 
      ? `Check out ${targetUser?.username}'s "${targetList.title}" ranking on The Canon!`
      : `${targetUser?.username} has great taste in music on The Canon!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'The Canon',
          text: shareText,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    
    onShare?.(shareText);
  };

  const handleLike = () => {
    setLiked(!liked);
    onLike?.({
      target: targetList || targetArtist,
      targetUser,
      action: liked ? 'unlike' : 'like'
    });
  };

  return (
    <div className={`${className} flex flex-wrap gap-2`}>
      {/* Quick React */}
      <button
        onClick={handleLike}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
          liked 
            ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
            : 'bg-black/30 hover:bg-red-500/10 text-gray-400 hover:text-red-400'
        }`}
      >
        <Heart className={`w-3 h-3 ${liked ? 'fill-current' : ''}`} />
        {liked ? 'Liked' : 'Like'}
      </button>

      {/* Challenge to Battle */}
      <button
        onClick={handleChallenge}
        className="flex items-center gap-1 px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-full text-xs font-medium transition-all border border-orange-500/30"
      >
        <Swords className="w-3 h-3" />
        Challenge
      </button>

      {/* Quick Message Reactions */}
      <div className="flex gap-1">
        <button
          onClick={() => handleQuickMessage('fire')}
          className="px-2 py-1.5 bg-black/30 hover:bg-orange-500/20 text-xs rounded-full transition-all"
          title="This is fire!"
        >
          🔥
        </button>
        <button
          onClick={() => handleQuickMessage('respect')}
          className="px-2 py-1.5 bg-black/30 hover:bg-green-500/20 text-xs rounded-full transition-all"
          title="Respect!"
        >
          🙌
        </button>
        <button
          onClick={() => handleQuickMessage('disagree')}
          className="px-2 py-1.5 bg-black/30 hover:bg-yellow-500/20 text-xs rounded-full transition-all"
          title="I disagree"
        >
          🤔
        </button>
        <button
          onClick={() => handleQuickMessage('curious')}
          className="px-2 py-1.5 bg-black/30 hover:bg-blue-500/20 text-xs rounded-full transition-all"
          title="Tell me more"
        >
          💭
        </button>
      </div>

      {/* Message */}
      <button
        onClick={() => onMessage?.({ recipient: targetUser })}
        className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-full text-xs font-medium transition-all border border-blue-500/30"
      >
        <MessageCircle className="w-3 h-3" />
        Message
      </button>

      {/* Share */}
      <button
        onClick={handleShare}
        className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-full text-xs font-medium transition-all border border-purple-500/30"
      >
        {copied ? (
          <>
            <CheckCircle className="w-3 h-3" />
            Copied!
          </>
        ) : (
          <>
            <Share2 className="w-3 h-3" />
            Share
          </>
        )}
      </button>
    </div>
  );
};

// Quick Actions for Artist Cards
export const ArtistSocialActions = ({ 
  artist, 
  currentUser, 
  onChallenge,
  onAddToPlaylist,
  onCompare,
  className = '' 
}) => {
  return (
    <div className={`${className} flex gap-2`}>
      <button
        onClick={() => onChallenge?.({ type: 'artist_battle', artist })}
        className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-xs font-medium transition-all border border-red-500/30 flex items-center justify-center gap-1"
      >
        <Swords className="w-3 h-3" />
        Battle
      </button>
      
      <button
        onClick={() => onCompare?.(artist)}
        className="flex-1 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded text-xs font-medium transition-all border border-blue-500/30 flex items-center justify-center gap-1"
      >
        <Trophy className="w-3 h-3" />
        Compare
      </button>
      
      <button
        onClick={() => onAddToPlaylist?.(artist)}
        className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded transition-all border border-green-500/30"
      >
        <Zap className="w-3 h-3" />
      </button>
    </div>
  );
};

export default QuickSocialActions;