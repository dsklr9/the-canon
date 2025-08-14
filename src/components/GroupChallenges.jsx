import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Users, 
  Clock, 
  Flame, 
  Target,
  CheckCircle,
  Plus,
  Crown,
  Timer,
  Award,
  X
} from 'lucide-react';

const GroupChallenges = ({ 
  currentUser,
  friends = [],
  onJoinChallenge,
  onCreateChallenge,
  onStartWorking,
  className = ''
}) => {
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showChallengeDetails, setShowChallengeDetails] = useState(null);
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    type: 'ranking',
    theme: '',
    duration: '7d',
    maxParticipants: 10
  });

  // Mock challenges data
  useEffect(() => {
    const mockChallenges = [
      {
        id: 1,
        title: "Best Albums of 2024",
        type: "ranking",
        theme: "2024 releases only",
        creator: "MusicHead2024",
        participants: [
          { username: "HipHopFan", completed: true },
          { username: "RapCritic", completed: false },
          { username: "BeatsLover", completed: true }
        ],
        maxParticipants: 10,
        timeLeft: "2 days",
        prize: "Tastemaker Badge",
        status: "active"
      },
      {
        id: 2,
        title: "Underground Kings",
        type: "discovery",
        theme: "Artists with <100k monthly listeners",
        creator: "DiggingDeep",
        participants: [
          { username: "IndieHead", completed: true },
          { username: "SoundHunter", completed: true }
        ],
        maxParticipants: 5,
        timeLeft: "5 hours",
        prize: "Pioneer Badge",
        status: "active"
      },
      {
        id: 3,
        title: "Lyricist Legends",
        type: "debate",
        theme: "Most technical rappers",
        creator: "WordplayWiz",
        participants: [
          { username: "BarBreaker", completed: true },
          { username: "FlowMaster", completed: false },
          { username: "RhymeSchemer", completed: true },
          { username: "LyricLord", completed: false }
        ],
        maxParticipants: 8,
        timeLeft: "1 day",
        prize: "Wordsmith Badge",
        status: "voting"
      }
    ];
    
    setActiveChallenges(mockChallenges);
  }, []);

  const challengeTypes = {
    ranking: { icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    discovery: { icon: Target, color: 'text-green-400', bg: 'bg-green-500/10' },
    debate: { icon: Flame, color: 'text-red-400', bg: 'bg-red-500/10' },
    collaboration: { icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' }
  };

  const handleJoinChallenge = (challenge) => {
    // Check if already participating
    const isParticipating = challenge.participants.some(p => p.username === (currentUser?.username || 'You'));
    
    if (isParticipating) {
      // Show challenge details/submission interface
      setShowChallengeDetails(challenge);
      return;
    }
    
    // Check if challenge is full
    if (challenge.participants.length >= challenge.maxParticipants) {
      // Don't allow joining if full
      return;
    }
    
    // Join the challenge
    setActiveChallenges(prev => 
      prev.map(c => 
        c.id === challenge.id 
          ? {
              ...c,
              participants: [...c.participants, { 
                username: currentUser?.username || 'You', 
                completed: false 
              }]
            }
          : c
      )
    );
    onJoinChallenge?.(challenge);
  };

  const createChallenge = () => {
    if (!newChallenge.title.trim() || !newChallenge.theme.trim()) return;
    
    const challenge = {
      id: Date.now(),
      ...newChallenge,
      creator: currentUser?.username || 'You',
      participants: [{ username: currentUser?.username || 'You', completed: false }],
      timeLeft: newChallenge.duration === '1d' ? '1 day' : 
                newChallenge.duration === '3d' ? '3 days' : 
                newChallenge.duration === '7d' ? '7 days' : '14 days',
      prize: 'Challenge Creator Badge',
      status: 'active'
    };
    
    setActiveChallenges(prev => [challenge, ...prev]);
    setShowCreateModal(false);
    setNewChallenge({
      title: '',
      type: 'ranking',
      theme: '',
      duration: '7d',
      maxParticipants: 10
    });
    
    onCreateChallenge?.(challenge);
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'active': return <Clock className="w-4 h-4 text-green-400" />;
      case 'voting': return <Trophy className="w-4 h-4 text-yellow-400" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-blue-400" />;
      default: return <Timer className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Group Challenges
        </h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="p-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4 text-purple-400" />
        </button>
      </div>

      <div className="space-y-3">
        {activeChallenges.map((challenge) => {
          const typeConfig = challengeTypes[challenge.type];
          const Icon = typeConfig.icon;
          const currentUsername = currentUser?.username || 'You';
          const isParticipating = challenge.participants.some(p => p.username === currentUsername);
          const userCompleted = challenge.participants.find(p => p.username === currentUsername)?.completed;
          const isFull = challenge.participants.length >= challenge.maxParticipants;
          
          return (
            <div 
              key={challenge.id}
              className={`${typeConfig.bg} border border-white/10 p-4 rounded-lg hover:border-white/20 transition-all cursor-pointer group`}
              onClick={() => handleJoinChallenge(challenge)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className={`${typeConfig.bg} p-2 rounded-lg`}>
                    <Icon className={`w-4 h-4 ${typeConfig.color}`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{challenge.title}</h4>
                    <p className="text-xs text-gray-400 mt-1">{challenge.theme}</p>
                    <p className="text-xs text-gray-500">by {challenge.creator}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getStatusIcon(challenge.status)}
                  <span className="text-xs text-gray-400">{challenge.timeLeft}</span>
                </div>
              </div>

              {/* Participants */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className={`text-sm ${isFull ? 'text-orange-300 font-medium' : 'text-gray-300'}`}>
                    {challenge.participants.length}/{challenge.maxParticipants} participants
                    {isFull && <span className="ml-1 text-orange-400">• FULL</span>}
                  </span>
                </div>
                
                {challenge.prize && (
                  <div className="flex items-center gap-1">
                    <Award className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs text-yellow-300">{challenge.prize}</span>
                  </div>
                )}
              </div>

              {/* Participant Avatars */}
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {challenge.participants.slice(0, 5).map((participant, index) => (
                    <div 
                      key={index}
                      className={`w-6 h-6 rounded-full border-2 border-gray-800 flex items-center justify-center text-xs font-medium ${
                        participant.completed 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-600 text-gray-200'
                      }`}
                      title={`${participant.username}${participant.completed ? ' (completed)' : ''}`}
                    >
                      {participant.username[0].toUpperCase()}
                    </div>
                  ))}
                  {challenge.participants.length > 5 && (
                    <div className="w-6 h-6 bg-gray-700 rounded-full border-2 border-gray-800 flex items-center justify-center text-xs">
                      +{challenge.participants.length - 5}
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <button
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    isParticipating
                      ? userCompleted
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      : isFull
                        ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30 cursor-not-allowed'
                        : 'bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isFull || isParticipating) {
                      handleJoinChallenge(challenge);
                    }
                  }}
                  disabled={isFull && !isParticipating}
                >
                  {isParticipating 
                    ? userCompleted 
                      ? 'View Results' 
                      : 'Continue'
                    : isFull
                      ? 'Challenge Full'
                      : 'Join Challenge'
                  }
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {activeChallenges.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No active challenges</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-2 text-purple-400 hover:text-purple-300 text-sm"
          >
            Create the first one!
          </button>
        </div>
      )}

      {/* Challenge Details Modal */}
      {showChallengeDetails && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-white/20 p-6 max-w-lg w-full rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                {showChallengeDetails.title}
              </h3>
              <button
                onClick={() => setShowChallengeDetails(null)}
                className="p-2 hover:bg-white/10 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-300 mb-2">
                  <strong>Theme:</strong> {showChallengeDetails.theme}
                </p>
                <p className="text-sm text-gray-300 mb-2">
                  <strong>Type:</strong> {showChallengeDetails.type.charAt(0).toUpperCase() + showChallengeDetails.type.slice(1)}
                </p>
                <p className="text-sm text-gray-300 mb-2">
                  <strong>Time Left:</strong> {showChallengeDetails.timeLeft}
                </p>
                <p className="text-sm text-gray-300 mb-2">
                  <strong>Participants:</strong> {showChallengeDetails.participants.length}/{showChallengeDetails.maxParticipants}
                </p>
              </div>
              
              {/* Challenge Instructions */}
              <div className="bg-blue-900/20 border border-blue-600/30 p-4 rounded">
                <h4 className="font-medium text-blue-300 mb-2">How to Participate:</h4>
                <div className="text-sm text-blue-200 space-y-1">
                  {showChallengeDetails.type === 'ranking' && (
                    <>
                      <p>• Create your top 10 list following the theme</p>
                      <p>• Save it to your rankings</p>
                      <p>• Voting opens when challenge ends</p>
                    </>
                  )}
                  {showChallengeDetails.type === 'discovery' && (
                    <>
                      <p>• Find and add artists matching the criteria</p>
                      <p>• Share your discoveries in the comments</p>
                      <p>• Most unique finds win!</p>
                    </>
                  )}
                  {showChallengeDetails.type === 'debate' && (
                    <>
                      <p>• Post your argument in the debate thread</p>
                      <p>• Engage with other participants</p>
                      <p>• Most compelling argument wins</p>
                    </>
                  )}
                </div>
              </div>
              
              {/* Participants List */}
              <div>
                <h4 className="font-medium text-white mb-2">Participants:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {showChallengeDetails.participants.map((participant, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center gap-2 p-2 rounded ${
                        participant.completed ? 'bg-green-500/20 text-green-300' : 'bg-gray-700/50 text-gray-300'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        participant.completed ? 'bg-green-400' : 'bg-gray-400'
                      }`} />
                      <span className="text-sm">{participant.username}</span>
                      {participant.completed && <CheckCircle className="w-3 h-3" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  const userParticipant = showChallengeDetails.participants.find(p => p.username === (currentUser?.username || 'You'));
                  
                  if (userParticipant?.completed) {
                    // Show submission results
                    onStartWorking?.(showChallengeDetails, 'view_submission');
                  } else {
                    // Start working on challenge
                    onStartWorking?.(showChallengeDetails, 'start_working');
                  }
                  
                  setShowChallengeDetails(null);
                }}
                className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 transition-colors font-medium rounded"
              >
                {showChallengeDetails.participants.find(p => p.username === (currentUser?.username || 'You'))?.completed 
                  ? 'View Submission' 
                  : 'Start Working'
                }
              </button>
              <button
                onClick={() => setShowChallengeDetails(null)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 transition-colors rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Challenge Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-white/20 p-6 max-w-md w-full rounded-lg">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              Create Challenge
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Challenge Title</label>
                <input
                  type="text"
                  value={newChallenge.title}
                  onChange={(e) => setNewChallenge(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Best Songs of 2024"
                  className="w-full p-2 bg-black/30 border border-white/20 rounded text-white placeholder-gray-500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Type</label>
                <select
                  value={newChallenge.type}
                  onChange={(e) => setNewChallenge(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full p-2 bg-black/30 border border-white/20 rounded text-white"
                >
                  <option value="ranking">Top 10 Ranking</option>
                  <option value="discovery">Discovery Hunt</option>
                  <option value="debate">Debate Topic</option>
                  <option value="collaboration">Collab List</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Theme/Rules</label>
                <textarea
                  value={newChallenge.theme}
                  onChange={(e) => setNewChallenge(prev => ({ ...prev, theme: e.target.value }))}
                  placeholder="2024 releases only, any genre"
                  className="w-full p-2 bg-black/30 border border-white/20 rounded text-white placeholder-gray-500 h-20"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Duration</label>
                  <select
                    value={newChallenge.duration}
                    onChange={(e) => setNewChallenge(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full p-2 bg-black/30 border border-white/20 rounded text-white"
                  >
                    <option value="1d">1 Day</option>
                    <option value="3d">3 Days</option>
                    <option value="7d">1 Week</option>
                    <option value="14d">2 Weeks</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Max Players</label>
                  <select
                    value={newChallenge.maxParticipants}
                    onChange={(e) => setNewChallenge(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
                    className="w-full p-2 bg-black/30 border border-white/20 rounded text-white"
                  >
                    <option value={5}>5 People</option>
                    <option value={10}>10 People</option>
                    <option value={20}>20 People</option>
                    <option value={50}>50 People</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={createChallenge}
                disabled={!newChallenge.title.trim() || !newChallenge.theme.trim()}
                className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium rounded"
              >
                Create Challenge
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 transition-colors rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupChallenges;