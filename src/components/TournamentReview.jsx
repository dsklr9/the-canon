import React, { useState, useEffect } from 'react';
import { Check, X, Flag, Mail, Eye, Clock, Trophy, AlertTriangle } from 'lucide-react';

const TournamentReview = ({ supabase, currentUser, tournament }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(new Set());

  useEffect(() => {
    if (tournament?.id) {
      loadSubmissions();
    }
  }, [tournament?.id]);

  const loadSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('tournament_submissions')
        .select(`
          *,
          profiles!tournament_submissions_user_id_fkey(username)
        `)
        .eq('tournament_id', tournament.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSubmissionStatus = async (submissionId, status) => {
    setProcessing(prev => new Set(prev).add(submissionId));
    
    try {
      const { error } = await supabase
        .from('tournament_submissions')
        .update({ status })
        .eq('id', submissionId);

      if (error) throw error;

      // Update local state
      setSubmissions(prev => 
        prev.map(sub => 
          sub.id === submissionId ? { ...sub, status } : sub
        )
      );
    } catch (error) {
      console.error('Error updating submission:', error);
    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev);
        newSet.delete(submissionId);
        return newSet;
      });
    }
  };

  const flagForEmail = (submission) => {
    const subject = encodeURIComponent(`Bar-for-Bar Breakdown Submission Review - ${submission.artist_name}`);
    const body = encodeURIComponent(`
Submission needs review:

Artist: ${submission.artist_name}
Song: ${submission.song_title || 'N/A'}
User: ${submission.profiles?.username || 'Unknown'}
Submitted: ${new Date(submission.created_at).toLocaleDateString()}

Bars:
${submission.bars_text}

Action needed: Please review for appropriateness.
    `);
    
    window.open(`mailto:info@thecanon.io?subject=${subject}&body=${body}`, '_blank');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-900/20';
      case 'rejected': return 'text-red-400 bg-red-900/20';
      case 'pending': return 'text-yellow-400 bg-yellow-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const pendingCount = submissions.filter(s => s.status === 'pending').length;
  const approvedCount = submissions.filter(s => s.status === 'approved').length;

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Loading submissions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-yellow-900/20 border border-yellow-600/30 p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{pendingCount}</div>
          <div className="text-sm text-yellow-300">Pending Review</div>
        </div>
        <div className="bg-green-900/20 border border-green-600/30 p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{approvedCount}</div>
          <div className="text-sm text-green-300">Approved</div>
        </div>
        <div className="bg-slate-700/50 border border-white/10 p-4 text-center">
          <div className="text-2xl font-bold text-white">{submissions.length}</div>
          <div className="text-sm text-gray-300">Total Submissions</div>
        </div>
      </div>

      {/* Quick Actions */}
      {pendingCount > 0 && (
        <div className="bg-blue-900/20 border border-blue-600/30 p-4 rounded">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-blue-300">Quick Review</h3>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                const pendingIds = submissions
                  .filter(s => s.status === 'pending')
                  .map(s => s.id);
                
                pendingIds.forEach(id => updateSubmissionStatus(id, 'approved'));
              }}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white transition-colors text-sm"
              disabled={processing.size > 0}
            >
              <Check className="w-4 h-4 inline mr-2" />
              Approve All Pending
            </button>
          </div>
          <p className="text-xs text-blue-200/80 mt-2">
            Use this if all pending submissions look appropriate for competition
          </p>
        </div>
      )}

      {/* Submissions List */}
      <div className="space-y-4">
        {submissions.map((submission) => (
          <div 
            key={submission.id} 
            className={`border p-4 transition-all ${
              submission.status === 'pending' 
                ? 'border-yellow-600/50 bg-yellow-900/10' 
                : 'border-white/10 bg-slate-800/50'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-bold text-white flex items-center gap-2">
                  {submission.artist_name}
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(submission.status)}`}>
                    {submission.status}
                  </span>
                </h4>
                {submission.song_title && (
                  <p className="text-sm text-gray-400">"{submission.song_title}"</p>
                )}
                <p className="text-xs text-gray-500">
                  by {submission.profiles?.username || 'Unknown'} • {new Date(submission.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Bars Text */}
            <div className="bg-black/30 p-3 mb-4 border border-white/10">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                {submission.bars_text}
              </pre>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              {submission.status === 'pending' && (
                <>
                  <button
                    onClick={() => updateSubmissionStatus(submission.id, 'approved')}
                    disabled={processing.has(submission.id)}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white transition-colors text-sm flex items-center gap-1 disabled:opacity-50"
                  >
                    <Check className="w-3 h-3" />
                    Approve
                  </button>
                  <button
                    onClick={() => updateSubmissionStatus(submission.id, 'rejected')}
                    disabled={processing.has(submission.id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white transition-colors text-sm flex items-center gap-1 disabled:opacity-50"
                  >
                    <X className="w-3 h-3" />
                    Reject
                  </button>
                  <button
                    onClick={() => flagForEmail(submission)}
                    className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white transition-colors text-sm flex items-center gap-1"
                  >
                    <Mail className="w-3 h-3" />
                    Email for Review
                  </button>
                </>
              )}
              
              {submission.status === 'approved' && (
                <button
                  onClick={() => updateSubmissionStatus(submission.id, 'pending')}
                  disabled={processing.has(submission.id)}
                  className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white transition-colors text-sm flex items-center gap-1 disabled:opacity-50"
                >
                  <Eye className="w-3 h-3" />
                  Mark for Review
                </button>
              )}

              {submission.status === 'rejected' && (
                <button
                  onClick={() => updateSubmissionStatus(submission.id, 'pending')}
                  disabled={processing.has(submission.id)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white transition-colors text-sm flex items-center gap-1 disabled:opacity-50"
                >
                  <Eye className="w-3 h-3" />
                  Reconsider
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {submissions.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No submissions yet for this breakdown.</p>
        </div>
      )}

      {/* Guidelines Reference */}
      <div className="bg-slate-800/50 border border-white/10 p-4 rounded">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
          <h4 className="text-sm font-medium text-yellow-300">Review Guidelines</h4>
        </div>
        <div className="text-xs text-gray-400 space-y-1">
          <p>• Approve bars that showcase skill, wordplay, or impact</p>
          <p>• Reject overly explicit/vulgar content (this is rap, but keep it reasonable)</p>
          <p>• When in doubt, use "Email for Review" to flag for manual review</p>
          <p>• Users can update submissions until the deadline</p>
        </div>
      </div>
    </div>
  );
};

export default TournamentReview;