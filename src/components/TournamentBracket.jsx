import React, { useState, useEffect } from 'react';
import { Trophy, Users, Clock, Vote, Crown, ChevronRight } from 'lucide-react';

const TournamentBracket = ({ 
  tournament, 
  submissions = [], 
  matchups = [], 
  currentUser, 
  supabase,
  onVote 
}) => {
  const [votes, setVotes] = useState(new Map());
  const [userVotes, setUserVotes] = useState(new Map());
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    if (tournament?.id) {
      loadVotes();
    }
  }, [tournament?.id]);

  const loadVotes = async () => {
    if (!tournament?.id) return;

    try {
      // Load all votes for vote counts
      const { data: allVotes } = await supabase
        .from('tournament_votes')
        .select(`
          matchup_id,
          submission_id,
          tournament_matchups!inner(tournament_id)
        `)
        .eq('tournament_matchups.tournament_id', tournament.id);

      // Count votes per matchup/submission
      const voteMap = new Map();
      allVotes?.forEach(vote => {
        const key = `${vote.matchup_id}-${vote.submission_id}`;
        voteMap.set(key, (voteMap.get(key) || 0) + 1);
      });
      setVotes(voteMap);

      // Load current user's votes if logged in
      if (currentUser?.id) {
        const { data: userVotesData } = await supabase
          .from('tournament_votes')
          .select(`
            matchup_id,
            submission_id,
            tournament_matchups!inner(tournament_id)
          `)
          .eq('tournament_matchups.tournament_id', tournament.id)
          .eq('user_id', currentUser.id);

        const userVoteMap = new Map();
        userVotesData?.forEach(vote => {
          userVoteMap.set(vote.matchup_id, vote.submission_id);
        });
        setUserVotes(userVoteMap);
      }
    } catch (error) {
      console.error('Error loading votes:', error);
    }
  };

  const handleVote = async (matchupId, submissionId) => {
    if (!currentUser || isVoting) return;

    setIsVoting(true);
    try {
      // Remove existing vote for this matchup
      await supabase
        .from('tournament_votes')
        .delete()
        .eq('matchup_id', matchupId)
        .eq('user_id', currentUser.id);

      // Add new vote if different submission
      const existingVote = userVotes.get(matchupId);
      if (existingVote !== submissionId) {
        const { error } = await supabase
          .from('tournament_votes')
          .insert({
            matchup_id: matchupId,
            user_id: currentUser.id,
            submission_id: submissionId
          });

        if (error) throw error;
      }

      // Reload votes to get updated counts
      await loadVotes();
      onVote?.(matchupId, submissionId);
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const getVoteCount = (matchupId, submissionId) => {
    return votes.get(`${matchupId}-${submissionId}`) || 0;
  };

  const hasUserVoted = (matchupId, submissionId) => {
    return userVotes.get(matchupId) === submissionId;
  };

  const organizeMatchupsByRound = () => {
    const rounds = new Map();
    matchups.forEach(matchup => {
      if (!rounds.has(matchup.round_number)) {
        rounds.set(matchup.round_number, []);
      }
      rounds.get(matchup.round_number).push(matchup);
    });

    // Sort matchups within each round
    rounds.forEach(roundMatchups => {
      roundMatchups.sort((a, b) => a.matchup_number - b.matchup_number);
    });

    return rounds;
  };

  const getRoundName = (roundNumber, totalRounds) => {
    const remainingRounds = totalRounds - roundNumber + 1;
    switch (remainingRounds) {
      case 1: return 'Final';
      case 2: return 'Semifinal';
      case 3: return 'Quarterfinal';
      case 4: return 'Round of 8';
      default: return `Round ${roundNumber}`;
    }
  };

  const MatchupCard = ({ matchup, submission1, submission2 }) => {
    const votes1 = getVoteCount(matchup.id, submission1?.id);
    const votes2 = getVoteCount(matchup.id, submission2?.id);
    const totalVotes = votes1 + votes2;
    const userVoted1 = hasUserVoted(matchup.id, submission1?.id);
    const userVoted2 = hasUserVoted(matchup.id, submission2?.id);

    const percentage1 = totalVotes > 0 ? (votes1 / totalVotes) * 100 : 50;
    const percentage2 = totalVotes > 0 ? (votes2 / totalVotes) * 100 : 50;

    if (!submission1 || !submission2) {
      return (
        <div className="bg-slate-800/50 border border-white/10 p-4 text-center">
          <p className="text-gray-500 text-sm">Waiting for previous round...</p>
        </div>
      );
    }

    return (
      <div className="bg-slate-800 border border-white/10 overflow-hidden">
        {/* Matchup Header */}
        <div className="bg-slate-900 p-3 border-b border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">
              Matchup {matchup.matchup_number}
            </span>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Vote className="w-3 h-3" />
              <span>{totalVotes} votes</span>
            </div>
          </div>
        </div>

        {/* Submissions */}
        <div className="divide-y divide-white/10">
          {/* Submission 1 */}
          <button
            onClick={() => currentUser && handleVote(matchup.id, submission1.id)}
            disabled={!currentUser || isVoting || matchup.status !== 'active'}
            className={`w-full p-4 text-left transition-colors relative overflow-hidden ${
              currentUser && matchup.status === 'active' 
                ? 'hover:bg-white/5 cursor-pointer' 
                : 'cursor-default'
            } ${userVoted1 ? 'ring-2 ring-purple-400/50' : ''}`}
          >
            {/* Vote percentage background */}
            <div 
              className="absolute inset-0 bg-purple-600/10 transition-all duration-300"
              style={{ width: `${percentage1}%` }}
            />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-white flex items-center gap-2">
                  {submission1.artist_name}
                  {userVoted1 && <Crown className="w-4 h-4 text-purple-400" />}
                </h4>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">{votes1}</div>
                  <div className="text-xs text-gray-400">{percentage1.toFixed(1)}%</div>
                </div>
              </div>
              {submission1.song_title && (
                <p className="text-sm text-gray-400 mb-2">"{submission1.song_title}"</p>
              )}
              <p className="text-sm text-gray-300 leading-relaxed">
                {submission1.bars_text.split('\\n').slice(0, 2).join('\\n')}
                {submission1.bars_text.split('\\n').length > 2 && '...'}
              </p>
            </div>
          </button>

          {/* VS Divider */}
          <div className="bg-slate-900 py-2 text-center">
            <span className="text-xs font-bold text-gray-400">VS</span>
          </div>

          {/* Submission 2 */}
          <button
            onClick={() => currentUser && handleVote(matchup.id, submission2.id)}
            disabled={!currentUser || isVoting || matchup.status !== 'active'}
            className={`w-full p-4 text-left transition-colors relative overflow-hidden ${
              currentUser && matchup.status === 'active' 
                ? 'hover:bg-white/5 cursor-pointer' 
                : 'cursor-default'
            } ${userVoted2 ? 'ring-2 ring-purple-400/50' : ''}`}
          >
            {/* Vote percentage background */}
            <div 
              className="absolute inset-0 bg-purple-600/10 transition-all duration-300"
              style={{ width: `${percentage2}%` }}
            />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-white flex items-center gap-2">
                  {submission2.artist_name}
                  {userVoted2 && <Crown className="w-4 h-4 text-purple-400" />}
                </h4>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">{votes2}</div>
                  <div className="text-xs text-gray-400">{percentage2.toFixed(1)}%</div>
                </div>
              </div>
              {submission2.song_title && (
                <p className="text-sm text-gray-400 mb-2">"{submission2.song_title}"</p>
              )}
              <p className="text-sm text-gray-300 leading-relaxed">
                {submission2.bars_text.split('\\n').slice(0, 2).join('\\n')}
                {submission2.bars_text.split('\\n').length > 2 && '...'}
              </p>
            </div>
          </button>
        </div>

        {/* Winner indicator */}
        {matchup.winner_id && (
          <div className="bg-yellow-500/20 border-t border-yellow-400/30 p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-yellow-300 text-xs">
              <Trophy className="w-3 h-3" />
              <span>
                Winner: {matchup.winner_id === submission1?.id ? submission1?.artist_name : submission2?.artist_name}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const rounds = organizeMatchupsByRound();
  const totalRounds = Math.max(...Array.from(rounds.keys()));

  return (
    <div className="space-y-6">
      {/* Tournament Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2">{tournament?.title}</h3>
        <p className="text-gray-400">{tournament?.description}</p>
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            <span className="text-gray-300">{tournament?.bracket_size} Artists</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-gray-300">Round {tournament?.current_round}</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-gray-300">{tournament?.category}</span>
          </div>
        </div>
      </div>

      {/* Bracket */}
      <div className="space-y-8">
        {Array.from(rounds.entries())
          .sort(([a], [b]) => a - b)
          .map(([roundNumber, roundMatchups]) => (
            <div key={roundNumber}>
              <h4 className="text-lg font-bold text-white mb-4 text-center">
                {getRoundName(roundNumber, totalRounds)}
              </h4>
              
              <div className={`grid gap-4 ${
                roundMatchups.length <= 2 ? 'grid-cols-1 max-w-2xl mx-auto' :
                roundMatchups.length <= 4 ? 'grid-cols-1 md:grid-cols-2' :
                'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              }`}>
                {roundMatchups.map(matchup => {
                  const submission1 = submissions.find(s => s.id === matchup.submission1_id);
                  const submission2 = submissions.find(s => s.id === matchup.submission2_id);
                  
                  return (
                    <MatchupCard
                      key={matchup.id}
                      matchup={matchup}
                      submission1={submission1}
                      submission2={submission2}
                    />
                  );
                })}
              </div>
              
              {/* Arrow to next round */}
              {roundNumber < totalRounds && (
                <div className="flex justify-center mt-6">
                  <ChevronRight className="w-6 h-6 text-gray-600" />
                </div>
              )}
            </div>
          ))}
      </div>

      {/* Login prompt for non-authenticated users */}
      {!currentUser && (
        <div className="bg-purple-600/10 border border-purple-400/30 p-4 rounded text-center">
          <p className="text-purple-300 mb-2">Want to vote?</p>
          <p className="text-purple-200/80 text-sm">Sign in to cast your votes and help determine the winners!</p>
        </div>
      )}
    </div>
  );
};

export default TournamentBracket;