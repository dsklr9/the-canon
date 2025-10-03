import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Download, X, Loader2, Crown, Trophy } from 'lucide-react';

const ShareableCard = ({ userData, topArtists, onClose }) => {
  const cardRef = useRef(null);
  const [generating, setGenerating] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;

    setGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0f172a',
        scale: 2,
        logging: false,
        useCORS: true
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${userData?.username || 'my'}-canon-rankings.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        setGenerating(false);
      });
    } catch (err) {
      console.error('Error generating image:', err);
      setGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;

    setGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0f172a',
        scale: 2,
        logging: false,
        useCORS: true
      });

      canvas.toBlob(async (blob) => {
        if (navigator.share && navigator.canShare) {
          const file = new File([blob], `${userData?.username || 'my'}-canon.png`, { type: 'image/png' });

          if (navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: `${userData?.username}'s Canon Rankings`,
                text: `Check out my top hip-hop artists on The Canon!`
              });
            } catch (err) {
              if (err.name !== 'AbortError') {
                console.error('Error sharing:', err);
              }
            }
          } else {
            // Fallback to download
            handleDownload();
          }
        } else {
          // Fallback to download
          handleDownload();
        }
        setGenerating(false);
      });
    } catch (err) {
      console.error('Error generating image:', err);
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Share Your Rankings</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Preview Card */}
        <div ref={cardRef} className="bg-gradient-to-br from-purple-900 via-slate-900 to-black rounded-xl p-8 mb-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8 text-yellow-500" />
              <div>
                <h2 className="text-2xl font-bold text-white">The Canon</h2>
                <p className="text-gray-400 text-sm">Hip-Hop Rankings</p>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-white">
                {userData?.username?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-300 text-lg mb-2">
              <span className="font-bold text-white">@{userData?.username || 'Anonymous'}</span>'s Top 10
            </p>
            <div className="flex items-center gap-2 text-yellow-500">
              <Trophy className="w-5 h-5" />
              <span className="text-sm font-semibold">Greatest of All Time</span>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            {topArtists.slice(0, 10).map((artist, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-slate-800/50 rounded-lg p-3 backdrop-blur-sm"
              >
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-white">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{artist.name || artist}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-700 pt-4 text-center">
            <p className="text-gray-400 text-sm">
              Made with <span className="text-purple-400 font-semibold">TheCanon.io</span>
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Create your own rankings • thecanon.io/u/{userData?.username}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleShare}
            disabled={generating}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white rounded-lg transition-colors font-semibold"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Share Image</span>
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>

        <p className="text-gray-500 text-xs text-center mt-3">
          Download or share this image on social media
        </p>
      </div>
    </div>
  );
};

export default ShareableCard;
