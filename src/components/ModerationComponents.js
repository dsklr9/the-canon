// Add these components to your project

// 1. Report Modal Component
import React, { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

const ReportModal = ({ isOpen, onClose, contentType, contentId, supabase, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) {
      alert('Please select a reason');
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          content_type: contentType,
          content_id: contentId,
          reason,
          details: details.trim() || null
        });

      if (error) throw error;

      onSuccess?.();
      alert('Report submitted. Thank you for helping keep our community safe.');
      onClose();
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Error submitting report');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-white/20 p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Report Content
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Reason for report</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-black/50 border border-white/20 focus:border-purple-400 focus:outline-none"
            >
              <option value="">Select a reason...</option>
              <option value="spam">Spam or promotional</option>
              <option value="hate">Hate speech</option>
              <option value="harassment">Harassment or bullying</option>
              <option value="inappropriate">Inappropriate content</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Additional details (optional)
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Please provide more context..."
              className="w-full px-3 py-2 bg-black/50 border border-white/20 focus:border-purple-400 focus:outline-none h-24"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 transition-colors font-medium"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2 bg-white/10 hover:bg-white/20 border border-white/20 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. Rate Limiting Hook
const useRateLimit = (supabase) => {
  const checkRateLimit = async (actionType, limit, windowMinutes) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .rpc('check_rate_limit', {
          p_user_id: user.id,
          p_action_type: actionType,
          p_limit: limit,
          p_window_minutes: windowMinutes
        });

      if (error) throw error;
      
      if (!data) {
        // Rate limit exceeded
        const minutesText = windowMinutes === 1 ? 'minute' : `${windowMinutes} minutes`;
        alert(`You can only perform this action ${limit} times per ${minutesText}. Please wait and try again.`);
        return false;
      }

      // Log the action
      await supabase
        .from('rate_limits')
        .insert({
          user_id: user.id,
          action_type: actionType
        });

      return true;
    } catch (error) {
      console.error('Rate limit check error:', error);
      return true; // Allow action on error to not block users
    }
  };

  return { checkRateLimit };
};

// 3. Word Filter for Content
const BANNED_WORDS = [
  // Add offensive words here - keeping this family-friendly for now
  'spam', 'scam'
];

const filterContent = (text) => {
  let filtered = text;
  BANNED_WORDS.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    filtered = filtered.replace(regex, '***');
  });
  return filtered;
};

// 4. Admin Moderation Panel Component
const ModerationPanel = ({ supabase }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    loadReports();
  }, [filter]);

  const loadReports = async () => {
    try {
      let query = supabase
        .from('reports')
        .select(`
          *,
          reporter:reporter_id(username),
          debates!inner(title, content)
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId, newStatus) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ 
          status: newStatus,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;
      loadReports();
    } catch (error) {
      console.error('Error updating report:', error);
    }
  };

  const deleteContent = async (contentType, contentId) => {
    try {
      const { error } = await supabase
        .from(contentType + 's')
        .delete()
        .eq('id', contentId);

      if (error) throw error;
      alert('Content deleted');
    } catch (error) {
      console.error('Error deleting content:', error);
    }
  };

  if (loading) return <div>Loading reports...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Moderation Panel</h2>
      
      <div className="mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 bg-black/50 border border-white/20"
        >
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
          <option value="all">All</option>
        </select>
      </div>

      <div className="space-y-4">
        {reports.map(report => (
          <div key={report.id} className="bg-slate-800 border border-white/20 p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="font-bold">Report by:</span> {report.reporter?.username}
                <span className="ml-4 font-bold">Type:</span> {report.content_type}
                <span className="ml-4 font-bold">Reason:</span> {report.reason}
              </div>
              <span className={`px-2 py-1 text-xs rounded ${
                report.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                report.status === 'resolved' ? 'bg-green-500/20 text-green-300' :
                'bg-gray-500/20 text-gray-300'
              }`}>
                {report.status}
              </span>
            </div>
            
            {report.details && (
              <p className="text-sm text-gray-400 mb-2">Details: {report.details}</p>
            )}
            
            <div className="bg-black/30 p-3 mb-3 rounded">
              <p className="text-sm">{report.debates?.content || 'Content not found'}</p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => updateReportStatus(report.id, 'resolved')}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-sm"
              >
                Resolve
              </button>
              <button
                onClick={() => updateReportStatus(report.id, 'dismissed')}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-sm"
              >
                Dismiss
              </button>
              <button
                onClick={() => deleteContent(report.content_type, report.content_id)}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-sm"
              >
                Delete Content
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { ReportModal, useRateLimit, filterContent, ModerationPanel };