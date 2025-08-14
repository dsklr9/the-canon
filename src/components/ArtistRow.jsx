import React from 'react';
import { GripVertical, X } from 'lucide-react';

const ArtistRow = ({ 
  artist, 
  index, 
  onRemove, 
  onShowDetails,
  isDraggable = true,
  isMobile = false,
  dragHandlers = {},
  mobileDragHandlers = {},
  isDragging = false,
  isPioneer = false,
  ArtistAvatar // Pass this component from parent
}) => {
  return (
    <div
      className={`flex items-center ${isMobile ? 'gap-2 p-2' : 'gap-3 p-3'} bg-black/30 border border-white/10 ${
        isDraggable && !isMobile ? 'cursor-move hover:bg-white/10' : ''
      } transition-all duration-200 ${
        isDragging ? 'opacity-50' : ''
      }`}
      {...(isDraggable && !isMobile ? dragHandlers : {})}
    >
      {/* Drag Handle */}
      {isDraggable && (
        <div 
          className={`drag-handle ${isMobile ? 'touch-target flex items-center justify-center w-8 h-8' : ''}`}
          {...(isMobile ? mobileDragHandlers : {})}
        >
          <GripVertical className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-gray-400`} />
        </div>
      )}
      
      {/* Ranking Number */}
      <span 
        className={`font-black text-gray-300 ${isMobile ? 'text-sm w-6 text-center' : 'text-xl w-8'} cursor-pointer`}
        onClick={(e) => {
          e.stopPropagation();
          onShowDetails?.(artist);
        }}
      >
        #{index + 1}
      </span>
      
      {/* Artist Avatar */}
      <div 
        className="cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onShowDetails?.(artist);
        }}
      >
        <ArtistAvatar artist={artist} size={isMobile ? 'w-8 h-8' : 'w-10 h-10'} />
      </div>
      
      {/* Artist Info */}
      <div 
        className="flex-1 min-w-0"
        onClick={(e) => {
          e.stopPropagation();
          onShowDetails?.(artist);
        }}
      >
        <p className={`font-medium truncate ${isMobile ? 'text-sm' : ''}`}>{artist.name}</p>
        <p className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>{artist.era}</p>
      </div>
      
      {/* Pioneer Badge */}
      {isPioneer && (
        <span 
          className="text-lg cursor-pointer" 
          title="Pioneer Pick - Tap for details"
          onClick={(e) => {
            e.stopPropagation();
            onShowDetails?.(artist);
          }}
        >
          🏆
        </span>
      )}
      
      {/* Remove Button */}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(artist);
          }}
          className={`${isMobile ? 'p-1' : 'p-2'} hover:bg-white/10 transition-colors touch-target rounded`}
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      )}
    </div>
  );
};

export default ArtistRow;