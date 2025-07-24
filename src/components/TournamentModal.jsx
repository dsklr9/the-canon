import React, { useState, useEffect } from 'react';
import { X, Trophy, Users, Clock, Send, AlertCircle } from 'lucide-react';

const TournamentModal = ({ 
  isOpen, 
  onClose, 
  tournament, 
  supabase, 
  currentUser, 
  onSubmissionComplete 
}) => {
  const [submissionData, setSubmissionData] = useState({
    artistName: '',
    songTitle: '',
    barsText: '',
    artistId: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [existingSubmission, setExistingSubmission] = useState(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      loadExistingSubmission();
      setError('');
    } else {
      setSubmissionData({
        artistName: '',
        songTitle: '',
        barsText: '',
        artistId: null
      });
    }
  }, [isOpen, tournament?.id]);

  const loadExistingSubmission = async () => {
    if (!tournament?.id || !currentUser?.id) return;

    try {
      const { data, error } = await supabase
        .from('tournament_submissions')
        .select('*')
        .eq('tournament_id', tournament.id)
        .eq('user_id', currentUser.id)
        .single();

      if (data) {
        setExistingSubmission(data);
        setSubmissionData({
          artistName: data.artist_name,
          songTitle: data.song_title || '',
          barsText: data.bars_text,
          artistId: data.artist_id
        });
      }
    } catch (err) {
      console.log('No existing submission found');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setError('You must be logged in to submit');
      return;
    }

    if (!submissionData.artistName.trim() || !submissionData.barsText.trim()) {
      setError('Artist name and bars are required');
      return;
    }

    if (submissionData.barsText.split('\\n').length > 6) {
      setError('Please limit to 4-6 lines (bars)');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const submissionPayload = {
        tournament_id: tournament.id,
        user_id: currentUser.id,
        artist_name: submissionData.artistName.trim(),
        song_title: submissionData.songTitle.trim() || null,
        bars_text: submissionData.barsText.trim(),
        artist_id: submissionData.artistId
      };

      let result;
      if (existingSubmission) {
        // Update existing submission
        result = await supabase
          .from('tournament_submissions')
          .update(submissionPayload)
          .eq('id', existingSubmission.id)
          .select()
          .single();
      } else {
        // Create new submission
        result = await supabase
          .from('tournament_submissions')
          .insert(submissionPayload)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      onSubmissionComplete?.(result.data);
      onClose();
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBarsChange = (e) => {
    const text = e.target.value;
    // Auto-format as user types, ensuring reasonable line breaks
    setSubmissionData(prev => ({ ...prev, barsText: text }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <div>
              <h2 className="text-xl font-bold text-white">
                {existingSubmission ? 'Update Your Submission' : 'Submit Your Bars'}
              </h2>
              <p className="text-gray-400 text-sm">{tournament?.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Tournament Info */}
        <div className="p-6 border-b border-white/10 bg-slate-900/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span className="text-gray-300">
                {tournament?.bracket_size}-Artist Bracket
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-gray-300">
                Submissions close: {tournament?.submission_end ? 
                  new Date(tournament.submission_end).toLocaleDateString() : 'TBD'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-gray-300">
                Category: {tournament?.category}
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Artist Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Artist Name *
              </label>
              <input
                type="text"
                value={submissionData.artistName}
                onChange={(e) => setSubmissionData(prev => ({ 
                  ...prev, 
                  artistName: e.target.value 
                }))}
                className="w-full px-4 py-3 bg-black/50 border border-white/20 text-white placeholder-gray-500 focus:border-purple-400/50 focus:outline-none"
                placeholder="Enter artist name (e.g., Kendrick Lamar, Jay-Z)"
                required
              />
            </div>

            {/* Song Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Song Title <span className="text-gray-500">(optional)</span>
              </label>
              <input
                type="text"
                value={submissionData.songTitle}
                onChange={(e) => setSubmissionData(prev => ({ 
                  ...prev, 
                  songTitle: e.target.value 
                }))}
                className="w-full px-4 py-3 bg-black/50 border border-white/20 text-white placeholder-gray-500 focus:border-purple-400/50 focus:outline-none"
                placeholder="Enter song title (e.g., HUMBLE., 99 Problems)"
              />
            </div>

            {/* Bars Text */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your 4 Bars *
              </label>
              <textarea
                value={submissionData.barsText}
                onChange={handleBarsChange}
                className="w-full px-4 py-3 bg-black/50 border border-white/20 text-white placeholder-gray-500 focus:border-purple-400/50 focus:outline-none h-32 resize-none"
                placeholder="Enter 4 bars (lines) from the artist...&#10;&#10;Example:&#10;I got loyalty, got royalty inside my DNA&#10;Cocaine quarter piece, got war and peace inside my DNA&#10;I got power, poison, pain and joy inside my DNA&#10;I got hustle though, ambition, flow inside my DNA"
                required
                rows={6}
              />
              <p className="text-xs text-gray-500 mt-2">
                Enter 4-6 lines of bars. Try to capture the essence of what makes these bars special.
              </p>
            </div>

            {/* Guidelines */}
            <div className="bg-yellow-500/10 border border-yellow-400/30 p-4 rounded">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-300 mb-2">Submission Guidelines</h4>
                  <ul className="text-sm text-yellow-200/80 space-y-1">
                    <li>• Choose bars that showcase technical skill, wordplay, or impact</li>
                    <li>• Keep it clean - inappropriate content will be removed</li>
                    <li>• You can update your submission until the deadline</li>
                    <li>• Community voting will determine bracket seeding</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-500/10 border border-red-400/30 p-4 rounded">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-6 bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 px-6 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {existingSubmission ? 'Updating...' : 'Submitting...'}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {existingSubmission ? 'Update Submission' : 'Submit Bars'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TournamentModal;