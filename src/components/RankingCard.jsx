import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Search, 
  Trophy, 
  Star,
  Edit2,
  Save,
  X
} from 'lucide-react';
import ArtistRow from './ArtistRow';

const RankingCard = ({
  list,
  type = 'default', // 'all-time', 'custom', 'friend'
  isExpanded,
  onToggleExpansion,
  onRemoveArtist,
  onAddArtist,
  onShowArtistDetails,
  onShare,
  onEdit,
  searchQuery,
  onSearchChange,
  searchResults,
  showSearchResults,
  onSearchFocus,
  onSearchKeyDown,
  selectedSearchIndex,
  uniquenessScore,
  isMobile = false,
  dragHandlers = {},
  mobileDrag = {},
  draggedItem,
  dragOverIndex,
  draggedFromList,
  checkPioneerStatus,
  ArtistAvatar,
  children // For additional content like buttons
}) => {
  const displayCount = isExpanded ? list.artists.length : Math.min(list.artists.length, 10);
  const isAllTime = type === 'all-time';
  const isCustom = type === 'custom';
  const isFriend = type === 'friend';
  
  // Color schemes based on type
  const colorScheme = {
    'all-time': {
      border: 'border-yellow-400/50',
      bg: 'bg-yellow-500/5',
      accent: 'text-yellow-400',
      icon: <Trophy className="w-6 h-6 text-yellow-400" />
    },
    'custom': {
      border: 'border-purple-400/30',
      bg: 'bg-purple-500/5',
      accent: 'text-purple-400',
      icon: <Star className="w-6 h-6 text-purple-400" />
    },
    'friend': {
      border: 'border-blue-400/30',
      bg: 'bg-blue-500/5',
      accent: 'text-blue-400',
      icon: null
    },
    'default': {
      border: 'border-white/10',
      bg: 'bg-slate-800/50',
      accent: 'text-gray-400',
      icon: null
    }
  }[type];

  return (
    <div className={`${colorScheme.bg} border-2 ${colorScheme.border} p-4`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {colorScheme.icon}
          <h3 className="text-xl font-bold">{list.title}</h3>
          {uniquenessScore && (
            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
              {uniquenessScore}% unique
            </span>
          )}
          {isAllTime && (
            <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
              Influences Canon
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {onShare && (
            <button
              onClick={onShare}
              className="p-2 hover:bg-white/10 transition-colors rounded"
              title="Share ranking"
            >
              <Copy className="w-4 h-4" />
            </button>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-2 hover:bg-white/10 transition-colors rounded"
              title="Edit title"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search Section - render children if provided (for custom search implementation) */}
      {children && children}

      {/* Empty State */}
      {list.artists.length === 0 && (
        <div className="border-2 border-dashed border-gray-600 p-12 text-center text-gray-400">
          {isMobile ? 'Search and tap artists to add them' : 'Search artists or drag them here'}
        </div>
      )}

      {/* Artist List */}
      <div className="space-y-2">
        {list.artists.slice(0, displayCount).map((artist, index) => (
          <div key={artist.id}>
            {/* Drop indicator */}
            {dragOverIndex === index && draggedFromList === list.id && (
              <div className="h-1 bg-purple-400 rounded transition-all duration-200" />
            )}
            
            <div data-drop-index={index}>
              <ArtistRow
                artist={artist}
                index={index}
                onRemove={onRemoveArtist ? () => onRemoveArtist(artist.id, list.id) : null}
                onShowDetails={onShowArtistDetails}
                isDraggable={!isFriend}
                isMobile={isMobile}
                dragHandlers={dragHandlers[artist.id]}
                mobileDragHandlers={mobileDrag ? {
                  onTouchStart: (e) => mobileDrag.handleTouchStart(e, { artist, listId: list.id }),
                  onTouchMove: mobileDrag.handleTouchMove,
                  onTouchEnd: mobileDrag.handleTouchEnd
                } : {}}
                isDragging={draggedItem?.artist.id === artist.id}
                isPioneer={checkPioneerStatus?.(artist.id)}
                ArtistAvatar={ArtistAvatar}
              />
            </div>
          </div>
        ))}
        
        {/* Drop zone at end */}
        {dragOverIndex === list.artists.length && draggedFromList === list.id && (
          <div className="h-1 bg-purple-400 rounded transition-all duration-200" />
        )}
      </div>

      {/* Show More/Less Button */}
      {list.artists.length > 10 && (
        <button 
          onClick={() => onToggleExpansion(list.id)}
          className="w-full mt-4 py-2 text-sm text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2"
        >
          {isExpanded ? (
            <>Show Less <ChevronUp className="w-4 h-4" /></>
          ) : (
            <>Show All {list.artists.length} <ChevronDown className="w-4 h-4" /></>
          )}
        </button>
      )}

      {/* Additional Content */}
      {children}
    </div>
  );
};

export default RankingCard;