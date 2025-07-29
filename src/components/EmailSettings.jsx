import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Mail, Check, X } from 'lucide-react';

const EmailSettings = ({ supabase, currentUser, onClose }) => {
  const [settings, setSettings] = useState({
    tournament_announcements: true,
    tournament_reminders: true,
    tournament_results: true,
    friend_requests: true,
    debate_replies: true,
    comment_replies: true,
    ranking_updates: true,
    weekly_digest: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    if (currentUser?.id) {
      loadSettings();
    }
  }, [currentUser?.id]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('email_subscriptions')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      if (data) {
        setSettings(data);
      } else {
        // Create default settings if none exist
        await createDefaultSettings();
      }
    } catch (error) {
      console.error('Error loading email settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('email_subscriptions')
        .insert({
          user_id: currentUser.id,
          ...settings
        })
        .select()
        .single();

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error creating default settings:', error);
    }
  };

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    setSaveStatus(null);

    try {
      const { error } = await supabase
        .from('email_subscriptions')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', currentUser.id);

      if (error) throw error;

      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const categories = [
    {
      title: 'Tournament Notifications',
      icon: '🏆',
      settings: [
        { key: 'tournament_announcements', label: 'New tournament announcements' },
        { key: 'tournament_reminders', label: 'Submission deadline reminders' },
        { key: 'tournament_results', label: 'Tournament results & winners' }
      ]
    },
    {
      title: 'Social Notifications',
      icon: '👥',
      settings: [
        { key: 'friend_requests', label: 'Friend requests' },
        { key: 'debate_replies', label: 'Replies to your debates' },
        { key: 'comment_replies', label: 'Replies to your comments' }
      ]
    },
    {
      title: 'Engagement Updates',
      icon: '📊',
      settings: [
        { key: 'ranking_updates', label: 'Weekly ranking changes' },
        { key: 'weekly_digest', label: 'Weekly activity digest' }
      ]
    }
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-slate-800 border border-white/20 p-8 max-w-md text-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading email preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Mail className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Email Preferences</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 transition-colors rounded"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Settings */}
        <div className="p-6 space-y-6">
          {categories.map((category, idx) => (
            <div key={idx}>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>{category.icon}</span>
                {category.title}
              </h3>
              <div className="space-y-3 pl-8">
                {category.settings.map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex items-center justify-between cursor-pointer group"
                  >
                    <span className="text-gray-300 group-hover:text-white transition-colors">
                      {label}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggle(key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings[key] ? 'bg-purple-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings[key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {/* Global Controls */}
          <div className="pt-6 border-t border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  const allOn = Object.values(settings).every(v => v === true);
                  const newValue = !allOn;
                  setSettings(Object.keys(settings).reduce((acc, key) => ({
                    ...acc,
                    [key]: newValue
                  }), {}));
                }}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                {Object.values(settings).every(v => v === true) ? (
                  <>
                    <BellOff className="w-4 h-4" />
                    Turn all off
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4" />
                    Turn all on
                  </>
                )}
              </button>
            </div>

            {/* Save Status */}
            {saveStatus && (
              <div className={`flex items-center gap-2 text-sm ${
                saveStatus === 'success' ? 'text-green-400' : 'text-red-400'
              }`}>
                {saveStatus === 'success' ? (
                  <>
                    <Check className="w-4 h-4" />
                    Settings saved successfully
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4" />
                    Error saving settings
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-6 bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex-1 py-3 px-6 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white transition-colors"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailSettings;