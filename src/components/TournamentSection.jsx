import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Calendar, 
  Users, 
  Vote,
  Clock,
  Zap,
  Target,
  Settings
} from 'lucide-react';
import TournamentModal from './TournamentModal';
import TournamentBracket from './TournamentBracket';
import TournamentReview from './TournamentReview';

const TournamentSection = ({ supabase, currentUser }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [activeTournament, setActiveTournament] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [matchups, setMatchups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTournaments();
  }, []);

  useEffect(() => {
    if (activeTournament?.id) {
      loadTournamentData(activeTournament.id);
    }
  }, [activeTournament?.id]);

  const loadTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1); // Get the most recent tournament

      if (error) throw error;

      if (data && data.length > 0) {
        setActiveTournament(data[0]);
        setTournaments(data);
      }
    } catch (error) {
      console.error('Error loading tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTournamentData = async (tournamentId) => {
    try {
      // Load submissions and matchups in parallel
      const [submissionsResult, matchupsResult] = await Promise.all([
        supabase
          .from('tournament_submissions')
          .select('*')
          .eq('tournament_id', tournamentId)
          .eq('status', 'approved')
          .order('created_at', { ascending: true }),
        
        supabase
          .from('tournament_matchups')
          .select('*')
          .eq('tournament_id', tournamentId)
          .order('round_number', { ascending: true })
          .order('matchup_number', { ascending: true })
      ]);

      if (submissionsResult.data) setSubmissions(submissionsResult.data);
      if (matchupsResult.data) setMatchups(matchupsResult.data);
    } catch (error) {
      console.error('Error loading tournament data:', error);
    }
  };

  const handleSubmissionComplete = (newSubmission) => {
    setSubmissions(prev => {
      const existing = prev.find(s => s.user_id === newSubmission.user_id);
      if (existing) {
        return prev.map(s => s.id === existing.id ? newSubmission : s);
      }
      return [...prev, newSubmission];
    });
  };

  const getTimeRemaining = (endDate) => {
    if (!endDate) return null;
    
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const getStatusInfo = (tournament) => {
    if (!tournament) return { text: 'No Tournament', color: 'gray', icon: Clock };
    
    switch (tournament.status) {
      case 'submission':
        return { 
          text: 'Submissions Open', 
          color: 'green', 
          icon: Plus,
          timeLeft: getTimeRemaining(tournament.submission_end)
        };
      case 'voting':
        return { 
          text: 'Voting Active', 
          color: 'purple', 
          icon: Vote,
          timeLeft: getTimeRemaining(tournament.tournament_end)
        };
      case 'completed':
        return { 
          text: 'Tournament Complete', 
          color: 'yellow', 
          icon: Trophy 
        };
      default:
        return { 
          text: 'Upcoming', 
          color: 'blue', 
          icon: Calendar 
        };
    }
  };

  const userSubmission = currentUser ? 
    submissions.find(s => s.user_id === currentUser.id) : null;

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-400/30 p-6">
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
          <span className="ml-3 text-gray-300">Loading breakdown...</span>
        </div>
      </div>
    );
  }

  if (!activeTournament) {
    return (
      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-400/30 p-6">
        <div className="text-center">
          <Trophy className="w-12 h-12 text-purple-400 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white mb-2">No Active Breakdown</h3>
          <p className="text-gray-400">Check back soon for the next bars battle!</p>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(activeTournament);
  const StatusIcon = statusInfo.icon;

  return (
    <>
      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-400/30">
        {/* Tournament Header - Always Visible */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Trophy className="w-8 h-8 text-yellow-400" />
                <Zap className="w-4 h-4 text-purple-400 absolute -top-1 -right-1" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Bar-for-Bar Breakdown</h2>
                <p className="text-purple-300 text-sm">{activeTournament.title}</p>
              </div>
            </div>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-400/30 text-purple-300 transition-colors"
            >
              <span className="text-sm">
                {isExpanded ? 'Collapse' : 'View Bracket'}
              </span>
              {isExpanded ? 
                <ChevronUp className="w-4 h-4" /> : 
                <ChevronDown className="w-4 h-4" />
              }
            </button>
          </div>

          {/* Tournament Status & Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-black/20 p-3 border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <StatusIcon className={`w-4 h-4 text-${statusInfo.color}-400`} />
                <span className={`text-xs font-medium text-${statusInfo.color}-300`}>
                  {statusInfo.text}
                </span>
              </div>
              {statusInfo.timeLeft && (
                <p className="text-xs text-gray-400">{statusInfo.timeLeft} left</p>
              )}
            </div>

            <div className="bg-black/20 p-3 border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-medium text-blue-300">Submissions</span>
              </div>
              <p className="text-xs text-gray-400">
                {submissions.length}/{activeTournament.bracket_size}
              </p>
            </div>

            <div className="bg-black/20 p-3 border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-green-400" />
                <span className="text-xs font-medium text-green-300">Category</span>
              </div>
              <p className="text-xs text-gray-400">{activeTournament.category}</p>
            </div>

            <div className="bg-black/20 p-3 border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-medium text-orange-300">Round</span>
              </div>
              <p className="text-xs text-gray-400">
                {activeTournament.current_round} / {Math.log2(activeTournament.bracket_size)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            {activeTournament.status === 'submission' && (
              <button
                onClick={() => setShowSubmissionModal(true)}
                className="flex-1 md:flex-none px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {userSubmission ? 'Update Submission' : 'Submit Bars'}
              </button>
            )}
            
            <button
              onClick={() => setIsExpanded(true)}
              className="flex-1 md:flex-none px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              View Full Bracket
            </button>

            {/* Simple Admin Toggle - you can add proper admin check later */}
            {currentUser && (
              <button
                onClick={() => setShowReview(!showReview)}
                className="px-4 py-3 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-400/30 text-orange-300 transition-colors flex items-center gap-2 text-sm"
                title="Review submissions (admin)"
              >
                <Settings className="w-4 h-4" />
                {showReview ? 'Hide' : 'Review'}
              </button>
            )}
          </div>

          {/* User's Submission Status */}
          {currentUser && activeTournament.status === 'submission' && (
            <div className="mt-4 p-3 bg-slate-800/50 border border-white/10">
              {userSubmission ? (
                <div>
                  <p className="text-sm text-green-300 mb-1">✓ Your submission is in!</p>
                  <p className="text-xs text-gray-400">
                    {userSubmission.artist_name} - "{userSubmission.bars_text.split('\\n')[0]}..."
                  </p>
                </div>
              ) : (
                <p className="text-sm text-yellow-300">
                  ⚠️ Don't miss out! Submit your bars before the deadline.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Expanded Bracket View */}
        {isExpanded && !showReview && (
          <div className="border-t border-purple-400/30 p-6 bg-black/20">
            <TournamentBracket
              tournament={activeTournament}
              submissions={submissions}
              matchups={matchups}
              currentUser={currentUser}
              supabase={supabase}
              onVote={(matchupId, submissionId) => {
                // Optionally handle vote callback
                console.log('Vote cast:', matchupId, submissionId);
              }}
            />
          </div>
        )}

        {/* Review Section */}
        {showReview && (
          <div className="border-t border-orange-400/30 p-6 bg-black/20">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-orange-400" />
                Submission Review
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Review and approve tournament submissions. When in doubt, use "Email for Review".
              </p>
            </div>
            <TournamentReview
              tournament={activeTournament}
              supabase={supabase}
              currentUser={currentUser}
            />
          </div>
        )}
      </div>

      {/* Tournament Submission Modal */}
      <TournamentModal
        isOpen={showSubmissionModal}
        onClose={() => setShowSubmissionModal(false)}
        tournament={activeTournament}
        supabase={supabase}
        currentUser={currentUser}
        onSubmissionComplete={handleSubmissionComplete}
      />
    </>
  );
};

export default TournamentSection;