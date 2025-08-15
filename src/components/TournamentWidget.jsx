import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Clock, 
  ChevronRight,
  Users,
  AlertCircle,
  Swords,
  Crown,
  Timer,
  TrendingUp
} from 'lucide-react';

const TournamentWidget = ({ 
  tournament,
  currentUser,
  onSubmitEntry,
  onExpandBracket,
  className = ''
}) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [urgency, setUrgency] = useState('normal'); // normal, warning, critical
  
  // Mock tournament data for now
  const mockTournament = tournament || {
    id: 'march-madness-2024',
    title: 'March Madness: Best Bars',
    phase: 'submissions', // submissions, round-of-32, round-of-16, quarterfinals, semifinals, finals, complete
    deadline: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
    totalSlots: 32,
    submittedCount: 24,
    userSubmitted: false,
    currentRound: null,
    prize: '🏆 Custom Canon Badge',
    theme: 'Most iconic bars in hip-hop history'
  };

  // Calculate time remaining
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const deadline = new Date(mockTournament.deadline);
      const diff = deadline - now;
      
      if (diff <= 0) {
        setTimeLeft('Ended');
        setUrgency('normal');
        clearInterval(timer);
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours < 1) {
        setTimeLeft(`${minutes}m left`);
        setUrgency('critical');
      } else if (hours < 6) {
        setTimeLeft(`${hours}h ${minutes}m left`);
        setUrgency('warning');
      } else if (hours < 24) {
        setTimeLeft(`${hours}h left`);
        setUrgency('warning');
      } else {
        const days = Math.floor(hours / 24);
        setTimeLeft(`${days}d ${hours % 24}h left`);
        setUrgency('normal');
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [mockTournament.deadline]);

  const getPhaseDisplay = () => {
    const phases = {
      'submissions': 'Accepting Submissions',
      'round-of-32': 'Round of 32',
      'round-of-16': 'Sweet 16',
      'quarterfinals': 'Elite 8',
      'semifinals': 'Final 4',
      'finals': 'Championship',
      'complete': 'Tournament Complete'
    };
    return phases[mockTournament.phase] || 'Active Tournament';
  };

  const getUrgencyStyles = () => {
    if (urgency === 'critical') {
      return 'bg-red-500/20 border-red-500/50 animate-pulse';
    } else if (urgency === 'warning') {
      return 'bg-orange-500/20 border-orange-500/50';
    }
    return 'bg-purple-500/20 border-purple-500/50';
  };

  const getProgressPercentage = () => {
    return (mockTournament.submittedCount / mockTournament.totalSlots) * 100;
  };

  return (
    <div className={`${className} ${getUrgencyStyles()} border rounded-lg p-4 transition-all hover:border-white/30 cursor-pointer`}
         onClick={onExpandBracket}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <h3 className="font-bold text-white text-sm">{mockTournament.title}</h3>
          </div>
          <p className="text-xs text-gray-400">{mockTournament.theme}</p>
        </div>
        
        {/* Timer */}
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          urgency === 'critical' ? 'bg-red-500/30 text-red-300' :
          urgency === 'warning' ? 'bg-orange-500/30 text-orange-300' :
          'bg-gray-700/50 text-gray-300'
        }`}>
          <Clock className="w-3 h-3" />
          {timeLeft}
        </div>
      </div>

      {/* Phase & Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-400">{getPhaseDisplay()}</span>
          {mockTournament.phase === 'submissions' && (
            <span className="text-gray-400">
              {mockTournament.submittedCount}/{mockTournament.totalSlots} entries
            </span>
          )}
        </div>
        
        {mockTournament.phase === 'submissions' && (
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        )}
      </div>

      {/* Action Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {mockTournament.phase === 'submissions' ? (
            mockTournament.userSubmitted ? (
              <div className="flex items-center gap-1 text-xs text-green-400">
                <AlertCircle className="w-3 h-3" />
                Entry submitted
              </div>
            ) : (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onSubmitEntry?.();
                }}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-full transition-colors"
              >
                Submit Entry
              </button>
            )
          ) : (
            <div className="flex items-center gap-1 text-xs text-blue-400">
              <Swords className="w-3 h-3" />
              {mockTournament.phase === 'finals' ? 'Vote for champion' : 'Vote in matchups'}
            </div>
          )}
          
          {mockTournament.prize && (
            <div className="text-xs text-yellow-400">
              {mockTournament.prize}
            </div>
          )}
        </div>
        
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </div>

      {/* Urgency message for critical time */}
      {urgency === 'critical' && !mockTournament.userSubmitted && mockTournament.phase === 'submissions' && (
        <div className="mt-3 pt-3 border-t border-red-500/30">
          <p className="text-xs text-red-300 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Last chance to submit your entry!
          </p>
        </div>
      )}
    </div>
  );
};

export default TournamentWidget;