import React, { useState } from 'react';
import { 
  X, 
  Trophy, 
  Music, 
  Mic2,
  ChevronDown,
  ChevronUp,
  Users,
  Clock,
  Crown,
  Swords
} from 'lucide-react';

const TournamentBracket = ({ 
  tournament,
  currentUser,
  onClose,
  onVote,
  onSubmitEntry,
  isModal = true
}) => {
  const [expandedMatchup, setExpandedMatchup] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  
  // Mock bracket data - in production this would come from tournament prop
  const mockBracket = {
    rounds: [
      {
        name: 'Round of 32',
        matchups: [
          {
            id: 'm1',
            topSeed: {
              artist: 'Nas',
              song: 'N.Y. State of Mind',
              seed: 1,
              votes: 145,
              lyrics: "[Iconic opening verse]\n[Classic NYC imagery]\n[Legendary wordplay]"
            },
            bottomSeed: {
              artist: 'Mobb Deep',
              song: 'Shook Ones Pt. II',
              seed: 32,
              votes: 89,
              lyrics: "[Hard-hitting street narrative]\n[Queensbridge perspective]\n[Raw authenticity]"
            },
            status: 'active'
          },
          {
            id: 'm2',
            topSeed: {
              artist: 'Biggie',
              song: 'Juicy',
              seed: 16,
              votes: 178,
              lyrics: "[Rags to riches story]\n[Brooklyn dreams]\n[Hip-hop celebration]"
            },
            bottomSeed: {
              artist: 'Jay-Z',
              song: 'Dead Presidents II',
              seed: 17,
              votes: 156,
              lyrics: "[Money and power themes]\n[Street economics]\n[Hustler's ambition]"
            },
            status: 'active'
          },
          {
            id: 'm3',
            topSeed: null,
            bottomSeed: {
              artist: 'Eminem',
              song: 'Lose Yourself',
              seed: 8,
              votes: 0,
              lyrics: "[Motivational anthem]\n[One shot message]\n[Oscar-winning bars]"
            },
            status: 'pending'
          }
        ]
      },
      {
        name: 'Sweet 16',
        matchups: []
      },
      {
        name: 'Elite 8',
        matchups: []
      },
      {
        name: 'Final 4',
        matchups: []
      },
      {
        name: 'Championship',
        matchups: []
      }
    ],
    submissions: {
      total: 32,
      filled: 24,
      userSubmitted: false
    }
  };

  const MatchupCard = ({ matchup, round }) => {
    const isExpanded = expandedMatchup === matchup.id;
    const totalVotes = (matchup.topSeed?.votes || 0) + (matchup.bottomSeed?.votes || 0);
    const topPercentage = totalVotes > 0 ? ((matchup.topSeed?.votes || 0) / totalVotes) * 100 : 50;
    const bottomPercentage = totalVotes > 0 ? ((matchup.bottomSeed?.votes || 0) / totalVotes) * 100 : 50;
    
    return (
      <div className="bg-black/30 border border-white/10 rounded-lg overflow-hidden hover:border-white/20 transition-all">
        {/* Matchup Header */}
        <div 
          className="p-3 cursor-pointer"
          onClick={() => setExpandedMatchup(isExpanded ? null : matchup.id)}
        >
          {/* Top Seed */}
          <div className={`flex items-center justify-between p-2 rounded ${
            matchup.topSeed ? 'bg-gray-800/50' : 'bg-gray-900/50 opacity-50'
          }`}>
            {matchup.topSeed ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-6">#{matchup.topSeed.seed}</span>
                  <div>
                    <p className="text-sm font-medium">{matchup.topSeed.artist}</p>
                    <p className="text-xs text-gray-400">{matchup.topSeed.song}</p>
                  </div>
                </div>
                {matchup.status === 'active' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{matchup.topSeed.votes}</span>
                    <div className="w-12 h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 transition-all"
                        style={{ width: `${topPercentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <span className="text-xs text-gray-500">Awaiting submission...</span>
            )}
          </div>
          
          {/* VS Divider */}
          <div className="flex items-center justify-center py-1">
            <span className="text-xs text-gray-500 font-medium">VS</span>
          </div>
          
          {/* Bottom Seed */}
          <div className={`flex items-center justify-between p-2 rounded ${
            matchup.bottomSeed ? 'bg-gray-800/50' : 'bg-gray-900/50 opacity-50'
          }`}>
            {matchup.bottomSeed ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-6">#{matchup.bottomSeed.seed}</span>
                  <div>
                    <p className="text-sm font-medium">{matchup.bottomSeed.artist}</p>
                    <p className="text-xs text-gray-400">{matchup.bottomSeed.song}</p>
                  </div>
                </div>
                {matchup.status === 'active' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{matchup.bottomSeed.votes}</span>
                    <div className="w-12 h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 transition-all"
                        style={{ width: `${bottomPercentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <span className="text-xs text-gray-500">Awaiting submission...</span>
            )}
          </div>
          
          {/* Expand/Collapse indicator */}
          {(matchup.topSeed || matchup.bottomSeed) && (
            <div className="flex justify-center mt-2">
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </div>
          )}
        </div>
        
        {/* Expanded Lyrics Section */}
        {isExpanded && (
          <div className="border-t border-white/10 p-3 space-y-3">
            {matchup.topSeed && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-purple-300">
                    {matchup.topSeed.artist} - {matchup.topSeed.song}
                  </h4>
                  <button
                    onClick={() => onVote?.(matchup.id, 'top')}
                    className="px-3 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 text-xs font-medium rounded-full transition-colors border border-purple-500/30"
                  >
                    Vote
                  </button>
                </div>
                <div className="bg-black/40 p-3 rounded text-xs text-gray-300 max-h-32 overflow-y-auto whitespace-pre-line">
                  {matchup.topSeed.lyrics}
                </div>
              </div>
            )}
            
            {matchup.topSeed && matchup.bottomSeed && (
              <div className="border-t border-white/5" />
            )}
            
            {matchup.bottomSeed && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-purple-300">
                    {matchup.bottomSeed.artist} - {matchup.bottomSeed.song}
                  </h4>
                  <button
                    onClick={() => onVote?.(matchup.id, 'bottom')}
                    className="px-3 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 text-xs font-medium rounded-full transition-colors border border-purple-500/30"
                  >
                    Vote
                  </button>
                </div>
                <div className="bg-black/40 p-3 rounded text-xs text-gray-300 max-h-32 overflow-y-auto whitespace-pre-line">
                  {matchup.bottomSeed.lyrics}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const content = (
    <div className={isModal ? '' : 'space-y-6'}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            March Madness: Best Bars
          </h2>
          <p className="text-sm text-gray-400 mt-1">Click matchups to see bars and vote</p>
        </div>
        {isModal && (
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {/* Submission Status */}
      {mockBracket.submissions.filled < mockBracket.submissions.total && (
        <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-300">Submissions Phase</p>
              <p className="text-xs text-orange-200 mt-1">
                {mockBracket.submissions.filled}/{mockBracket.submissions.total} entries submitted
              </p>
            </div>
            {!mockBracket.submissions.userSubmitted && (
              <button
                onClick={onSubmitEntry}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded transition-colors"
              >
                Submit Your Entry
              </button>
            )}
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mt-3">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 transition-all"
              style={{ width: `${(mockBracket.submissions.filled / mockBracket.submissions.total) * 100}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Bracket Rounds */}
      <div className="space-y-6 max-h-[60vh] overflow-y-auto">
        {mockBracket.rounds.map((round, roundIndex) => (
          <div key={roundIndex}>
            {round.matchups.length > 0 && (
              <>
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Swords className="w-5 h-5 text-purple-400" />
                  {round.name}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {round.matchups.map((matchup) => (
                    <MatchupCard key={matchup.id} matchup={matchup} round={round} />
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-4 mt-6 pt-4 border-t border-white/10 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span>Winning</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-500 rounded-full" />
          <span>Losing</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>Voting ends in 24h</span>
        </div>
      </div>
    </div>
  );

  if (!isModal) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-white/20 p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-lg">
        {content}
      </div>
    </div>
  );
};

export default TournamentBracket;