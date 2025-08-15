// Part 1 of 5 - TheCanon Mobile Complete with v5 Integration
import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { Heart, MessageCircle, Share2, TrendingUp, Users, Zap, Trophy, Flame, Star, ChevronDown, X, Check, Shuffle, Timer, Search, Plus, GripVertical, User, Edit2, Save, ArrowUp, ArrowDown, Swords, Crown, Settings, Copy, BarChart3, Sparkles, Target, Gift, AlertCircle, Loader2, Filter, Clock, Award, TrendingDown, Users2, Bell, LogOut } from 'lucide-react';
import { ReportModal, useRateLimit, filterContent } from './ModerationComponents';
// import TournamentSection from './TournamentSection'; // Replaced with TournamentWidget and TournamentBracket
import CustomCategorySelector from './CustomCategorySelector';
import CustomCategorySection from './CustomCategorySection';
import RankingCard from './RankingCard';
import ArtistRow from './ArtistRow';
import SkeletonLoader from './SkeletonLoader';
import VirtualList from './VirtualList';
import LazyImage from './LazyImage';
import LoadingButton from './LoadingButton';
import LiveActivityFeed from './LiveActivityFeed';
import FriendCompatibility from './FriendCompatibility';
import QuickSocialActions, { ArtistSocialActions } from './QuickSocialActions';
import GroupChallenges from './GroupChallenges';
import TournamentWidget from './TournamentWidget';
import TournamentBracket from './TournamentBracket';
import { useDebounce, useDebouncedCallback } from '../hooks/useDebounce';

// Add CSS styles to prevent viewport issues
const globalStyles = `
  @media (max-width: 768px) {
    /* Normal mobile styles - allow scrolling */
    body {
      width: 100%;
    }
    
    #root {
      width: 100%;
    }
    
    /* Prevent text selection on drag handles */
    .drag-handle {
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;
      touch-action: none;
      cursor: grab;
    }
    
    .drag-handle:active {
      cursor: grabbing;
    }
    
    /* Improve touch targets */
    .touch-target {
      min-height: 44px;
      min-width: 44px;
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('thecanon-mobile-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'thecanon-mobile-styles';
  styleSheet.textContent = globalStyles;
  document.head.appendChild(styleSheet);
}

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
          <div className="text-center max-w-2xl">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="text-gray-400 mb-4">The Canon hit an unexpected error</p>
            {this.state.error && (
              <details className="text-left bg-slate-800 p-4 rounded mb-4 text-sm">
                <summary className="cursor-pointer text-red-400 mb-2">Error Details</summary>
                <pre className="text-gray-300 overflow-auto whitespace-pre-wrap">{this.state.error.toString()}</pre>
              </details>
            )}
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Loading Component
const LoadingSpinner = ({ size = "default" }) => {
  const sizeClasses = {
    small: "w-4 h-4",
    default: "w-8 h-8",
    large: "w-12 h-12"
  };
  
  return (
    <div className="flex items-center justify-center">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-purple-400`} />
    </div>
  );
};

// Toast Notification Component
const Toast = ({ message, type = "info", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
    warning: "bg-yellow-500"
  };

  return (
    <div className={`fixed bottom-4 right-4 ${bgColors[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-[60] animate-slide-up`}>
      <span>{message}</span>
      <button onClick={onClose} className="hover:opacity-75">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Mobile detection hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
        setIsMobile(window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
      }
    };
    
    checkMobile();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);
  
  return isMobile;
};

// Enhanced mobile drag handler with improved scroll prevention
const useMobileDrag = (onDragStart, onDragEnd, onDragMove) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedElement, setDraggedElement] = useState(null);
  const touchStartY = useRef(0);
  const touchCurrentY = useRef(0);
  const touchStartX = useRef(0);
  const initialScrollY = useRef(0);
  const dragThreshold = 8; // Reduced threshold for better responsiveness
  const allowScrollDirection = useRef(null);

  const handleTouchStart = useCallback((e, data) => {
    // Touch events are now directly on drag handle, so no need to check target
    
    // Immediately prevent default to stop any scroll behavior
    e.preventDefault();
    e.stopPropagation();
    
    // Store initial touch position and scroll position
    touchStartY.current = e.touches[0].clientY;
    touchCurrentY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
    initialScrollY.current = window.scrollY;
    allowScrollDirection.current = null;
    
    // Aggressive scroll prevention - apply immediately
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${initialScrollY.current}px`;
    document.body.style.touchAction = 'none';
    document.body.style.width = '100%';
    document.body.style.userSelect = 'none';
    
    // Also lock all scrollable containers
    const scrollableElements = document.querySelectorAll('[style*="overflow"]');
    scrollableElements.forEach(el => {
      el.style.touchAction = 'none';
      el.style.overflowY = 'hidden';
    });
    
    // Find main scrollable container and lock it
    const mainContainer = document.querySelector('main') || document.querySelector('[class*="overflow"]');
    if (mainContainer) {
      mainContainer.style.overflow = 'hidden';
      mainContainer.style.touchAction = 'none';
    }
    
    // Find the draggable item container
    const draggableItem = e.currentTarget.closest('[data-drop-index]') || e.currentTarget.closest('[data-list-id]');
    setDraggedElement({ element: draggableItem, data });
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!draggedElement) return;
    
    // Always prevent default to stop scrolling
    e.preventDefault();
    e.stopPropagation();
    
    touchCurrentY.current = e.touches[0].clientY;
    const touchCurrentX = e.touches[0].clientX;
    
    const deltaY = Math.abs(touchCurrentY.current - touchStartY.current);
    const deltaX = Math.abs(touchCurrentX - touchStartX.current);
    
    // Only start dragging if we've moved enough and it's primarily vertical
    if (!isDragging && deltaY > dragThreshold) {
      // Ensure we're moving more vertically than horizontally for drag
      if (deltaY > deltaX * 0.7) {
        setIsDragging(true);
        onDragStart && onDragStart(draggedElement.data);
        
        // Add visual feedback with more pronounced effects
        draggedElement.element.style.opacity = '0.8';
        draggedElement.element.style.transform = 'scale(1.05)';
        draggedElement.element.style.zIndex = '9999';
        draggedElement.element.style.position = 'relative';
        draggedElement.element.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
        draggedElement.element.style.transition = 'none';
      }
    }
    
    if (isDragging && onDragMove) {
      // Move the element with the touch
      const moveY = touchCurrentY.current - touchStartY.current;
      draggedElement.element.style.transform = `translateY(${moveY}px) scale(1.05)`;
      
      onDragMove(e.touches[0]);
    }
  }, [draggedElement, isDragging, onDragStart, onDragMove]);

  const handleTouchEnd = useCallback((e) => {
    // Restore scroll position and re-enable scrolling
    const scrollY = initialScrollY.current;
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.touchAction = '';
    document.body.style.width = '';
    document.body.style.userSelect = '';
    
    // Restore scroll position immediately
    window.scrollTo(0, scrollY);
    
    // Re-enable all previously locked containers
    const scrollableElements = document.querySelectorAll('[style*="touch-action"]');
    scrollableElements.forEach(el => {
      el.style.touchAction = '';
      el.style.overflowY = '';
    });
    
    const mainContainer = document.querySelector('main') || document.querySelector('[class*="overflow"]');
    if (mainContainer) {
      mainContainer.style.overflow = '';
      mainContainer.style.touchAction = '';
    }
    
    if (isDragging && draggedElement) {
      // Reset visual feedback
      draggedElement.element.style.opacity = '1';
      draggedElement.element.style.transform = '';
      draggedElement.element.style.zIndex = '';
      draggedElement.element.style.position = '';
      draggedElement.element.style.boxShadow = '';
      draggedElement.element.style.transition = '';
      
      // Find drop target by temporarily hiding the dragged element
      const touch = e.changedTouches[0];
      const originalDisplay = draggedElement.element.style.display;
      const originalPointerEvents = draggedElement.element.style.pointerEvents;
      
      // Temporarily hide the dragged element to get element underneath
      draggedElement.element.style.display = 'none';
      draggedElement.element.style.pointerEvents = 'none';
      
      const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
      console.log('Drop target found:', dropTarget, 'at position:', touch.clientX, touch.clientY);
      
      // Restore the element visibility
      draggedElement.element.style.display = originalDisplay;
      draggedElement.element.style.pointerEvents = originalPointerEvents;
      
      onDragEnd && onDragEnd(draggedElement.data, dropTarget);
    }
    
    setIsDragging(false);
    setDraggedElement(null);
    touchStartY.current = 0;
    touchCurrentY.current = 0;
    touchStartX.current = 0;
    allowScrollDirection.current = null;
  }, [isDragging, draggedElement, onDragEnd]);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    isDragging
  };
};

// Enhanced Rate Limit Hook
const useEnhancedRateLimit = (supabase) => {
  const { checkRateLimit } = useRateLimit(supabase);
  const [lastFaceOffTime, setLastFaceOffTime] = useState(0);
  
  const checkFaceOffLimit = useCallback(() => {
    const now = Date.now();
    const fiveMinutesInMs = 5 * 60 * 1000; // Reduced from 1 hour to 5 minutes
    
    if (now - lastFaceOffTime < fiveMinutesInMs) {
      return false;
    }
    
    setLastFaceOffTime(now);
    return true;
  }, [lastFaceOffTime]);
  
  return { checkRateLimit, checkFaceOffLimit };
};

// Main Component
const TheCanon = ({ supabase }) => {
  console.log('TheCanon component initializing', { supabase: !!supabase });
  
  // Core state - all state variables from v5
  const [activeTab, setActiveTab] = useState('foryou');
  const [showFaceOff, setShowFaceOff] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentFaceOff, setCurrentFaceOff] = useState(0);
  const [userRankings, setUserRankings] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [userVotes, setUserVotes] = useState({});
  const [convictionLevel, setConvictionLevel] = useState(50);
  const [dailyPowerVotes, setDailyPowerVotes] = useState(3);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentingOnList, setCommentingOnList] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [listComments, setListComments] = useState({});
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [debateLikes, setDebateLikes] = useState({});
  const [commentLikes, setCommentLikes] = useState({});
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [draggedFromList, setDraggedFromList] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [otherListSearchQueries, setOtherListSearchQueries] = useState({});
  const [otherListSearchResults, setOtherListSearchResults] = useState({});
  const [editingRanking, setEditingRanking] = useState(null);
  const [viewingFriend, setViewingFriend] = useState(null);
  const [currentUserStats, setCurrentUserStats] = useState({ debates_started: 0, comments_made: 0, likes_received: 0, friend_count: 0 });
  const [showArtistRequestModal, setShowArtistRequestModal] = useState(false);
  const [requestedArtistName, setRequestedArtistName] = useState('');
  const [requestedArtistGenre, setRequestedArtistGenre] = useState('Hip-Hop');
  const [requestedArtistEra, setRequestedArtistEra] = useState('2020s');
  const [requestNotes, setRequestNotes] = useState('');
  const [selectedSearchIndex, setSelectedSearchIndex] = useState(-1);
  const [expandedLists, setExpandedLists] = useState(new Set());
  const [friendRankings, setFriendRankings] = useState([]);
  const [showCustomCategorySelector, setShowCustomCategorySelector] = useState(false);
  const [userCustomCategories, setUserCustomCategories] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [showTop100Modal, setShowTop100Modal] = useState(false);
  const [showCanonExplanation, setShowCanonExplanation] = useState(false);
  const [loadedRankings, setLoadedRankings] = useState(50);
  const [promptAddToList, setPromptAddToList] = useState(false);
  const [showTournamentBracket, setShowTournamentBracket] = useState(false);
  const [currentTournament, setCurrentTournament] = useState({
    id: 'march-madness-2024',
    title: 'March Madness: Best Bars',
    phase: 'submissions',
    deadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
    totalSlots: 32,
    submittedCount: 24,
    userSubmitted: false,
    currentRound: null,
    prize: '🏆 Custom Canon Badge',
    theme: 'Most iconic bars in hip-hop history'
  });
  const [selectedArtistToAdd, setSelectedArtistToAdd] = useState(null);
  const [username, setUsername] = useState("HipHopFan2025");
  const [editingUsername, setEditingUsername] = useState(false);
  const [userStreak, setUserStreak] = useState(0);
  const [userPoints, setUserPoints] = useState(0);
  const [userAchievements, setUserAchievements] = useState([]);
  const [otherRankingsOrder, setOtherRankingsOrder] = useState([]);
  const [draggedOtherRankingId, setDraggedOtherRankingId] = useState(null);
  const [otherRankingDragOverIndex, setOtherRankingDragOverIndex] = useState(null);
  const [userProfilePicture, setUserProfilePicture] = useState(null);
  const [uploadingProfilePicture, setUploadingProfilePicture] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [showArtistCard, setShowArtistCard] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all-time');
  const [dailyFaceOffsCompleted, setDailyFaceOffsCompleted] = useState(0);
  const [showDebateModal, setShowDebateModal] = useState(false);
  const [debateTitle, setDebateTitle] = useState('');
  const [debateContent, setDebateContent] = useState('');
  const searchRef = useRef(null);
  const myTop10SearchRef = useRef(null);
  const [fullRankings, setFullRankings] = useState([]);
  const [totalVoters, setTotalVoters] = useState(0);
  
  // New debate-related state
  const [realDebates, setRealDebates] = useState([]);
  const [selectedArtistTags, setSelectedArtistTags] = useState([]);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [showTagSearch, setShowTagSearch] = useState(false);
  const [mentionedFriends, setMentionedFriends] = useState([]);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionSearchQuery, setMentionSearchQuery] = useState('');
  const [mentionCursorPosition, setMentionCursorPosition] = useState(null);
  
  // New social features state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportContent, setReportContent] = useState(null);
  const [userLikes, setUserLikes] = useState(new Set());
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [isPostingReply, setIsPostingReply] = useState(false);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  
  // Database state
  const [currentUser, setCurrentUser] = useState(null);
  const [savingStatus, setSavingStatus] = useState('');
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [allArtistsFromDB, setAllArtistsFromDB] = useState([]);
  
  // New feature states from v5
  const [faceOffFilters, setFaceOffFilters] = useState({ era: 'all', region: 'all' });
  const [battleHistory, setBattleHistory] = useState([]);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [showBattleModal, setShowBattleModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState('');
  const [battleArtist1, setBattleArtist1] = useState('');
  const [battleArtist2, setBattleArtist2] = useState('');
  const [battleType, setBattleType] = useState('random');
  const [battleMessage, setBattleMessage] = useState('');
  const [debateComments, setDebateComments] = useState({});
  const [userBadges, setUserBadges] = useState([]);
  const [hotTakes, setHotTakes] = useState([]);
  const [collaborativeLists, setCollaborativeLists] = useState([]);
  const [rankingComments, setRankingComments] = useState({});
  const [commentingOn, setCommentingOn] = useState(null);
  const [headToHeadRecords, setHeadToHeadRecords] = useState({});
  
  // Additional states for friend search
  const [friendSearchQuery, setFriendSearchQuery] = useState('');
  const [friendSearchResults, setFriendSearchResults] = useState([]);
  const [showFriendSearch, setShowFriendSearch] = useState(false);
  
  // Initial artist data
  const [allArtists, setAllArtists] = useState([]);
  const [notableArtists, setNotableArtists] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [userLists, setUserLists] = useState([]);
  const [faceOffs, setFaceOffs] = useState([]);
  
  // Loading states
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDebates, setIsLoadingDebates] = useState(false);
  const [isLoadingRankings, setIsLoadingRankings] = useState(false);
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const [isLoadingBattleHistory, setIsLoadingBattleHistory] = useState(false);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [isLoadingCompatibility, setIsLoadingCompatibility] = useState(false);
  const [isPostingDebate, setIsPostingDebate] = useState(false);
  
  // Compatibility data
  const [compatibilityScores, setCompatibilityScores] = useState({});
  const [topCompatibleUsers, setTopCompatibleUsers] = useState([]);
  const [compatibilityRecommendations, setCompatibilityRecommendations] = useState([]);
  
  // Toast notifications
  const [toasts, setToasts] = useState([]);

  // Mobile detection
  const isMobile = useIsMobile();
  
  // Enhanced rate limiting
  const { checkRateLimit, checkFaceOffLimit } = useEnhancedRateLimit(supabase);

  // Artist Avatar Component - Now with LazyImage
  const ArtistAvatar = memo(({ artist, size = "w-8 h-8" }) => {
    const imageUrl = artist.avatar_url || (artist.avatar && artist.avatar.startsWith && artist.avatar.startsWith('http') ? artist.avatar : null);
    
    if (imageUrl) {
      return (
        <LazyImage 
          src={imageUrl} 
          alt={artist.name} 
          className={`${size} rounded-full object-cover`}
          placeholder={
            <div className={`${size} rounded-full bg-gray-700 animate-pulse`} />
          }
          onError={() => {
            // Fall back to emoji on error
            return <span className="text-2xl">🎤</span>;
          }}
        />
      );
    }
    
    const emoji = artist.avatar && !artist.avatar.startsWith('http') ? artist.avatar : '🎤';
    return <span className="text-2xl">{emoji}</span>;
  });

  const UserAvatar = memo(({ user, size = "w-8 h-8", profilePicture = null }) => {
    const imageUrl = profilePicture || user?.profile_picture_url;
    
    if (imageUrl) {
      return <img src={imageUrl} alt={user?.username || 'User'} className={`${size} rounded-full object-cover`} loading="lazy" />;
    }
    
    // Fallback to first letter of username in a circle
    const initial = (user?.username || user?.display_name || 'U').charAt(0).toUpperCase();
    return (
      <div className={`${size} bg-purple-500 rounded-full flex items-center justify-center text-white font-bold`}>
        {initial}
      </div>
    );
  });

  // Prevent viewport dragging on iOS and enhance touch handling
  useEffect(() => {
    if (isMobile) {
      // Enhanced touch prevention for drag operations
      const preventDefaultTouch = (e) => {
        // Prevent multi-touch gestures
        if (e.touches.length > 1) {
          e.preventDefault();
          return;
        }
        
        // Check if touch is on a drag handle
        const target = e.target.closest('.drag-handle');
        if (target) {
          // Let our custom drag handler deal with it
          return;
        }
      };
      
      // Also prevent scroll bounce on iOS
      const preventScrollBounce = (e) => {
        const target = e.target.closest('.drag-handle');
        if (target) {
          e.preventDefault();
        }
      };
      
      document.addEventListener('touchmove', preventDefaultTouch, { passive: false });
      document.addEventListener('touchstart', preventScrollBounce, { passive: false });
      
      // Set viewport meta tag
      let viewport = document.querySelector('meta[name="viewport"]');
      if (!viewport) {
        viewport = document.createElement('meta');
        viewport.name = 'viewport';
        document.head.appendChild(viewport);
      }
      viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      
      return () => {
        document.removeEventListener('touchmove', preventDefaultTouch);
        document.removeEventListener('touchstart', preventScrollBounce);
      };
    }
  }, [isMobile]);

  // Toast functions
  const addToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);
  
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Helper to create drag handlers for an artist
  const createDragHandlers = useCallback((artist, listId, index) => ({
    draggable: true,
    onDragStart: (e) => handleDragStart(e, artist, listId),
    onDragEnd: handleDragEnd,
    onDragEnter: (e) => handleDragEnter(e, index),
    onDragOver: handleDragOver,
    onDrop: (e) => handleDrop(e, index, listId)
  }), []);

  // Pre-defined starter categories (first 3 slots)
  const starterCategories = [
    { id: 'underrated', name: 'Most Underrated', description: 'Artists who don\'t get the recognition they deserve' },
    { id: 'overrated', name: 'Most Overrated', description: 'Artists who get more credit than they deserve' },
    { id: 'current', name: 'Best in the Game (right now)', description: 'The hottest artists dominating hip-hop today' }
  ];

  // Badge definitions
  const badgeDefinitions = {
    pioneer: { icon: '🏆', name: 'Pioneer', description: 'Unique taste in hip-hop' },
    oldHead: { icon: '📼', name: 'Old Head', description: 'Respects the classics' },
    tastemaker: { icon: '🔥', name: 'Tastemaker', description: 'Spots talent early' },
    crateDigger: { icon: '💎', name: 'Crate Digger', description: 'Deep cuts only' },
    debater: { icon: '🗣️', name: 'Master Debater', description: 'Sparks conversations' },
    curator: { icon: '📚', name: 'Curator', description: 'Builds legendary lists' },
    veteran: { icon: '⭐', name: 'Veteran', description: '1000+ points earned' },
    voter: { icon: '🗳️', name: 'Voter', description: '100+ battles voted' }
  };

  // Preset avatar collection for users to choose from
  const presetAvatars = [
    'https://djuoisgfwromkvtcenyd.supabase.co/storage/v1/object/public/profile-pictures/guy1.png',
    'https://djuoisgfwromkvtcenyd.supabase.co/storage/v1/object/public/profile-pictures/gal1.png',
    'https://djuoisgfwromkvtcenyd.supabase.co/storage/v1/object/public/profile-pictures/dude1.png',
    'https://djuoisgfwromkvtcenyd.supabase.co/storage/v1/object/public/profile-pictures/gal2.png',
    'https://djuoisgfwromkvtcenyd.supabase.co/storage/v1/object/public/profile-pictures/guy2.png',
    'https://djuoisgfwromkvtcenyd.supabase.co/storage/v1/object/public/profile-pictures/gal3.png',
    'https://djuoisgfwromkvtcenyd.supabase.co/storage/v1/object/public/profile-pictures/dude2.png',
    'https://djuoisgfwromkvtcenyd.supabase.co/storage/v1/object/public/profile-pictures/gal4.png',
    'https://djuoisgfwromkvtcenyd.supabase.co/storage/v1/object/public/profile-pictures/guy3.png',
    'https://djuoisgfwromkvtcenyd.supabase.co/storage/v1/object/public/profile-pictures/gal5.png',
    'https://djuoisgfwromkvtcenyd.supabase.co/storage/v1/object/public/profile-pictures/dude3.png',
    'https://djuoisgfwromkvtcenyd.supabase.co/storage/v1/object/public/profile-pictures/gal6.png',
    'https://djuoisgfwromkvtcenyd.supabase.co/storage/v1/object/public/profile-pictures/guy4.png',
    'https://djuoisgfwromkvtcenyd.supabase.co/storage/v1/object/public/profile-pictures/gal7.png',
    'https://djuoisgfwromkvtcenyd.supabase.co/storage/v1/object/public/profile-pictures/dude4.png',
    'https://djuoisgfwromkvtcenyd.supabase.co/storage/v1/object/public/profile-pictures/gal8.png'
  ];

  // Combined initialization effect
  useEffect(() => {
    let mounted = true;
    
    const initializeApp = async () => {
      console.log('Starting app initialization...');
      
      try {
        // First check authentication and first login
        const { data: { user } } = await supabase.auth.getUser();
        if (!mounted) return;
        
        // Load public data regardless of authentication
        await Promise.all([
          loadArtistsFromDB(),
          loadDebates()
        ]);
        
        if (user) {
          console.log('🔧 User found during initialization:', user.id);
          console.log('🔧 Setting currentUser...');
          setCurrentUser(user);
          console.log('🔧 currentUser set!');
          
          console.log('🔧 About to check first login...');
          // Check first login
          console.log('🔧 Loading profile for user:', user.id);
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();
            
            console.log('🔧 Profile loaded:', profile, 'Error:', profileError);
            
            if (profileError && profileError.code !== 'PGRST116') {
              console.error('🔧 Profile loading error:', profileError);
              // Continue with null profile
            }
            
            await continueInitialization(user, profile);
          } catch (error) {
            console.error('🔧 Profile loading failed:', error);
            // Continue with null profile
            await continueInitialization(user, null);
          }
        }
      } catch (error) {
        console.error('Initialization error:', error);
        addToast('Error loading data. Please refresh.', 'error');
      } finally {
        if (mounted) {
          setIsInitialLoading(false);
        }
      }
    };

    const continueInitialization = async (user, profile) => {
      console.log('🔧 Continuing initialization with profile:', !!profile);
      try {
          
          if (profile?.first_login) {
            setShowTutorial(true);
            setIsFirstLogin(true);
            await supabase
              .from('profiles')
              .update({ first_login: false })
              .eq('id', user.id);
          } else if (checkFaceOffLimit()) {
            setShowFaceOff(true);
          }
          
          // Set user data
          console.log('🔧 Setting user data from profile...');
          setUsername(profile?.username || profile?.display_name || user.email.split('@')[0]);
          setUserStreak(profile?.login_streak || 0);
          setUserPoints(profile?.total_points || 0);
          setUserProfilePicture(profile?.profile_picture_url || null);
          console.log('🔧 User data set, about to load authenticated data...');
          
          // Load authenticated user data
          console.log('🔧 About to start Promise.all block...');
          console.log('🔧 All conditions met, starting Promise.all...');
          console.log('🔧 Starting Promise.all with loadUserCustomCategories...');
          await Promise.all([
            loadUserRankings(user.id),
            loadUserLikes(),
            loadFriends(user), // Pass user directly since currentUser state isn't updated yet
            loadDailyChallenge(),
            loadBattleHistory(),
            loadNotifications()
          ]);
          console.log('🔧 Promise.all completed');
      } catch (error) {
        console.error('Initialization error:', error);
        addToast('Error loading data. Please refresh.', 'error');
      } finally {
        if (mounted) {
          console.log('Setting isInitialLoading to false');
          setIsInitialLoading(false);
        }
      }
    };
    
    initializeApp();
    
    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array - runs once on mount

  // Real-time subscription for friend requests and friendships
  useEffect(() => {
    if (!currentUser) return;

    const friendRequestsSubscription = supabase
      .channel('friend_requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
          filter: `friend_id=eq.${currentUser.id}`
        },
        (payload) => {
          console.log('Friend request real-time update (as recipient):', payload);
          console.log('Current user ID:', currentUser.id);
          setTimeout(() => {
            console.log('Real-time: Reloading friends after recipient update...');
            loadFriends();
          }, 1500); // Slightly longer delay to ensure DB consistency
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
          filter: `user_id=eq.${currentUser.id}`
        },
        (payload) => {
          console.log('Friend request real-time update (as sender):', payload);
          console.log('Current user ID:', currentUser.id);
          setTimeout(() => {
            console.log('Real-time: Reloading friends after sender update...');
            loadFriends();
          }, 1500); // Slightly longer delay to ensure DB consistency
        }
      )
      .subscribe();

    return () => {
      friendRequestsSubscription.unsubscribe();
    };
  }, [currentUser]);

  // Load current user's stats
  useEffect(() => {
    if (currentUser && activeTab === 'mypeople') {
      loadUserStats(currentUser.id).then(({ stats }) => {
        setCurrentUserStats(stats);
      });
    }
  }, [currentUser, activeTab]);

  // Calculate taste compatibility between two users' rankings
  const calculateTasteCompatibility = useCallback((userRanking, otherRanking, returnDetails = false) => {
    if (!userRanking?.artists?.length || !otherRanking?.artists?.length) {
      return returnDetails ? { score: 0, insights: {} } : 0;
    }
    
    const userArtists = userRanking.artists;
    const otherArtists = otherRanking.artists;
    
    // Parameters for scoring
    const maxList = Math.max(userArtists.length, otherArtists.length);
    const minList = Math.min(userArtists.length, otherArtists.length);
    
    let totalScore = 0;
    let matchCount = 0;
    let positionPenalty = 0;
    
    // Track era/style insights
    const eraMatches = new Map();
    const sharedArtists = [];
    const userEras = new Map();
    const otherEras = new Map();
    
    // Count eras in each list
    userArtists.forEach(artist => {
      if (artist.era) {
        userEras.set(artist.era, (userEras.get(artist.era) || 0) + 1);
      }
    });
    
    otherArtists.forEach(artist => {
      if (artist.era) {
        otherEras.set(artist.era, (otherEras.get(artist.era) || 0) + 1);
      }
    });
    
    // Check each artist in user's list
    userArtists.forEach((artist, userIndex) => {
      const otherIndex = otherArtists.findIndex(a => a.id === artist.id);
      
      if (otherIndex !== -1) {
        matchCount++;
        
        // Track shared artists
        sharedArtists.push({
          artist,
          userRank: userIndex + 1,
          otherRank: otherIndex + 1,
          rankDiff: Math.abs(userIndex - otherIndex)
        });
        
        // Track era matches
        if (artist.era) {
          if (!eraMatches.has(artist.era)) {
            eraMatches.set(artist.era, { count: 0, artists: [] });
          }
          const eraData = eraMatches.get(artist.era);
          eraData.count++;
          eraData.artists.push(artist.name);
          eraMatches.set(artist.era, eraData);
        }
        
        // Calculate position-based score (higher positions = more weight)
        const userWeight = 1 / (userIndex + 1);  // 1st place = 1, 2nd = 0.5, 3rd = 0.33...
        const otherWeight = 1 / (otherIndex + 1);
        
        // Position similarity (0 to 1, where 1 = same position)
        const positionDiff = Math.abs(userIndex - otherIndex);
        const positionSimilarity = 1 - (positionDiff / maxList);
        
        // Combined score for this match
        const matchScore = (userWeight + otherWeight) * positionSimilarity;
        totalScore += matchScore;
        
        // Track position differences for penalty calculation
        positionPenalty += positionDiff / maxList;
      }
    });
    
    // Calculate final compatibility score
    if (matchCount === 0) {
      return returnDetails ? { score: 0, insights: {} } : 0;
    }
    
    // Base score from matches (normalized by list sizes)
    const matchRatio = matchCount / minList;  // Use min list for size-agnostic scoring
    const positionScore = totalScore / matchCount;
    
    // Bonus for having similar list sizes
    const sizeRatio = minList / maxList;
    const sizeBonus = sizeRatio * 0.1;  // Up to 10% bonus for similar sizes
    
    // Final score (0-100)
    const compatibility = (matchRatio * 0.5 + positionScore * 0.4 + sizeBonus) * 100;
    const finalScore = Math.min(Math.round(compatibility), 100);
    
    if (!returnDetails) {
      return finalScore;
    }
    
    // Sort era matches by count
    const topEras = Array.from(eraMatches.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3)
      .map(([era, data]) => ({ 
        era, 
        count: data.count,
        artists: data.artists.slice(0, 3)
      }));
    
    // Find alignment insights
    const sortedShared = [...sharedArtists].sort((a, b) => a.rankDiff - b.rankDiff);
    const strongestAlignment = sortedShared[0];
    const biggestDisagreement = sortedShared[sortedShared.length - 1];
    
    // Calculate era diversity overlap
    const sharedEras = Array.from(userEras.keys()).filter(era => otherEras.has(era));
    const eraDiversity = sharedEras.length / Math.min(userEras.size, otherEras.size);
    
    return {
      score: finalScore,
      insights: {
        matchCount,
        topEras,
        sharedArtists: sharedArtists.slice(0, 5), // Top 5 shared artists
        strongestAlignment,
        biggestDisagreement,
        eraDiversity: Math.round(eraDiversity * 100),
        userFavoriteEra: Array.from(userEras.entries()).sort((a, b) => b[1] - a[1])[0]?.[0],
        otherFavoriteEra: Array.from(otherEras.entries()).sort((a, b) => b[1] - a[1])[0]?.[0]
      }
    };
  }, []);

  // Load compatibility scores for friends and discover compatible users
  const loadCompatibilityScores = useCallback(async () => {
    if (!currentUser || !userLists.length) return;
    
    setIsLoadingCompatibility(true);
    try {
      // Get user's main canon ranking (Top XX list has isAllTime: true)
      const userCanon = userLists.find(list => list.isAllTime === true);
      if (!userCanon?.artists?.length) return;
      
      // Calculate compatibility with friends
      const friendScores = {};
      if (friends && friends.length > 0) {
        for (const friend of friends) {
          // Get friend's canon ranking
          const { data: friendRanking } = await supabase
            .from('rankings')
            .select('*, ranking_artists(artist_id, position, artists(id, name, image_url))')
            .eq('user_id', friend.id)
            .is('category', null)  // Main canon has null category
            .single();
          
          if (friendRanking?.ranking_artists) {
            const friendArtists = friendRanking.ranking_artists
              .sort((a, b) => a.position - b.position)
              .map(ra => ra.artists);
            
            const compatibility = calculateTasteCompatibility(
              { artists: userCanon.artists },
              { artists: friendArtists },
              true // Get detailed insights
            );
            
            friendScores[friend.id] = {
              score: compatibility.score,
              matchCount: compatibility.insights.matchCount,
              friend: friend,
              insights: compatibility.insights
            };
          }
        }
      }
      setCompatibilityScores(friendScores);
      
      // Discover top compatible strangers (excluding friends)
      const friendIds = friends?.map(f => f.id) || [];
      const { data: topRankings } = await supabase
        .from('rankings')
        .select(`
          user_id,
          profiles!inner(id, username, display_name, profile_picture_url),
          ranking_artists(artist_id, position, artists(id, name, image_url))
        `)
        .is('category', null)  // Main canon has null category
        .not('user_id', 'in', `(${[currentUser.id, ...friendIds].join(',')})`)
        .limit(50);  // Sample 50 users for efficiency
      
      if (topRankings) {
        const compatibleUsers = [];
        
        for (const ranking of topRankings) {
          if (ranking.ranking_artists?.length >= 5) {  // Only consider users with at least 5 artists
            const otherArtists = ranking.ranking_artists
              .sort((a, b) => a.position - b.position)
              .map(ra => ra.artists);
            
            const compatibility = calculateTasteCompatibility(
              { artists: userCanon.artists },
              { artists: otherArtists },
              true // Get detailed insights
            );
            
            if (compatibility.score >= 40) {  // Only include users with at least 40% compatibility
              compatibleUsers.push({
                user: ranking.profiles,
                score: compatibility.score,
                matchCount: compatibility.insights.matchCount,
                topArtists: otherArtists.slice(0, 3),
                insights: compatibility.insights
              });
            }
          }
        }
        
        // Sort by score and take top 5
        compatibleUsers.sort((a, b) => b.score - a.score);
        setTopCompatibleUsers(compatibleUsers.slice(0, 5));
        
        // Generate artist recommendations from highly compatible users
        try {
          const userArtistIds = new Set(userCanon.artists.map(a => a.id));
          const artistRecommendations = new Map();
        
        // Consider all compatible users (not just top 5) for recommendations
        const highlyCompatible = compatibleUsers.filter(u => u.score >= 60); // 60%+ compatibility
        
        for (const match of highlyCompatible) {
          // Get their full ranking for recommendations
          const { data: fullRanking } = await supabase
            .from('rankings')
            .select('ranking_artists(artist_id, position, artists(*))')
            .eq('user_id', match.user.id)
            .is('category', null)  // Main canon has null category
            .single();
          
          if (fullRanking?.ranking_artists) {
            const theirArtists = fullRanking.ranking_artists
              .sort((a, b) => a.position - b.position)
              .map(ra => ra.artists)
              .filter(artist => artist && artist.id); // Remove any null/undefined artists
            
            // Find artists they have that user doesn't
            theirArtists.forEach((artist, position) => {
              if (artist && artist.id && !userArtistIds.has(artist.id)) {
                if (!artistRecommendations.has(artist.id)) {
                  artistRecommendations.set(artist.id, {
                    artist,
                    compatibilitySum: 0,
                    recommenderCount: 0,
                    topPosition: position + 1,
                    recommenders: []
                  });
                }
                
                const rec = artistRecommendations.get(artist.id);
                // Weight by compatibility score and position (earlier = better)
                const positionWeight = 1 / (position + 1);
                const weightedScore = match.score * positionWeight;
                
                rec.compatibilitySum += weightedScore;
                rec.recommenderCount += 1;
                rec.topPosition = Math.min(rec.topPosition, position + 1);
                rec.recommenders.push({
                  user: match.user,
                  position: position + 1,
                  score: match.score
                });
              }
            });
          }
        }
        
        // Convert to array and calculate final scores
        const recommendations = Array.from(artistRecommendations.values())
          .map(rec => ({
            ...rec,
            averageCompatibility: rec.compatibilitySum / rec.recommenderCount,
            confidence: Math.min(rec.recommenderCount * 20, 100) // More recommenders = higher confidence
          }))
          .filter(rec => rec.recommenderCount >= 2) // Must be recommended by at least 2 compatible users
          .sort((a, b) => b.averageCompatibility - a.averageCompatibility)
          .slice(0, 5); // Top 5 recommendations
        
          setCompatibilityRecommendations(recommendations);
        } catch (recError) {
          console.error('Error generating recommendations:', recError);
          setCompatibilityRecommendations([]);
        }
      }
    } catch (error) {
      console.error('Error loading compatibility scores:', error);
    } finally {
      setIsLoadingCompatibility(false);
    }
  }, [currentUser, userLists, friends, supabase, calculateTasteCompatibility]);

  // Load compatibility scores when user lists or friends change
  useEffect(() => {
    if (currentUser && userLists.length > 0 && activeTab === 'mypeople') {
      loadCompatibilityScores();
    }
  }, [currentUser, userLists, friends, activeTab, loadCompatibilityScores]);


  // Get current user
  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUser(user);
      // Check if profile exists
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const defaultUsername = user.email.split('@')[0];
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: defaultUsername,
            display_name: user.user_metadata.full_name || defaultUsername,
            email: user.email,
            first_login: true,
            total_points: 0,
            login_streak: 0
          })
          .select()
          .single();
        
        if (createError) {
          console.error('Error creating profile:', createError);
          addToast('Error creating profile', 'error');
        } else {
          setUsername(newProfile.username);
        }
      } else if (profile) {
        setUsername(profile.username || profile.display_name);
        setUserStreak(profile.login_streak || 0);
        setUserPoints(profile.total_points || 0);
        
        // Load user badges
        const badges = [];
        if (profile.total_points > 1000) badges.push('curator');
        if (profile.unique_picks_ratio > 0.3) badges.push('pioneer');
        setUserBadges(badges);
      }
      
      // Load user's rankings and custom categories
      await Promise.all([
        loadUserRankings(user.id)
      ]);
    }
  };

  // Load face-off statistics for all artists
  const loadFaceOffStats = useCallback(async () => {
    try {
      console.log('🥊 Loading face-off statistics...');
      
      // Get all face-off votes
      const { data: faceOffVotes, error } = await supabase
        .from('faceoff_votes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const artistStats = new Map();
      
      // Process votes to calculate stats
      faceOffVotes?.forEach(vote => {
        const winnerId = vote.winner_id;
        const loserId = vote.artist1_id === winnerId ? vote.artist2_id : vote.artist1_id;
        const margin = vote.conviction_level || 50;
        
        // Initialize stats if needed
        [winnerId, loserId].forEach(artistId => {
          if (!artistStats.has(artistId)) {
            artistStats.set(artistId, {
              wins: 0,
              losses: 0,
              totalBattles: 0,
              totalMargin: 0,
              underdogWins: 0,
              overdogWins: 0
            });
          }
        });
        
        // Update winner stats
        const winnerStats = artistStats.get(winnerId);
        winnerStats.wins++;
        winnerStats.totalBattles++;
        winnerStats.totalMargin += margin;
        
        // Update loser stats
        const loserStats = artistStats.get(loserId);
        loserStats.losses++;
        loserStats.totalBattles++;
      });
      
      console.log('✅ Loaded face-off stats for', artistStats.size, 'artists');
      return artistStats;
    } catch (error) {
      console.error('Error loading face-off stats:', error);
      return new Map();
    }
  }, [supabase]);

  // Load artists from database
  const loadArtistsFromDB = async () => {
    try {
      const { data: artists, error } = await supabase
        .from('artists')
        .select('*')
        .order('name');
      
      if (!error && artists) {
        setAllArtistsFromDB(artists);
      } else {
        throw error;
      }
    } catch (error) {
      console.error('Error loading artists:', error);
      addToast('Error loading artists', 'error');
    }
  };

  // Load user rankings
  const loadUserRankings = async (userId) => {
    setIsLoadingRankings(true);
    try {
      const { data: rankings } = await supabase
        .from('rankings')
        .select(`
          *,
          ranking_items (
            position,
            artist_id,
            artists (*)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (rankings) {
        const formattedLists = rankings.map(ranking => ({
          id: ranking.id,
          title: ranking.list_title,
          category: ranking.list_type,
          custom_category_id: ranking.custom_category_id,
          artists: ranking.ranking_items
            .sort((a, b) => a.position - b.position)
            .map(item => ({
              ...item.artists,
              avatar: item.artists.avatar_url || '🎤',
              heat: item.artists.heat_score || 50,
              classics: item.artists.classics_count || 0
            })),
          created: new Date(ranking.created_at).toLocaleDateString(),
          isAllTime: ranking.is_all_time,
          isCollaborative: ranking.is_collaborative || false,
          collaborators: ranking.collaborators || []
        }));
        setUserLists(formattedLists);
      }
    } catch (error) {
      console.error('Error loading rankings:', error);
      addToast('Error loading your rankings', 'error');
    } finally {
      setIsLoadingRankings(false);
    }
  };

  // Load daily challenge
  const loadDailyChallenge = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: challenge } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('date', today)
        .single();
      
      if (challenge) {
        setDailyChallenge(challenge);
      } else {
        // Create today's challenge if it doesn't exist
        const challenges = [
          { type: 'era', title: '90s Legends Only', filter: { era: '90s' } },
          { type: 'region', title: 'East Coast Excellence', filter: { region: 'east' } },
          { type: 'category', title: 'Rate the Lyricists', category: 'lyricists' },
          { type: 'underground', title: 'Underground Kings', filter: { mainstream: false } },
          { type: 'rookies', title: 'Rookie Rankings', filter: { yearsActive: '<3' } }
        ];
        
        const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
        setDailyChallenge({ ...randomChallenge, date: today });
      }
    } catch (error) {
      console.error('Error loading daily challenge:', error);
    }
  };

  // Load battle history with stats
  const loadBattleHistory = async () => {
    if (!currentUser) return;
    
    setIsLoadingBattleHistory(true);
    try {
      const { data: votes } = await supabase
        .from('faceoff_votes')
        .select('*, winner:winner_id(name, era), loser:loser_id(name, era)')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (votes) {
        setBattleHistory(votes);
        
        // Calculate stats
        const stats = {
          totalVotes: votes.length,
          avgConviction: votes.reduce((acc, v) => acc + v.conviction_level, 0) / votes.length,
          eraPreference: {},
          winStreaks: []
        };
        
        votes.forEach(vote => {
          const era = vote.winner.era;
          stats.eraPreference[era] = (stats.eraPreference[era] || 0) + 1;
        });
        
        // Store stats for profile display
        setUserStats(stats);
      }
    } catch (error) {
      console.error('Error loading battle history:', error);
    } finally {
      setIsLoadingBattleHistory(false);
    }
  };

  // Load debates from database with hot takes detection
  const loadDebates = async () => {
    setIsLoadingDebates(true);
    try {
      const { data: debates, error } = await supabase
        .from('debates')
        .select(`
          *,
          profiles!debates_author_id_fkey (
            id,
            username,
            display_name,
            profile_picture_url
          ),
          debate_likes (user_id),
          debate_comments (id)
        `)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      // Format debates and detect hot takes
      const formattedDebates = debates.map(debate => {
        const isHotTake = detectHotTake(debate.content, debate.artist_tags);
        
        return {
          id: debate.id,
          authorId: debate.author_id,
          user: debate.profiles.username || debate.profiles.display_name,
          avatar: "🎤",
          profilePicture: debate.profiles.profile_picture_url,
          userProfile: debate.profiles,
          content: debate.content,
          title: debate.title,
          likes: debate.debate_likes?.length || 0,
          replies: debate.debate_comments?.length || 0,
          timestamp: getRelativeTime(debate.created_at),
          isOwn: currentUser && debate.author_id === currentUser.id,
          artistTags: debate.artist_tags || [],
          hot: debate.likes > 50,
          isHotTake,
          userLiked: debate.debate_likes?.some(like => like.user_id === currentUser?.id)
        };
      });
      
      setRealDebates(formattedDebates);
      setHotTakes(formattedDebates.filter(d => d.isHotTake));
      
      // Load likes for all debates (only if user is authenticated)
      if (currentUser) {
        const debateIds = formattedDebates.map(d => d.id);
        await loadLikes('debate', debateIds);
      }
      
    } catch (error) {
      console.error('Error loading debates:', error);
      addToast('Error loading debates', 'error');
    } finally {
      setIsLoadingDebates(false);
    }
  };

  // Hot take detection algorithm
  const detectHotTake = (content, artistTags) => {
    const controversialPhrases = [
      'overrated', 'trash', 'wack', 'fell off', 'better than',
      'goat', 'greatest', 'worst', 'mid', 'carried'
    ];
    
    const contentLower = content.toLowerCase();
    const hasControversial = controversialPhrases.some(phrase => 
      contentLower.includes(phrase)
    );
    
    // Check for controversial comparisons
    const hasVersus = contentLower.includes('>') || contentLower.includes('vs');
    
    return hasControversial || hasVersus;
  };

  // Load user's likes
  const loadUserLikes = async () => {
    if (!currentUser) return;
    
    try {
      const { data } = await supabase
        .from('debate_likes')
        .select('debate_id')
        .eq('user_id', currentUser.id);
      
      if (data) {
        setUserLikes(new Set(data.map(like => like.debate_id)));
      }
    } catch (error) {
      console.error('Error loading likes:', error);
    }
  };

  // Load friends and friend requests
  const loadFriends = async (userOverride = null) => {
    const user = userOverride || currentUser;
    if (!user) return;

    setIsLoadingFriends(true);
    try {
      console.log('Loading friends for user:', user.id);
      
      // Load accepted friends - simplified approach
      const { data: friendships, error: friendshipsError } = await supabase
        .from('friendships')
        .select(`
          id,
          user_id,
          friend_id,
          status,
          created_at
        `)
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq('status', 'accepted');

      console.log('Friendships query result:', { friendships, friendshipsError });

      if (friendships && friendships.length > 0) {
        // Get all friend IDs
        const friendIds = friendships.map(f => 
          f.user_id === user.id ? f.friend_id : f.user_id
        );
        
        console.log('Friend IDs:', friendIds);
        
        // Load friend profiles separately
        const { data: friendProfiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, display_name, profile_picture_url')
          .in('id', friendIds);
          
        console.log('Friend profiles:', { friendProfiles, profilesError });
        
        if (friendProfiles) {
          console.log('Setting friends to:', friendProfiles);
          setFriends(friendProfiles);
        } else {
          console.log('No friend profiles found, setting friends to empty array');
          setFriends([]);
        }
      } else {
        setFriends([]);
      }

      // Load pending requests - simplified approach without join
      console.log('Loading friend requests for user:', user.id);
      const { data: requests, error: requestsError } = await supabase
        .from('friendships')
        .select('*')
        .eq('friend_id', user.id)
        .eq('status', 'pending');

      console.log('Friend requests query result:', { requests, requestsError });
      
      // If we have requests, fetch the sender profiles separately
      if (requests && requests.length > 0) {
        const senderIds = requests.map(r => r.user_id);
        const { data: senderProfiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, display_name, profile_picture_url')
          .in('id', senderIds);
          
        console.log('Sender profiles:', { senderProfiles, profilesError });
        
        // Combine the requests with profile data
        const requestsWithProfiles = requests.map(request => ({
          ...request,
          profiles: senderProfiles?.find(p => p.id === request.user_id)
        }));
        
        console.log('Requests with profiles:', requestsWithProfiles);
        setFriendRequests(requestsWithProfiles);
      } else {
        setFriendRequests([]);
      }
      
      // Debug: Also check for any friendships involving this user
      const { data: allFriendships } = await supabase
        .from('friendships')
        .select('*')
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);
        
      console.log('All friendships for current user:', allFriendships);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setIsLoadingFriends(false);
    }
  };

  // Select preset avatar
  const selectPresetAvatar = async (avatarUrl) => {
    if (!currentUser) return;
    
    setUploadingProfilePicture(true);
    try {
      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({ profile_picture_url: avatarUrl })
        .eq('id', currentUser.id);

      if (error) throw error;

      // Update local state
      setUserProfilePicture(avatarUrl);
      setShowAvatarSelector(false);
      addToast('Avatar updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating avatar:', error);
      addToast('Failed to update avatar', 'error');
    } finally {
      setUploadingProfilePicture(false);
    }
  };

  // Upload profile picture
  const uploadProfilePicture = async (file) => {
    if (!currentUser || !file) return;
    
    setUploadingProfilePicture(true);
    
    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        addToast('Please select a valid image file (JPEG, PNG, GIF, or WebP)', 'error');
        return;
      }
      
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        addToast('Image must be smaller than 5MB', 'error');
        return;
      }
      
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
      
      // Convert image to base64 for database storage as fallback
      const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
        });
      };
      
      // Use base64 storage directly (simpler approach)
      let profilePictureUrl;
      
      try {
        profilePictureUrl = await convertToBase64(file);
      } catch (base64Error) {
        console.error('Base64 conversion failed:', base64Error);
        addToast('Error processing image', 'error');
        return;
      }
      
      // Update user profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_picture_url: profilePictureUrl })
        .eq('id', currentUser.id);
      
      if (updateError) {
        console.error('Database update error:', updateError);
        addToast('Error updating profile: ' + updateError.message, 'error');
        return;
      }
      
      // Update local state
      setUserProfilePicture(profilePictureUrl);
      addToast('Profile picture updated successfully!', 'success');
      
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      addToast('Error uploading profile picture', 'error');
    } finally {
      setUploadingProfilePicture(false);
    }
  };

  // Helper function for relative time
  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Post reply to debate
  const postReply = async () => {
    if (!currentUser || !replyingTo || !replyContent.trim() || isPostingReply) return;

    setIsPostingReply(true);

    // Check rate limit
    if (!await checkRateLimit('comment', 10, 5)) {
      addToast('Too many comments! Take a breather.', 'warning');
      setIsPostingReply(false);
      return;
    }

    try {
      const filteredContent = filterContent(replyContent.trim());
      
      const { error } = await supabase
        .from('debate_comments')
        .insert({
          debate_id: replyingTo.id,
          author_id: currentUser.id,
          content: filteredContent
        });

      if (error) throw error;

      // Reload debates to show new reply count
      await loadDebates();
      
      // Refresh comments for this debate if they're expanded
      if (expandedComments[replyingTo.id]) {
        loadDebateComments(replyingTo.id);
      }
      
      setShowReplyModal(false);
      setReplyContent('');
      setReplyingTo(null);
      addToast('Reply posted!', 'success');
    } catch (error) {
      console.error('Error posting reply:', error);
      addToast('Error posting reply', 'error');
    } finally {
      setIsPostingReply(false);
    }
  };

  const loadDebateComments = async (debateId) => {
    try {
      const { data: comments, error } = await supabase
        .from('debate_comments')
        .select(`
          id,
          content,
          created_at,
          author_id,
          profiles!debate_comments_author_id_fkey(username, display_name)
        `)
        .eq('debate_id', debateId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedComments = comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        author: comment.profiles?.username || comment.profiles?.display_name || 'Unknown',
        timestamp: getRelativeTime(comment.created_at),
        isOwn: currentUser && comment.author_id === currentUser.id
      }));

      setDebateComments(prev => ({
        ...prev,
        [debateId]: formattedComments
      }));
      
      // Load likes for all comments
      const commentIds = formattedComments.map(c => c.id);
      if (commentIds.length > 0) {
        await loadLikes('comment', commentIds);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const toggleComments = (debateId) => {
    setExpandedComments(prev => {
      const newState = {
        ...prev,
        [debateId]: !prev[debateId]
      };
      
      // Load comments if expanding and not already loaded
      if (newState[debateId] && !debateComments[debateId]) {
        loadDebateComments(debateId);
      }
      
      return newState;
    });
  };

  // Comment on ranking
  const postRankingComment = async (rankingId, artistPosition, comment) => {
    if (!currentUser || !comment.trim()) return;

    if (!await checkRateLimit('comment', 10, 5)) {
      addToast('Too many comments! Take a breather.', 'warning');
      return;
    }

    try {
      const { error } = await supabase
        .from('ranking_comments')
        .insert({
          ranking_id: rankingId,
          user_id: currentUser.id,
          artist_position: artistPosition,
          content: filterContent(comment.trim())
        });

      if (error) throw error;

      await loadRankingComments(rankingId);
      addToast('Comment posted!', 'success');
    } catch (error) {
      console.error('Error posting comment:', error);
      addToast('Error posting comment', 'error');
    }
  };

  // Update allArtists when DB data loads
  useEffect(() => {
    if (allArtistsFromDB.length > 0) {
      const mappedArtists = allArtistsFromDB.map(artist => ({
        ...artist,
        avatar: artist.avatar_url || '🎤',
        heat: artist.heat_score || 50,
        classics: artist.classics_count || 0,
        region: artist.region || 'unknown',
        era: artist.era || 'unknown'
      }));
      setAllArtists(mappedArtists);
      
      // Filter notable artists with higher threshold
      const notable = mappedArtists.filter(artist => 
        artist.heat_score >= 80 || 
        artist.wikipedia_id || 
        artist.classics_count >= 3
      );
      setNotableArtists(notable);
    }
  }, [allArtistsFromDB]);

  // Extended rankings for top 100
  // Load all users' all-time lists for aggregation
  const loadAllUserLists = useCallback(async () => {
    try {
      console.log('📚 Loading all users\' all-time lists (SIMPLE APPROACH)...');
      
      // Step 1: Get all all-time rankings (simple query)
      console.log('📋 Step 1: Loading all-time rankings...');
      const { data: rankings, error: rankingsError } = await supabase
        .from('rankings')
        .select('*')
        .eq('is_all_time', true);
        
      if (rankingsError) {
        console.error('❌ Error loading rankings:', rankingsError);
        return [];
      }
      
      console.log('✅ Loaded rankings:', rankings?.length || 0, 'total');
      console.log('📋 Rankings:', rankings?.map(r => ({ id: r.id, title: r.list_title, userId: r.user_id })));
      
      if (!rankings || rankings.length === 0) {
        console.log('❌ No all-time rankings found');
        return [];
      }
      
      // Step 2: Get all ranking items for these rankings
      const rankingIds = rankings.map(r => r.id);
      console.log('🎯 Step 2: Loading ranking items for', rankingIds.length, 'rankings...');
      console.log('🔍 Looking for ranking_ids:', rankingIds);
      
      // Debug: Check if ANY ranking_items exist in the database
      const { data: allItems, error: allItemsError } = await supabase
        .from('ranking_items')
        .select('ranking_id, position, artist_id')
        .limit(10);
        
      console.log('🔍 DEBUG: Sample ranking_items in DB:', allItems);
      console.log('🔍 DEBUG: Total ranking_items found:', allItems?.length || 0);
      console.log('🔍 DEBUG: Existing ranking_ids in DB:', [...new Set(allItems?.map(item => item.ranking_id) || [])]);
      console.log('🔍 DEBUG: Do any match our target IDs?', rankingIds.some(id => allItems?.some(item => item.ranking_id === id)));
      
      // Debug: Check specific ranking items for the matching ID
      const matchingId = '1ad8ca09-5331-4d12-bdce-778bab4ab938';
      const { data: debugItems, error: debugError } = await supabase
        .from('ranking_items')
        .select('*')
        .eq('ranking_id', matchingId);
        
      console.log('🔍 DEBUG: Items for matching ranking ID:', matchingId, debugItems);
      console.log('🔍 DEBUG: Artist IDs in these items:', debugItems?.map(item => item.artist_id));
      
      const { data: rankingItems, error: itemsError } = await supabase
        .from('ranking_items')
        .select(`
          *,
          artists(id, name, era, avatar_url, avatar_emoji)
        `)
        .in('ranking_id', rankingIds)
        .order('position');
        
      if (itemsError) {
        console.error('❌ Error loading ranking items:', itemsError);
        console.log('🔍 DEBUG: Join query failed, trying without artists join...');
        
        // Try query without join to see if that's the issue
        const { data: itemsWithoutJoin, error: noJoinError } = await supabase
          .from('ranking_items')
          .select('*')
          .in('ranking_id', rankingIds)
          .order('position');
          
        console.log('🔍 DEBUG: Items without join:', itemsWithoutJoin?.length || 0);
        console.log('🔍 DEBUG: No-join error:', noJoinError);
        
        // Still return rankings even if items fail
      }
      
      console.log('✅ Loaded ranking items:', rankingItems?.length || 0, 'total items');
      console.log('🔍 DEBUG: Join query successful, itemsError:', itemsError);
      
      // If we have 0 items but no error, try without join to compare
      if (!itemsError && (!rankingItems || rankingItems.length === 0)) {
        console.log('🔍 DEBUG: 0 items but no error, trying without join...');
        const { data: itemsWithoutJoin, error: noJoinError } = await supabase
          .from('ranking_items')
          .select('*')
          .in('ranking_id', rankingIds)
          .order('position');
          
        console.log('🔍 DEBUG: Items without join:', itemsWithoutJoin?.length || 0);
        console.log('🔍 DEBUG: Sample item without join:', itemsWithoutJoin?.[0]);
      }
      console.log('🎯 Items breakdown:', rankingIds.map(id => ({
        rankingId: id,
        itemCount: rankingItems?.filter(item => item.ranking_id === id).length || 0
      })));
      
      // Step 3: Combine rankings with their items
      console.log('🔄 Step 3: Combining rankings with items...');
      const combinedLists = rankings.map(ranking => ({
        ...ranking,
        ranking_items: rankingItems?.filter(item => item.ranking_id === ranking.id) || []
      }));
      
      console.log('✅ Combined lists:', combinedLists.length, 'total');
      console.log('📊 Final breakdown:', combinedLists.map(list => ({
        id: list.id,
        title: list.list_title,
        itemCount: list.ranking_items.length
      })));
      
      return combinedLists;
      
    } catch (error) {
      console.error('❌ Error in loadAllUserLists:', error);
      return [];
    }
  }, [supabase]);

  // Calculate Canon Score with Face-off Influence
  const calculateCanonScore = useCallback((appearanceRate, avgPosition, faceOffData = null, totalPoints = 0, maxPoints = 1, rank = 1, totalArtists = 100) => {
    console.log(`🔢 Canon Score Calculation for rank ${rank}:`, {
      appearanceRate,
      avgPosition,
      totalArtists
    });
    
    // Calculate base performance metrics
    const positionScore = Math.max(0, (11 - avgPosition) / 10); // 0-1 scale, higher is better
    const popularityScore = Math.min(1, appearanceRate); // 0-1 scale based on appearance frequency
    
    // Combine base metrics (85% weight from user rankings)
    const baseMetric = Math.max(0, popularityScore * 0.7 + positionScore * 0.3);
    
    console.log(`📊 Base metrics:`, {
      positionScore,
      popularityScore,
      baseMetric
    });
    
    // Face-off influence (15% weight)
    let faceOffBonus = 0;
    if (faceOffData && faceOffData.totalBattles >= 5) {
      const winRate = faceOffData.wins / faceOffData.totalBattles;
      let faceOffScore = winRate;
      
      // Apply multipliers with limits
      if (faceOffData.avgUnderdogMultiplier) {
        faceOffScore *= Math.min(2, faceOffData.avgUnderdogMultiplier);
      }
      if (faceOffData.avgMarginMultiplier) {
        faceOffScore *= Math.min(1.5, faceOffData.avgMarginMultiplier);
      }
      
      // Volume normalization
      const volumeNormalizer = Math.min(1, faceOffData.totalBattles / 20);
      faceOffScore *= volumeNormalizer;
      
      faceOffBonus = Math.min(0.15, faceOffScore * 0.15); // 15% max influence
    }
    
    // Combine base and face-off metrics
    const rawScore = Math.min(1, baseMetric * 0.85 + faceOffBonus);
    
    // Intuitive rank-based distribution with smooth scaling
    let canonScore;
    
    if (rank === 1) {
      // #1 gets 97-100 range
      canonScore = 97 + (rawScore * 3);
    } else if (rank <= 3) {
      // Top 3 get 94-99 range
      canonScore = 94 + (rawScore * 4) + (rank === 2 ? 2 : rank === 3 ? 1 : 0);
    } else if (rank <= 10) {
      // Top 10 get 90-96 range
      const topTenBonus = (11 - rank) / 7; // Bonus for being in top 10
      canonScore = 90 + (rawScore * 4) + (topTenBonus * 2);
    } else if (rank <= 20) {
      // Top 20 get 85-93 range
      const top20Bonus = (21 - rank) / 10;
      canonScore = 85 + (rawScore * 6) + (top20Bonus * 2);
    } else if (rank <= 50) {
      // Top 50 get 77-88 range
      const top50Bonus = (51 - rank) / 30;
      canonScore = 77 + (rawScore * 8) + (top50Bonus * 3);
    } else if (rank <= 100) {
      // Top 100 get 68-80 range
      const top100Bonus = (101 - rank) / 50;
      canonScore = 68 + (rawScore * 8) + (top100Bonus * 4);
    } else {
      // Beyond top 100: scale from 40-70 based on performance and rank
      const performanceBase = 40 + (rawScore * 20);
      const rankPenalty = Math.min(15, (rank - 100) * 0.1); // Gradual penalty for lower ranks
      canonScore = Math.max(20, performanceBase - rankPenalty);
    }
    
    console.log(`🎯 Final Canon Score for rank ${rank}: ${canonScore} -> ${Math.round(Math.min(100, Math.max(20, canonScore)))}`);
    
    // Ensure score stays within bounds and return as integer
    return Math.round(Math.min(100, Math.max(20, canonScore)));
  }, []);

  const generateTop100 = useCallback(async () => {
    console.log('🎯 generateTop100 function called');
    const rankings = [];
    const artistVotes = new Map(); // Track votes per artist
    
    try {
      // Load all users' all-time lists and face-off data in parallel
      console.log('📚 Loading all user lists and face-off stats...');
      const [allUserLists, faceOffStats] = await Promise.all([
        loadAllUserLists(),
        loadFaceOffStats()
      ]);
      
      console.log('📚 Loaded user lists:', allUserLists.length, 'total lists');
      console.log('📚 Sample list structure:', allUserLists[0]);
      
      // Set total voter count (increased by 40 for display)
      setTotalVoters(allUserLists.length + 40);
      
      // Process each user's list with credibility weighting
      console.log('🔄 Processing user lists with credibility weighting...');
      allUserLists.forEach((userList, idx) => {
        console.log(`Processing list ${idx + 1}:`, {
          id: userList.id,
          userId: userList.user_id,
          listTitle: userList.list_title,
          itemsCount: userList.ranking_items?.length || 0,
          hasItems: !!userList.ranking_items?.length
        });
        
        if (userList.ranking_items && userList.ranking_items.length > 0) {
          // Calculate user credibility for weighting
          const userStats = {
            uniqueErasCount: 3, // TODO: Calculate from actual data
            totalArtistsRanked: userList.ranking_items.length,
            commonArtistsCount: Math.floor(userList.ranking_items.length * 0.6), // TODO: Calculate from actual data
            avgListLength: userList.ranking_items.length,
            uniqueGenresCount: 4, // TODO: Calculate from actual data
            faceOffWins: Math.floor(Math.random() * 20), // TODO: Get from actual face-off data
            faceOffTotal: Math.floor(Math.random() * 30) + 10, // TODO: Get from actual face-off data
            avgDebateLikes: Math.random() * 5, // TODO: Get from actual debate data
            totalRankings: 1, // TODO: Get actual count
            joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // TODO: Get actual join date
            avgCompatibilityScore: 60 + Math.random() * 30, // TODO: Calculate from compatibility data
            profileViews: Math.floor(Math.random() * 50) // TODO: Track actual views
          };
          
          const userCredibility = calculateUserCredibility(userStats);
          const userWeight = userCredibility.tier.weight;
          
          console.log(`User ${userList.user_id} credibility: ${userCredibility.tier.name} (${userWeight}x weight)`);
          
          userList.ranking_items.forEach(item => {
            const artist = item.artists;
            if (artist) {
              const artistId = artist.id;
              const position = item.position;
              
              // Weight the vote based on position AND user credibility
              const basePoints = Math.max(1, 11 - position); // Position 1 gets 10 points, position 10 gets 1 point
              const weightedPoints = basePoints * userWeight; // Apply credibility multiplier
              
              if (!artistVotes.has(artistId)) {
                artistVotes.set(artistId, {
                  artist: artist,
                  totalPoints: 0,
                  weightedPoints: 0,
                  voteCount: 0,
                  weightedVoteCount: 0,
                  positions: [],
                  credibilityBreakdown: new Map()
                });
              }
              
              const current = artistVotes.get(artistId);
              current.totalPoints += basePoints; // Keep unweighted for comparison
              current.weightedPoints += weightedPoints; // New weighted total
              current.voteCount += 1;
              current.weightedVoteCount += userWeight;
              current.positions.push(position);
              
              // Track credibility breakdown
              const tierName = userCredibility.tier.name;
              if (!current.credibilityBreakdown.has(tierName)) {
                current.credibilityBreakdown.set(tierName, 0);
              }
              current.credibilityBreakdown.set(tierName, current.credibilityBreakdown.get(tierName) + 1);
            }
          });
        }
      });
      
      console.log('🗺️ Artist votes map size:', artistVotes.size);
      
      // Convert to rankings array and sort by weighted points
      console.log('🏆 Creating final rankings with credibility weighting...');
      const sortedArtists = Array.from(artistVotes.values())
        .sort((a, b) => b.weightedPoints - a.weightedPoints) // Sort by weighted points
        .slice(0, 100); // Top 100
      
      console.log('🏆 Sorted artists count:', sortedArtists.length);
      
      // Create a map of current rankings for underdog calculations
      const currentRankMap = new Map();
      sortedArtists.forEach((item, index) => {
        currentRankMap.set(item.artist.id, index + 1);
      });
      
      // Format as rankings with face-off influence
      sortedArtists.forEach((item, index) => {
        const artistId = item.artist.id;
        const faceOffData = faceOffStats.get(artistId);
        
        // Calculate face-off modifiers if data exists
        let faceOffModifiers = null;
        if (faceOffData && faceOffData.totalBattles >= 5) {
          // Calculate average underdog multiplier based on opponent rankings
          let underdogMultiplier = 1.0;
          let marginMultiplier = 1.0;
          
          // For now, estimate underdog bonus (we'd need detailed battle history for precise calculation)
          // Artists lower in rankings get higher multiplier when they win
          const currentRank = index + 1;
          if (currentRank > 50) {
            underdogMultiplier = 1.5; // 50% bonus for lower-ranked artists
          } else if (currentRank > 25) {
            underdogMultiplier = 1.25; // 25% bonus for mid-ranked artists
          }
          
          // Margin multiplier based on average conviction
          if (faceOffData.totalMargin && faceOffData.wins > 0) {
            const avgMargin = faceOffData.totalMargin / faceOffData.wins;
            marginMultiplier = 0.5 + (avgMargin / 100); // 0.5 to 1.5 range
          }
          
          faceOffModifiers = {
            wins: faceOffData.wins,
            totalBattles: faceOffData.totalBattles,
            avgUnderdogMultiplier: underdogMultiplier,
            avgMarginMultiplier: marginMultiplier
          };
        }
        
        // Calculate final canon score with face-off influence
        const avgPosition = item.positions.reduce((a, b) => a + b, 0) / item.positions.length;
        const appearanceRate = item.voteCount / (allUserLists.length || 1);
        const currentRank = index + 1;
        
        console.log(`🎯 Calculating score for #${currentRank} ${item.artist.name}:`, {
          appearanceRate,
          avgPosition,
          currentRank,
          totalArtists: sortedArtists.length
        });
        
        const canonScore = calculateCanonScore(appearanceRate, avgPosition, faceOffModifiers, item.totalPoints, sortedArtists[0]?.totalPoints || 1, currentRank, sortedArtists.length);
        
        console.log(`✅ ${item.artist.name} gets Canon Score: ${canonScore}`);
        
        rankings.push({
          rank: index + 1,
          artist: item.artist,
          lastWeek: index + 1,
          trend: 'stable',
          votes: item.voteCount,
          totalPoints: item.totalPoints,
          weightedPoints: item.weightedPoints, // Add weighted points to display
          weightedVotes: item.weightedVoteCount, // Add weighted vote count
          credibilityBreakdown: Object.fromEntries(item.credibilityBreakdown), // Convert Map to object for display
          averagePosition: avgPosition,
          canonScore: canonScore,
          faceOffWins: faceOffModifiers?.wins || 0,
          faceOffBattles: faceOffModifiers?.totalBattles || 0
        });
      });
      
      // Add trending logic
      rankings.forEach((item, idx) => {
        if (Math.random() < 0.1) item.trend = 'up';
        else if (Math.random() < 0.05) item.trend = 'down';
        else if (Math.random() < 0.02) item.trend = 'hot';
      });
      
      console.log('✅ Generated Top 100 rankings:', rankings.length, 'total');
      console.log('🎯 Top 10:', rankings.slice(0, 10).map(r => `${r.rank}. ${r.artist.name} (${r.votes} votes, ${r.totalPoints} pts)`));
      return rankings;
    } catch (error) {
      console.error('❌ Error in generateTop100:', error);
      return [];
    }
  }, [loadAllUserLists, loadFaceOffStats, calculateCanonScore]);

  // Force regenerate rankings function (for development)
  const forceRegenerateRankings = useCallback(async () => {
    console.log('🔄 Force regenerating Canon rankings...');
    try {
      const rankings = await generateTop100();
      console.log('📊 Force generated rankings:', rankings?.length || 0, 'items');
      console.log('📊 New scores for top 5:', rankings?.slice(0, 5).map(r => `${r.rank}. ${r.artist.name} (Score: ${r.canonScore})`));
      setFullRankings(rankings || []);
      addToast('Canon rankings updated with new scoring system!', 'success');
    } catch (error) {
      console.error('❌ Error force generating rankings:', error);
      addToast('Error updating rankings', 'error');
    }
  }, [generateTop100, addToast]);

  // Generate rankings when artists are loaded
  useEffect(() => {
    console.log('🔥 Rankings generation effect triggered');
    console.log('allArtists.length:', allArtists.length);
    console.log('generateTop100 function available:', typeof generateTop100);
    
    if (allArtists.length > 0) {
      console.log('✅ Condition met, starting rankings generation...');
      const loadRankings = async () => {
        try {
          console.log('🚀 Starting generateTop100...');
          const rankings = await generateTop100();
          console.log('📊 Generated rankings:', rankings?.length || 0, 'items');
          console.log('📊 First 3 rankings with NEW SCORES:', rankings?.slice(0, 3).map(r => `${r.rank}. ${r.artist.name} (Score: ${r.canonScore})`));
          setFullRankings(rankings || []);
          console.log('✅ Set fullRankings to:', rankings?.length || 0, 'items');
        } catch (error) {
          console.error('❌ Error generating Top 100:', error);
          console.error('Stack trace:', error.stack);
        }
      };
      loadRankings();
    } else {
      console.log('❌ Condition not met: allArtists.length is', allArtists.length);
    }
  }, [allArtists, generateTop100]);

  // Generate face-offs when notable artists are loaded
  useEffect(() => {
    console.log('Face-off generation check:', {
      notableArtistsCount: notableArtists.length,
      showTutorial,
      canDoFaceOff: checkFaceOffLimit()
    });
    if (notableArtists.length >= 2 && !showTutorial && checkFaceOffLimit()) {
      const newFaceOff = generateFaceOff();
      if (newFaceOff) {
        setFaceOffs([newFaceOff]);
        console.log('Face-off generated:', newFaceOff);
      }
    }
  }, [notableArtists, showTutorial, checkFaceOffLimit]);

  // Click outside to close search
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
      if (myTop10SearchRef.current && !myTop10SearchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
      if (!event.target.closest('.tag-search-container')) {
        setShowTagSearch(false);
      }
      if (!event.target.closest('.friend-search-container')) {
        setShowFriendSearch(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        setShowFaceOff(false);
        setShowDebateModal(false);
        setShowReplyModal(false);
        setShowTop100Modal(false);
        setShowSettings(false);
        setShowArtistCard(null);
        setShowCommentModal(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Generate face-offs with better filtering
  const generateFaceOff = useCallback(() => {
    if (notableArtists.length < 2) return null;
    
    // Apply daily challenge filter if active
    let filteredArtists = [...notableArtists];
    
    if (dailyChallenge && dailyChallenge.filter) {
      filteredArtists = filteredArtists.filter(artist => {
        if (dailyChallenge.filter.era) {
          return artist.era.includes(dailyChallenge.filter.era);
        }
        if (dailyChallenge.filter.region) {
          return artist.region === dailyChallenge.filter.region;
        }
        return true;
      });
    }
    
    // Apply user filters
    if (faceOffFilters.era !== 'all') {
      filteredArtists = filteredArtists.filter(a => 
        a.era.toLowerCase().includes(faceOffFilters.era)
      );
    }
    
    if (faceOffFilters.region !== 'all') {
      filteredArtists = filteredArtists.filter(a => 
        a.region === faceOffFilters.region
      );
    }
    
    // Ensure sufficient notoriety (heat_score > 80)
    filteredArtists = filteredArtists.filter(a => a.heat_score > 80);
    
    if (filteredArtists.length < 2) {
      addToast('Not enough artists match your filters', 'info');
      return null;
    }
    
    const isCompetitive = Math.random() > 0.3;
    let artist1, artist2;
    
    if (isCompetitive && filteredArtists.length > 20) {
      const topArtists = filteredArtists.slice(0, 30);
      artist1 = topArtists[Math.floor(Math.random() * topArtists.length)];
      const nearbyArtists = topArtists.filter(a => 
        Math.abs(topArtists.indexOf(a) - topArtists.indexOf(artist1)) <= 15 && 
        a.id !== artist1.id
      );
      artist2 = nearbyArtists[Math.floor(Math.random() * nearbyArtists.length)] || 
                filteredArtists.find(a => a.id !== artist1.id);
    } else {
      const shuffled = [...filteredArtists].sort(() => Math.random() - 0.5);
      artist1 = shuffled[0];
      artist2 = shuffled[1];
    }
    
    if (!artist1 || !artist2) return null;
    
    return { 
      artist1, 
      artist2, 
      creator: "The Canon",
      isDailyChallenge: dailyChallenge ? true : false
    };
  }, [notableArtists, faceOffFilters, dailyChallenge, addToast]);

  // Save ranking to database with validation
  const saveRankingToDatabase = async (ranking) => {
    if (!currentUser) return;
    
    // Validate ranking
    if (!ranking.title || ranking.title.trim().length < 3) {
      addToast('Ranking title too short', 'error');
      return;
    }
    
    // Allow empty custom categories to be saved, but require artists for other types
    if (ranking.artists.length === 0 && !ranking.custom_category_id) {
      addToast('Add some artists to your ranking', 'error');
      return;
    }
    
    setIsSaving(true);
    setSavingStatus('Saving...');
    
    try {
      const rankingData = {
        user_id: currentUser.id,
        list_title: ranking.title.trim(),
        list_type: ranking.category || (ranking.isAllTime ? 'all-time' : 'custom'),
        is_all_time: ranking.isAllTime || false,
        is_collaborative: ranking.isCollaborative || false,
        custom_category_id: ranking.custom_category_id || null,
        updated_at: new Date().toISOString()
      };
      
      if (ranking.id && ranking.id.length === 36 && !ranking.id.startsWith('temp-')) {
        rankingData.id = ranking.id;
      }
      
      const { data: savedRanking, error: rankingError } = await supabase
        .from('rankings')
        .upsert(rankingData)
        .select()
        .single();

      if (rankingError) throw rankingError;

      // Delete existing ranking items
      await supabase
        .from('ranking_items')
        .delete()
        .eq('ranking_id', savedRanking.id);

      // Insert new ranking items
      if (ranking.artists.length > 0) {
        const rankingItems = ranking.artists.map((artist, index) => ({
          ranking_id: savedRanking.id,
          artist_id: artist.id,
          position: index + 1
        }));

        const { error: itemsError } = await supabase
          .from('ranking_items')
          .insert(rankingItems);

        if (itemsError) throw itemsError;
      }
      
      setUserLists(prevLists => 
        prevLists.map(list => 
          (list.id === ranking.id || list.id.startsWith('temp-')) && list.title === ranking.title
            ? { ...list, id: savedRanking.id } 
            : list
        )
      );

      // Reload custom categories if this was a custom category
      // Custom categories will reload automatically via CustomCategorySection

      await awardPoints(10, 'ranking_saved');

      setSavingStatus('Saved!');
      addToast('Ranking saved successfully!', 'success');
      setTimeout(() => setSavingStatus(''), 2000);
    } catch (error) {
      console.error('Error saving ranking:', error);
      setSavingStatus('Error saving');
      addToast('Error saving ranking', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Save face-off vote to database with underdog calculations
  const saveFaceOffVote = async (artist1Id, artist2Id, winnerId, conviction) => {
    if (!currentUser) return;
    
    try {
      // Find current rankings of both artists
      const artist1Rank = fullRankings.findIndex(r => r.artist.id === artist1Id) + 1;
      const artist2Rank = fullRankings.findIndex(r => r.artist.id === artist2Id) + 1;
      
      // Calculate underdog bonus
      let underdogBonus = 1.0;
      const winnerRank = winnerId === artist1Id ? artist1Rank : artist2Rank;
      const loserRank = winnerId === artist1Id ? artist2Rank : artist1Rank;
      
      if (winnerRank > 0 && loserRank > 0 && winnerRank > loserRank) {
        // Winner is the underdog
        const rankGap = winnerRank - loserRank;
        underdogBonus = 1 + Math.min(rankGap / 50, 1.0); // Max 2x bonus
      }
      
      const voteData = {
        user_id: currentUser.id,
        artist1_id: artist1Id,
        artist2_id: artist2Id,
        winner_id: winnerId,
        conviction_level: conviction,
        is_power_vote: conviction > 75,
        is_daily_challenge: faceOffs[currentFaceOff]?.isDailyChallenge || false,
        underdog_bonus: underdogBonus,
        winner_rank: winnerRank || null,
        loser_rank: loserRank || null,
        created_at: new Date().toISOString()
      };
      
      await supabase
        .from('faceoff_votes')
        .insert(voteData);

      // Update battle history
      setBattleHistory(prev => [voteData, ...prev]);

      // Award points with underdog bonus
      const basePoints = conviction > 75 ? 5 : 2;
      const bonusPoints = faceOffs[currentFaceOff]?.isDailyChallenge ? 3 : 0;
      const totalPoints = Math.round((basePoints + bonusPoints) * underdogBonus);
      await awardPoints(totalPoints, 'faceoff_vote');
      
      // Show special message for underdog victories
      if (underdogBonus > 1.5) {
        addToast(`🎯 Underdog victory! +${totalPoints} points!`, 'success');
      }
      
      // Check for badges
      if (battleHistory.length >= 100) {
        await awardBadge('voter');
      }
    } catch (error) {
      console.error('Error saving vote:', error);
      addToast('Error saving vote', 'error');
    }
  };

  // Award points and check achievements
  const awardPoints = async (points, action) => {
    if (!currentUser) return;
    
    const newTotal = userPoints + points;
    setUserPoints(newTotal);
    
    await supabase
      .from('profiles')
      .update({ total_points: newTotal })
      .eq('id', currentUser.id);
    
    checkAchievements(action, newTotal);
  };

  // Award badge
  const awardBadge = async (badgeType) => {
    if (!userBadges.includes(badgeType)) {
      setUserBadges(prev => [...prev, badgeType]);
      addToast(`🎉 You earned the ${badgeDefinitions[badgeType].name} badge!`, 'success');
      
      // Save to database
      await supabase
        .from('user_badges')
        .insert({
          user_id: currentUser.id,
          badge_type: badgeType
        });
    }
  };

  const checkAchievements = (action, totalPoints) => {
    const newAchievements = [...userAchievements];
    
    if (action === 'account_created' && !userAchievements.includes('first_timer')) {
      newAchievements.push('first_timer');
    }
    
    if (dailyFaceOffsCompleted >= 10 && !userAchievements.includes('voter')) {
      newAchievements.push('voter');
      awardBadge('voter');
    }
    
    if (action === 'ranking_saved' && !userAchievements.includes('curator')) {
      const allTimeLists = userLists.filter(l => l.isAllTime);
      if (allTimeLists.length > 0 && allTimeLists[0].artists.length >= 10) {
        newAchievements.push('curator');
        awardBadge('curator');
      }
    }
    
    if (totalPoints > 1000 && !userBadges.includes('veteran')) {
      awardBadge('veteran');
    }
    
    setUserAchievements(newAchievements);
  };

  // Create new debate with validation
  const createDebate = async () => {
    if (!currentUser) {
      addToast('Please log in to create a debate', 'warning');
      return;
    }
    
    if (!debateTitle.trim() || debateTitle.trim().length < 5) {
      addToast('Title too short (min 5 characters)', 'error');
      return;
    }
    
    if (!debateContent.trim() || debateContent.trim().length < 20) {
      addToast('Content too short (min 20 characters)', 'error');
      return;
    }
    
    setIsPostingDebate(true);
    
    if (!await checkRateLimit('debate', 5, 60)) {
      addToast('Too many debates! Wait a bit.', 'warning');
      setIsPostingDebate(false);
      return;
    }
    
    try {
      const filteredTitle = filterContent(debateTitle.trim());
      const filteredContent = filterContent(debateContent.trim());
      
      const { data, error } = await supabase
        .from('debates')
        .insert({
          author_id: currentUser.id,
          title: filteredTitle,
          content: filteredContent,
          artist_tags: selectedArtistTags.map(artist => artist.id),
          mentioned_users: mentionedFriends,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Create notifications for mentioned users
      if (mentionedFriends.length > 0) {
        await Promise.all(
          mentionedFriends.map(friendId => 
            createMentionNotification(friendId, currentUser.id, data.id, filteredTitle)
          )
        );
      }
      
      await loadDebates();
      
      setShowDebateModal(false);
      setDebateTitle('');
      setDebateContent('');
      setSelectedArtistTags([]);
      setMentionedFriends([]);
      setShowMentionDropdown(false);
      
      addToast('Debate posted! 🔥', 'success');
      
      // Check for debater badge
      const userDebates = realDebates.filter(d => d.isOwn);
      if (userDebates.length >= 10) {
        awardBadge('debater');
      }
      
    } catch (error) {
      console.error('Error creating debate:', error);
      addToast('Error creating debate', 'error');
    } finally {
      setIsPostingDebate(false);
    }
  };

  // Create collaborative list
  const createCollaborativeList = async (listId) => {
    if (!currentUser) return;
    
    try {
      const { data: collab } = await supabase
        .from('collaborative_lists')
        .insert({
          ranking_id: listId,
          created_by: currentUser.id,
          is_active: true
        })
        .select()
        .single();
      
      // Generate shareable link
      const shareLink = `${window.location.origin}/collab/${collab.id}`;
      
      await navigator.clipboard.writeText(shareLink);
      addToast('Collaborative link copied! Share with friends.', 'success');
      
      // Update local state
      setUserLists(prev => prev.map(list => 
        list.id === listId 
          ? { ...list, isCollaborative: true, shareLink } 
          : list
      ));
    } catch (error) {
      console.error('Error creating collaborative list:', error);
      addToast('Error creating collaborative list', 'error');
    }
  };

  // Send friend request
  // Debug function to clean up friendships (for development)
  const debugCleanupFriendships = async () => {
    if (!currentUser) return;
    
    try {
      console.log('Cleaning up all friendships for current user...');
      
      const { data: deleted, error } = await supabase
        .from('friendships')
        .delete()
        .or(`user_id.eq.${currentUser.id},friend_id.eq.${currentUser.id}`)
        .select();
        
      console.log('Deleted friendships:', deleted);
      
      if (error) {
        console.error('Error cleaning up friendships:', error);
        addToast(`Cleanup error: ${error.message}`, 'error');
      } else {
        addToast(`Cleaned up ${deleted?.length || 0} friendship records`, 'success');
        loadFriends(); // Reload to update UI
      }
    } catch (error) {
      console.error('Error in cleanup:', error);
      addToast('Error during cleanup', 'error');
    }
  };

  const sendFriendRequest = async (friendId) => {
    if (!currentUser) return;

    // Prevent sending friend request to self
    if (currentUser.id === friendId) {
      addToast('You cannot send a friend request to yourself', 'error');
      return;
    }

    try {
      console.log('Sending friend request:', { from: currentUser.id, to: friendId });
      
      // Check if friendship already exists (in any direction)
      const { data: existingFriendship } = await supabase
        .from('friendships')
        .select('id, status, user_id, friend_id')
        .or(`and(user_id.eq.${currentUser.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${currentUser.id})`);
        
      console.log('Existing friendship check:', existingFriendship);
      
      if (existingFriendship && existingFriendship.length > 0) {
        const friendship = existingFriendship[0];
        console.log('Found existing friendship:', {
          id: friendship.id,
          status: friendship.status,
          user_id: friendship.user_id,
          friend_id: friendship.friend_id,
          created_at: friendship.created_at
        });
        
        if (friendship.status === 'pending') {
          // Check if it's a request FROM them TO us
          if (friendship.user_id === friendId && friendship.friend_id === currentUser.id) {
            console.log('They already sent YOU a friend request!');
            addToast('This person already sent you a friend request! Check your pending requests.', 'info');
            // Reload friends to make sure UI is updated
            loadFriends();
            return;
          } else {
            // It's a request FROM us TO them
            addToast('Friend request already sent', 'info');
            return;
          }
        } else if (friendship.status === 'accepted') {
          addToast('You are already friends', 'info');
          return;
        } else {
          console.log('Unexpected friendship status:', friendship.status);
          console.log('Attempting to delete corrupted friendship record...');
          
          // Delete the corrupted friendship record
          const { error: deleteError } = await supabase
            .from('friendships')
            .delete()
            .eq('id', friendship.id);
          
          if (deleteError) {
            console.error('Error deleting corrupted friendship:', deleteError);
            addToast(`Error cleaning up friendship: ${deleteError.message}`, 'error');
            return;
          }
          
          console.log('Deleted corrupted friendship, proceeding with new request...');
        }
      }
      
      const { data, error } = await supabase
        .from('friendships')
        .insert({
          user_id: currentUser.id,
          friend_id: friendId,
          status: 'pending'
        })
        .select();

      console.log('Friend request insert result:', { data, error });

      if (error) {
        console.error('Database error details:', error);
        if (error.code === '23505') {
          addToast('Friend request already sent', 'info');
        } else {
          addToast(`Database error: ${error.message}`, 'error');
        }
      } else {
        addToast('Friend request sent!', 'success');
        // TODO: Send email notification to the requested friend - requires Supabase Edge Functions + email service
        // Manually trigger reload
        loadFriends();
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      addToast('Error sending friend request', 'error');
    }
  };

  // Accept friend request
  const acceptFriendRequest = async (requestId) => {
    try {
      console.log('Accepting friend request:', requestId);
      
      const { data, error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', requestId)
        .select();

      console.log('Accept friend request result:', { data, error });

      if (error) throw error;
      
      console.log('Friend request accepted successfully, reloading friends...');
      // Reload friends to see the new friendship
      await loadFriends();
      console.log('Friends reloaded after acceptance');
      addToast('Friend request accepted!', 'success');
    } catch (error) {
      console.error('Error accepting friend request:', error);
      addToast('Error accepting request', 'error');
    }
  };

  // Decline friend request
  const declineFriendRequest = async (requestId) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', requestId);

      if (error) throw error;
      
      loadFriends();
      addToast('Friend request declined', 'success');
    } catch (error) {
      console.error('Error declining friend request:', error);
      addToast('Error declining request', 'error');
    }
  };

  // Load user stats for profile display
  const loadUserStats = async (userId) => {
    try {
      console.log('Loading stats for user:', userId);
      
      // First get user's debates and comments to count likes
      const [debatesResult, commentsResult, friendsResult] = await Promise.all([
        // Count debates started
        supabase
          .from('debates')
          .select('id', { count: 'exact' })
          .eq('author_id', userId),
        
        // Count comments made  
        supabase
          .from('debate_comments')
          .select('id', { count: 'exact' })
          .eq('author_id', userId),
        
        // Count friends
        supabase
          .from('friendships')
          .select('id', { count: 'exact' })
          .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
          .eq('status', 'accepted')
      ]);

      // Get debate IDs to count likes
      const userDebates = await supabase
        .from('debates')
        .select('id')
        .eq('author_id', userId);

      // Count likes on user's debates
      let likesCount = 0;
      if (userDebates.data && userDebates.data.length > 0) {
        const debateIds = userDebates.data.map(d => d.id);
        const likesResult = await supabase
          .from('debate_likes')
          .select('id', { count: 'exact' })
          .in('debate_id', debateIds);
        likesCount = likesResult.count || 0;
      }

      console.log('Stats query results:', { 
        debates: debatesResult, 
        comments: commentsResult, 
        likes: likesCount, 
        friends: friendsResult 
      });

      // Calculate achievements based on stats
      const achievements = [];
      const debatesCount = debatesResult.count || 0;
      const commentsCount = commentsResult.count || 0;
      const friendsCount = friendsResult.count || 0;

      // Achievement logic
      if (debatesCount >= 1) achievements.push('First Debate');
      if (debatesCount >= 5) achievements.push('Debate Starter');
      if (debatesCount >= 10) achievements.push('Debate Master');
      if (commentsCount >= 10) achievements.push('Engaged');
      if (commentsCount >= 50) achievements.push('Conversationalist');
      if (friendsCount >= 5) achievements.push('Social Butterfly');
      if (friendsCount >= 10) achievements.push('Network Builder');
      if (likesCount >= 10) achievements.push('Crowd Pleaser');
      if (likesCount >= 50) achievements.push('Influencer');

      const stats = {
        debates_started: debatesCount,
        comments_made: commentsCount,
        likes_received: likesCount,
        friend_count: friendsCount
      };

      return { stats, achievements };
    } catch (error) {
      console.error('Error loading user stats:', error);
      return { stats: {}, achievements: [] };
    }
  };

  // Toggle list expansion
  const toggleListExpansion = (listId) => {
    setExpandedLists(prev => {
      const newSet = new Set(prev);
      if (newSet.has(listId)) {
        newSet.delete(listId);
      } else {
        newSet.add(listId);
      }
      return newSet;
    });
  };

  // Submit artist request
  const submitArtistRequest = async () => {
    if (!currentUser || !requestedArtistName.trim()) return;

    try {
      const { error } = await supabase
        .from('artist_requests')
        .insert({
          user_id: currentUser.id,
          artist_name: requestedArtistName.trim(),
          genre: requestedArtistGenre,
          era: requestedArtistEra,
          notes: requestNotes.trim(),
          status: 'pending'
        });

      if (error) throw error;

      addToast(`Request to add "${requestedArtistName}" submitted!`, 'success');
      setShowArtistRequestModal(false);
      setRequestedArtistName('');
      setRequestedArtistGenre('Hip-Hop');
      setRequestedArtistEra('2020s');
      setRequestNotes('');
    } catch (error) {
      console.error('Error submitting artist request:', error);
      addToast('Error submitting request', 'error');
    }
  };

  // Handle username click to show user profile
  const handleUsernameClick = async (userProfile) => {
    try {
      // Load user stats
      const { stats, achievements } = await loadUserStats(userProfile.id);
      
      // Check if user is Canon OG (joined before a certain date)
      const joinDate = new Date(userProfile.created_at);
      const ogCutoffDate = new Date('2025-09-01'); // Users who join before September 2025 are Canon OGs
      const isCanonOG = joinDate < ogCutoffDate;
      
      // Calculate days since joining
      const daysSinceJoining = Math.floor((new Date() - joinDate) / (1000 * 60 * 60 * 24));
      
      // Get canon points if this is the current user
      let canonPoints = 0;
      if (userProfile.id === currentUser?.id) {
        canonPoints = userPoints || 0;
      }
      
      // Set the viewing friend with enhanced data
      setViewingFriend({
        ...userProfile,
        stats,
        achievements,
        is_canon_og: isCanonOG,
        days_since_joining: daysSinceJoining,
        canon_points: canonPoints
      });
      
      // Load their rankings
      await loadFriendRankings(userProfile.id);
    } catch (error) {
      console.error('Error loading user profile:', error);
      addToast('Error loading user profile', 'error');
    }
  };

  // Handle @ mentions in debate content
  const handleDebateContentChange = (e) => {
    const text = e.target.value;
    setDebateContent(text);
    
    // Check for @ mention
    const cursorPos = e.target.selectionStart;
    const lastAtSymbol = text.lastIndexOf('@', cursorPos);
    
    if (lastAtSymbol !== -1 && cursorPos - lastAtSymbol <= 20) {
      const afterAt = text.substring(lastAtSymbol + 1, cursorPos);
      const hasSpace = afterAt.includes(' ');
      
      if (!hasSpace && afterAt.length > 0) {
        setMentionSearchQuery(afterAt);
        setShowMentionDropdown(true);
        setMentionCursorPosition(lastAtSymbol);
      } else {
        setShowMentionDropdown(false);
      }
    } else {
      setShowMentionDropdown(false);
    }
  };

  // Insert friend mention
  const insertMention = (friend) => {
    if (mentionCursorPosition !== null) {
      const beforeMention = debateContent.substring(0, mentionCursorPosition);
      const afterCursor = debateContent.substring(mentionCursorPosition + mentionSearchQuery.length + 1);
      const newContent = `${beforeMention}@${friend.username} ${afterCursor}`;
      
      setDebateContent(newContent);
      setMentionedFriends(prev => [...new Set([...prev, friend.id])]);
      setShowMentionDropdown(false);
      setMentionSearchQuery('');
    }
  };

  // Render debate content with clickable mentions
  const renderDebateContent = (content, mentionedUserIds = []) => {
    // Find @ mentions in the content
    const mentionRegex = /@(\w+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = mentionRegex.exec(content)) !== null) {
      // Add text before mention
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }
      
      // Find friend by username
      const username = match[1];
      const friend = friends.find(f => f.username === username);
      
      if (friend) {
        // Add clickable mention
        parts.push(
          <button
            key={match.index}
            onClick={() => handleUsernameClick(friend)}
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            @{username}
          </button>
        );
      } else {
        // Just show as regular text if not a friend
        parts.push(`@${username}`);
      }
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : content;
  };

  // Load user notifications
  const loadNotifications = async () => {
    if (!currentUser) return;
    
    try {
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select(`
          *,
          from_user:profiles!notifications_from_user_id_fkey (
            id,
            username,
            display_name,
            profile_picture_url
          )
        `)
        .eq('to_user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) {
        console.error('Error loading notifications:', error);
        return;
      }
      
      setNotifications(notifications || []);
      setUnreadNotifications(notifications?.filter(n => !n.read).length || 0);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  // Load comments for rankings
  const loadRankingComments = async (rankingIds) => {
    if (!rankingIds || rankingIds.length === 0) return;
    
    try {
      const { data: comments, error } = await supabase
        .from('ranking_comments')
        .select('*, profiles:user_id(username, display_name, profile_picture_url)')
        .in('ranking_id', rankingIds)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error loading comments:', error);
        return;
      }
      
      // Group comments by ranking_id
      const commentsByRanking = {};
      comments?.forEach(comment => {
        if (!commentsByRanking[comment.ranking_id]) {
          commentsByRanking[comment.ranking_id] = [];
        }
        commentsByRanking[comment.ranking_id].push(comment);
      });
      
      setListComments(commentsByRanking);
      
      // Load likes for all comments
      const commentIds = comments?.map(c => c.id) || [];
      if (commentIds.length > 0) {
        await loadLikes('comment', commentIds);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  // Load likes for debates and comments
  const loadLikes = async (type, itemIds) => {
    if (!itemIds || itemIds.length === 0 || !currentUser) return;
    
    try {
      const { data: likes, error } = await supabase
        .from('likes')
        .select('*')
        .eq('item_type', type)
        .in('item_id', itemIds);
      
      if (error) {
        console.error('Error loading likes:', error);
        return;
      }
      
      // Group likes by item_id and check if current user liked
      const likesByItem = {};
      likes?.forEach(like => {
        if (!likesByItem[like.item_id]) {
          likesByItem[like.item_id] = {
            count: 0,
            userLiked: false
          };
        }
        likesByItem[like.item_id].count++;
        if (like.user_id === currentUser.id) {
          likesByItem[like.item_id].userLiked = true;
        }
      });
      
      if (type === 'debate') {
        setDebateLikes(likesByItem);
      } else if (type === 'comment') {
        setCommentLikes(likesByItem);
      }
    } catch (error) {
      console.error('Error loading likes:', error);
    }
  };

  // Toggle like for an item
  const toggleLike = async (itemType, itemId) => {
    if (!currentUser) {
      addToast('Please log in to like', 'warning');
      return;
    }
    
    try {
      const isDebate = itemType === 'debate';
      const currentLikes = isDebate ? debateLikes : commentLikes;
      const setLikes = isDebate ? setDebateLikes : setCommentLikes;
      
      const itemLikes = currentLikes[itemId] || { count: 0, userLiked: false };
      
      if (itemLikes.userLiked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('item_type', itemType)
          .eq('item_id', itemId);
        
        if (error) throw error;
        
        // Update local state
        setLikes(prev => ({
          ...prev,
          [itemId]: {
            count: Math.max(0, itemLikes.count - 1),
            userLiked: false
          }
        }));
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({
            user_id: currentUser.id,
            item_type: itemType,
            item_id: itemId
          });
        
        if (error) throw error;
        
        // Update local state
        setLikes(prev => ({
          ...prev,
          [itemId]: {
            count: itemLikes.count + 1,
            userLiked: true
          }
        }));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      addToast('Failed to update like', 'error');
    }
  };

  // Create notification for user mention
  // TODO: Add email notifications here - requires Supabase Edge Functions + email service (Resend/SendGrid)
  const createMentionNotification = async (toUserId, fromUserId, debateId, debateTitle) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          to_user_id: toUserId,
          from_user_id: fromUserId,
          type: 'mention',
          content: `mentioned you in "${debateTitle}"`,
          reference_id: debateId,
          read: false,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error creating notification:', error);
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  // Create notification for challenge
  const createChallengeNotification = async (challengedId, challengerId, challengeType, message) => {
    try {
      // Create in-app notification
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          to_user_id: challengedId,
          from_user_id: challengerId,
          type: 'challenge',
          content: `challenged you to a ${challengeType === 'random' ? 'random' : 'custom'} battle${message ? `: "${message}"` : ''}`,
          read: false,
          created_at: new Date().toISOString()
        });
      
      if (notifError) {
        console.error('Error creating notification:', notifError);
      }

      // Send email notification if user has it enabled
      try {
        // First check if user has email notifications enabled for challenges
        const { data: emailSettings } = await supabase
          .from('email_subscriptions')
          .select('friend_challenges')
          .eq('user_id', challengedId)
          .single();
        
        if (emailSettings?.friend_challenges) {
          // Get challenger's profile info
          const { data: challengerProfile } = await supabase
            .from('profiles')
            .select('username, display_name')
            .eq('id', challengerId)
            .single();
          
          if (challengerProfile) {
            // Trigger email notification via Edge Function
            // The Edge Function will handle getting the user's email securely
            const { error: emailError } = await supabase.functions.invoke('send-challenge-email', {
              body: {
                challengedUserId: challengedId,
                challengerName: challengerProfile.username || challengerProfile.display_name,
                challengeType: challengeType,
                message: message,
                appUrl: window.location.origin
              }
            });
            
            if (emailError) {
              console.error('Error sending challenge email:', emailError);
            }
          }
        }
      } catch (emailError) {
        // Don't throw - email is secondary to the challenge being created
        console.error('Error with email notification:', emailError);
      }
    } catch (error) {
      console.error('Error creating challenge notification:', error);
    }
  };

  // Mark notifications as read
  const markNotificationsAsRead = async (notificationIds) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', notificationIds);
      
      if (error) {
        console.error('Error marking notifications as read:', error);
        return;
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          notificationIds.includes(n.id) ? { ...n, read: true } : n
        )
      );
      setUnreadNotifications(prev => Math.max(0, prev - notificationIds.length));
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  // Load friend's rankings
  const loadFriendRankings = async (friendId) => {
    try {
      console.log('Loading rankings for friend:', friendId);
      
      // Load both rankings and user_lists
      const [rankingsResult, userListsResult] = await Promise.all([
        supabase
          .from('rankings')
          .select(`
            *,
            ranking_items (
              position,
              artist_id,
              artists (*)
            )
          `)
          .eq('user_id', friendId)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('user_lists')
          .select('*')
          .eq('user_id', friendId)
          .order('created_at', { ascending: false })
      ]);

      console.log('Friend rankings query result:', { rankings: rankingsResult.data, error: rankingsResult.error });
      console.log('Friend user_lists query result:', { userLists: userListsResult.data, error: userListsResult.error });

      if (rankingsResult.error) {
        console.error('Database error loading friend rankings:', rankingsResult.error);
        addToast(`Database error: ${rankingsResult.error.message}`, 'error');
        return;
      }

      const rankings = rankingsResult.data || [];
      const userLists = userListsResult.data || [];

      // Format rankings from the rankings table
      const formattedRankings = rankings.map(ranking => ({
        id: ranking.id,
        title: ranking.list_title,
        category: ranking.list_type,
        isAllTime: ranking.is_all_time,
        artists: ranking.ranking_items
          .sort((a, b) => a.position - b.position)
          .map(item => ({
            id: item.artists.id,
            name: item.artists.name,
            imageUrl: item.artists.image_url,
            avatar_url: item.artists.avatar_url,
            avatar_emoji: item.artists.avatar_emoji
          }))
      }));

      // Format user lists from the user_lists table
      const formattedUserLists = userLists.map(list => ({
        id: `user_list_${list.id}`,
        title: list.list_title || 'Custom List',
        category: 'custom',
        isAllTime: list.is_all_time || false,
        artists: (list.list_data || []).map(artist => ({
          id: artist.id,
          name: artist.name,
          imageUrl: artist.imageUrl,
          avatar_url: artist.avatar_url,
          avatar_emoji: artist.avatar_emoji || '🎤'
        }))
      }));

      // Combine both types of lists
      const allLists = [...formattedRankings, ...formattedUserLists];

      console.log('All formatted friend lists:', allLists);
      setFriendRankings(allLists);
      
      // Load comments for all rankings
      const rankingIds = allLists.map(list => list.id);
      await loadRankingComments(rankingIds);
      
      if (allLists.length === 0) {
        addToast('This friend hasn\'t created any rankings yet', 'info');
      }
    } catch (error) {
      console.error('Error loading friend rankings:', error);
      addToast(`Error loading friend rankings: ${error.message}`, 'error');
    }
  };

  // Social action handlers for new components
  const handleSocialChallenge = useCallback((challengeData) => {
    if (challengeData.type === 'artist_battle') {
      // Set up artist battle
      setBattleArtist1(challengeData.artist.name);
      setBattleArtist2('');
      setSelectedFriend(challengeData.opponent?.id || '');
      setBattleMessage(challengeData.message || '');
      setBattleType('custom');
      setShowBattleModal(true);
    } else if (challengeData.type === 'list_challenge') {
      // Challenge friend to create their own version of a list
      addToast(`Challenge sent to create "${challengeData.list.title}"!`, 'success');
      // In real implementation, would create a notification/challenge entry
    }
  }, []);

  const handleSocialMessage = useCallback((messageData) => {
    // Quick message functionality
    if (messageData.content) {
      addToast(`Quick message sent: "${messageData.content}"`, 'success');
      // In real implementation, would create a direct message or comment
    } else {
      // Open full message composer
      setShowCommentModal(true);
      setCommentingOnList(messageData.recipient);
    }
  }, []);

  const handleSocialShare = useCallback((shareText) => {
    addToast('Link copied to clipboard!', 'success');
    // In real implementation, would track share analytics
  }, []);

  const handleSocialLike = useCallback((likeData) => {
    // Handle likes on lists/artists
    const action = likeData.action === 'like' ? 'liked' : 'unliked';
    addToast(`You ${action} this content!`, 'success');
    // In real implementation, would update like counts in database
  }, []);

  const handleGroupChallengeJoin = useCallback((challenge) => {
    // Handle joining group challenges
    addToast(`Joined challenge: "${challenge.title}"!`, 'success');
    // In real implementation, would add user to challenge participants
  }, []);

  const handleGroupChallengeCreate = useCallback((challenge) => {
    // Handle creating new group challenges
    addToast(`Created challenge: "${challenge.title}"!`, 'success');
    // In real implementation, would save challenge to database
  }, []);

  const handleGroupChallengeStart = useCallback((challenge, action) => {
    if (action === 'view_submission') {
      addToast(`Viewing your submission for "${challenge.title}"`, 'info');
      // In real implementation, would show submission details
      return;
    }

    // Navigate to appropriate interface based on challenge type
    switch (challenge.type) {
      case 'ranking':
        // Open the list creation interface
        addToast(`Starting ranking challenge: "${challenge.title}"`, 'success');
        // Navigate to "My Top 10" tab to create a new list
        setActiveTab('mytop10');
        // Could also trigger a specific challenge mode
        break;
        
      case 'discovery':
        // Open search interface with discovery criteria
        addToast(`Starting discovery hunt: "${challenge.title}"`, 'success');
        // Switch to search tab and set search context
        setActiveTab('foryou'); // Or dedicated discovery tab
        // Could pre-fill search criteria based on challenge.theme
        break;
        
      case 'debate':
        // Open debate creation modal
        addToast(`Starting debate: "${challenge.title}"`, 'success');
        setShowDebateModal(true);
        setDebateTitle(challenge.title);
        setDebateContent(`Challenge: ${challenge.theme}\n\nMy position: `);
        break;
        
      case 'collaboration':
        // Start collaborative list
        addToast(`Starting collaboration: "${challenge.title}"`, 'success');
        setActiveTab('mytop10');
        // Could trigger collaborative mode
        break;
        
      default:
        addToast(`Starting challenge: "${challenge.title}"`, 'success');
        break;
    }
  }, [addToast, setActiveTab, setShowDebateModal, setDebateTitle, setDebateContent]);

  const handleArtistCompare = useCallback((artist) => {
    // Show artist comparison with friends
    setShowArtistCard(artist);
  }, []);

  const handleUserClick = useCallback((userId) => {
    // Navigate to user profile or show compatibility
    const friend = friends.find(f => f.id === userId);
    if (friend) {
      setViewingFriend(friend);
      addToast(`Viewing ${friend.username}'s profile`, 'info');
    }
  }, [friends]);

  // Search for friends
  const searchFriends = async (query) => {
    if (!query || query.length < 2) {
      setFriendSearchResults([]);
      return;
    }

    setIsLoadingSearch(true);
    try {
      const { data: users, error } = await supabase
        .from('profiles')
        .select('id, username, display_name')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;

      // Filter out current user and existing friends
      const filteredUsers = users.filter(user => 
        user.id !== currentUser?.id && 
        !(friends && friends.some(friend => friend.id === user.id))
      );

      setFriendSearchResults(filteredUsers);
    } catch (error) {
      console.error('Error searching users:', error);
      addToast('Error searching users', 'error');
    } finally {
      setIsLoadingSearch(false);
    }
  };

  // Helper function to show login modal for unauthenticated users
  const requireAuth = (action) => {
    if (!currentUser) {
      setShowLoginModal(true);
      return false;
    }
    return true;
  };

  // Artist aliases and nicknames mapping
  const artistAliases = useMemo(() => ({
    // Notorious B.I.G.
    'the notorious b.i.g.': ['biggie', 'biggie smalls', 'big', 'big poppa', 'christopher wallace', 'frank white'],
    // 2Pac
    '2pac': ['tupac', 'pac', 'makaveli', 'tupac shakur', '2 pac'],
    // Jay-Z
    'jay-z': ['hov', 'hova', 'jigga', 'shawn carter', 'jay z', 'jayz'],
    // Eminem
    'eminem': ['slim shady', 'marshall mathers', 'em', 'marshall'],
    // Snoop Dogg
    'snoop dogg': ['snoop', 'snoop doggy dogg', 'uncle snoop', 'snoop lion', 'calvin broadus'],
    // Dr. Dre
    'dr. dre': ['dre', 'andre young', 'dr dre'],
    // Ice Cube
    'ice cube': ['cube', 'oshea jackson'],
    // Lil Wayne
    'lil wayne': ['weezy', 'weezy f baby', 'tunechi', 'wayne', 'dwayne carter'],
    // Kanye West
    'kanye west': ['ye', 'yeezy', 'kanye', 'yeezus'],
    // Drake
    'drake': ['drizzy', 'champagne papi', 'aubrey', 'aubrey graham', '6 god'],
    // Nas
    'nas': ['nasir', 'nasir jones', 'nastradamus', 'escobar'],
    // The Game
    'the game': ['game', 'chuck taylor', 'jayceon taylor'],
    // 50 Cent
    '50 cent': ['50', 'fifty', 'fifty cent', 'curtis jackson', 'fif'],
    // Method Man
    'method man': ['meth', 'johnny blaze', 'mef', 'clifford smith'],
    // Redman
    'redman': ['red', 'reggie noble', 'funk doctor spock'],
    // Ghostface Killah
    'ghostface killah': ['ghostface', 'ghost', 'tony starks', 'ironman', 'pretty toney', 'dennis coles'],
    // Raekwon
    'raekwon': ['rae', 'the chef', 'lex diamonds', 'corey woods'],
    // GZA
    'gza': ['the genius', 'gary grice'],
    // RZA
    'rza': ['bobby digital', 'robert diggs', 'the abbot'],
    // Ol\' Dirty Bastard
    'ol\' dirty bastard': ['odb', 'big baby jesus', 'dirt mcgirt', 'russell jones'],
    // MF DOOM
    'mf doom': ['doom', 'metal face', 'viktor vaughn', 'king geedorah', 'daniel dumile'],
    // A Tribe Called Quest
    'a tribe called quest': ['tribe', 'atcq', 'tribe called quest'],
    // OutKast
    'outkast': ['kast', 'andre and big boi'],
    // Black Thought
    'black thought': ['tariq', 'tariq trotter'],
    // Mos Def
    'mos def': ['yasiin', 'yasiin bey', 'dante smith'],
    // Common
    'common': ['com', 'common sense', 'lonnie lynn'],
    // Q-Tip
    'q-tip': ['tip', 'kamaal', 'jonathan davis', 'the abstract'],
    // Busta Rhymes
    'busta rhymes': ['busta', 'trevor smith', 'trevor tahiem smith'],
    // Missy Elliott
    'missy elliott': ['missy', 'misdemeanor', 'melissa elliott'],
    // Lauryn Hill
    'lauryn hill': ['l boogie', 'ms hill', 'lauryn'],
    // André 3000
    'andré 3000': ['andre 3000', '3 stacks', 'three stacks', '3k', 'andre benjamin'],
    // Big Boi
    'big boi': ['daddy fat sacks', 'antwan patton'],
    // Pusha T
    'pusha t': ['push', 'king push', 'terrence thornton'],
    // Rick Ross
    'rick ross': ['ross', 'rozay', 'the boss', 'william roberts'],
    // Lil Baby
    'lil baby': ['baby', 'dominique jones'],
    // Young Thug
    'young thug': ['thugger', 'thug', 'sex', 'jeffery', 'jeffrey williams'],
    // Future
    'future': ['future hendrix', 'pluto', 'nayvadius wilburn'],
    // Tyler, The Creator
    'tyler, the creator': ['tyler', 'wolf haley', 'tyler okonma'],
    // Earl Sweatshirt
    'earl sweatshirt': ['earl', 'thebe kgositsile', 'sly tendencies'],
    // Action Bronson
    'action bronson': ['bronson', 'bronsolino', 'bam bam', 'ariyan arslani'],
    // Danny Brown
    'danny brown': ['danny', 'daniel sewell'],
    // Childish Gambino
    'childish gambino': ['gambino', 'donald glover', 'bino'],
    // Chance the Rapper
    'chance the rapper': ['chance', 'chano', 'chancellor bennett'],
    // Mac Miller
    'mac miller': ['mac', 'malcolm mccormick', 'larry fisherman'],
    // Kendrick Lamar
    'kendrick lamar': ['kendrick', 'k dot', 'kdot', 'kung fu kenny', 'cornrow kenny'],
    // J. Cole
    'j. cole': ['cole', 'jermaine', 'jermaine cole', 'cole world'],
    // Logic
    'logic': ['bobby', 'bobby tarantino', 'young sinatra', 'bobby hall'],
    // Travis Scott
    'travis scott': ['travis', 'la flame', 'cactus jack', 'jacques webster'],
    // A$AP Rocky
    'a$ap rocky': ['asap rocky', 'rocky', 'pretty flacko', 'lord flacko', 'rakim mayers'],
    // ScHoolboy Q
    'schoolboy q': ['q', 'groovy q', 'quincy hanley'],
    // Ab-Soul
    'ab-soul': ['soul', 'soulo', 'herbert stevens'],
    // Jay Rock
    'jay rock': ['rock', 'johnny mckenzie'],
    // Joey Bada$$
    'joey bada$$': ['joey', 'joey badass', 'jo vaughn virginie'],
    // Vince Staples
    'vince staples': ['vince', 'vincent staples'],
    // Denzel Curry
    'denzel curry': ['denzel', 'curry', 'zel'],
    // JID
    'jid': ['j.i.d', 'j.i.d.', 'destin route'],
    // 21 Savage
    '21 savage': ['21', 'savage', 'sheyaa bin abraham joseph'],
    // Offset
    'offset': ['set', 'kiari cephus'],
    // Quavo
    'quavo': ['qua', 'quavious marshall'],
    // Takeoff
    'takeoff': ['take', 'kirshnik ball'],
    // Cardi B
    'cardi b': ['cardi', 'belcalis almanzar', 'bardi'],
    // Megan Thee Stallion
    'megan thee stallion': ['megan', 'meg', 'tina snow', 'hot girl meg', 'megan pete'],
    // Doja Cat
    'doja cat': ['doja', 'amala dlamini'],
    // Nicki Minaj
    'nicki minaj': ['nicki', 'barbie', 'onika maraj'],
    // Lil Kim
    'lil\' kim': ['lil kim', 'kim', 'queen bee', 'kimberly jones'],
    // Eve
    'eve': ['eve of destruction', 'eve jeffers'],
    // Queen Latifah
    'queen latifah': ['latifah', 'dana owens'],
    // MC Lyte
    'mc lyte': ['lyte', 'lana moorer'],
    // Salt-N-Pepa
    'salt-n-pepa': ['salt n pepa', 'snp'],
    // Left Eye
    'lisa "left eye" lopes': ['left eye', 'lisa lopes'],
    // Da Brat
    'da brat': ['brat', 'shawntae harris'],
    // Rapsody
    'rapsody': ['rap', 'marlanna evans'],
    // Tierra Whack
    'tierra whack': ['tierra', 'whack'],
    // Little Simz
    'little simz': ['simz', 'simbi ajikawo'],
    // Noname
    'noname': ['fatimah warner'],
    // The Fugees
    'fugees': ['the fugees', 'refugee camp'],
    // Bone Thugs-N-Harmony
    'bone thugs-n-harmony': ['bone thugs', 'bone', 'btnh'],
    // Three 6 Mafia
    'three 6 mafia': ['three six mafia', 'triple six mafia', '666 mafia'],
    // UGK
    'ugk': ['underground kingz', 'bun b and pimp c'],
    // Gang Starr
    'gang starr': ['gangstarr', 'guru and premier'],
    // Eric B. & Rakim
    'eric b. & rakim': ['eric b and rakim', 'rakim and eric b'],
    // EPMD
    'epmd': ['erick and parrish making dollars'],
    // De La Soul
    'de la soul': ['de la', 'plugs 1 2 and 3'],
    // Run-DMC
    'run-dmc': ['run dmc', 'rundmc'],
    // Public Enemy
    'public enemy': ['pe', 'chuck d and flavor flav'],
    // N.W.A
    'n.w.a': ['nwa', 'niggaz wit attitudes'],
    // Wu-Tang Clan
    'wu-tang clan': ['wu tang', 'wu', 'wutang', 'the wu'],
    // D12
    'd12': ['d 12', 'dirty dozen', 'detroit dozen'],
    // G-Unit
    'g-unit': ['g unit', 'gunit'],
    // Dipset
    'the diplomats': ['dipset', 'diplomats'],
    // Cam\'ron
    'cam\'ron': ['cam', 'killa', 'killa cam', 'cameron giles'],
    // Jim Jones
    'jim jones': ['jimmy', 'capo', 'joseph jones'],
    // Juelz Santana
    'juelz santana': ['juelz', 'santana', 'laron james'],
    // T.I.
    't.i.': ['ti', 'tip', 'clifford harris', 'king of the south'],
    // Jeezy
    'jeezy': ['young jeezy', 'the snowman', 'jay jenkins'],
    // Gucci Mane
    'gucci mane': ['gucci', 'guwop', 'radric davis', 'wizop'],
    // Waka Flocka Flame
    'waka flocka flame': ['waka', 'waka flocka', 'juaquin malphurs'],
    // 2 Chainz
    '2 chainz': ['2chainz', 'two chainz', 'tity boi', 'tauheed epps'],
    // Ludacris
    'ludacris': ['luda', 'chris bridges', 'christopher bridges'],
    // B.o.B
    'b.o.b': ['bob', 'bobby ray', 'bobby ray simmons'],
    // Big K.R.I.T.
    'big k.r.i.t.': ['krit', 'big krit', 'justin scott'],
    // Killer Mike
    'killer mike': ['mike', 'michael render'],
    // El-P
    'el-p': ['el producto', 'jaime meline'],
    // Freddie Gibbs
    'freddie gibbs': ['freddie', 'gibbs', 'gangsta gibbs', 'fredrick tipton'],
    // Westside Gunn
    'westside gunn': ['gunn', 'flygod', 'alvin worthy'],
    // Conway the Machine
    'conway the machine': ['conway', 'machine', 'demond price'],
    // Benny the Butcher
    'benny the butcher': ['benny', 'butcher', 'jeremie pennick'],
    // Boldy James
    'boldy james': ['boldy', 'james clay jones'],
    // Roc Marciano
    'roc marciano': ['roc marci', 'marci', 'rahkeim calief meyer'],
    // Ka
    'ka': ['kaseem ryan'],
    // Billy Woods
    'billy woods': ['woods'],
    // JPEGMAFIA
    'jpegmafia': ['jpeg', 'peggy', 'barrington hendricks'],
    // Ski Mask the Slump God
    'ski mask the slump god': ['ski mask', 'ski', 'stokeley goulbourne'],
    // XXXTentacion
    'xxxtentacion': ['xxx', 'x', 'jahseh onfroy'],
    // Juice WRLD
    'juice wrld': ['juice', 'jarad higgins'],
    // Pop Smoke
    'pop smoke': ['pop', 'bashar jackson'],
    // Lil Uzi Vert
    'lil uzi vert': ['uzi', 'lil uzi', 'symere woods'],
    // Playboi Carti
    'playboi carti': ['carti', 'jordan carter'],
    // Lil Yachty
    'lil yachty': ['yachty', 'boat', 'lil boat', 'miles mccollum'],
    // Kodak Black
    'kodak black': ['kodak', 'yak', 'bill israel'],
    // NBA YoungBoy
    'nba youngboy': ['youngboy', 'yb', 'kentrell gaulden'],
    // Rod Wave
    'rod wave': ['rod', 'rodarius green'],
    // Polo G
    'polo g': ['polo', 'taurus bartlett'],
    // Lil Durk
    'lil durk': ['durk', 'durkio', 'durk banks'],
    // King Von
    'king von': ['von', 'dayvon bennett'],
    // Chief Keef
    'chief keef': ['sosa', 'keef', 'keith cozart'],
    // Fivio Foreign
    'fivio foreign': ['fivio', 'maxie ryles'],
    // Sheff G
    'sheff g': ['sheff', 'michael williams'],
    // Sleepy Hallow
    'sleepy hallow': ['sleepy', 'tegan chambers'],
    // A Boogie wit da Hoodie
    'a boogie wit da hoodie': ['a boogie', 'boogie', 'artist dubose'],
    // Don Toliver
    'don toliver': ['don', 'caleb toliver'],
    // Gunna
    'gunna': ['wunna', 'sergio kitchens'],
    // Lil Keed
    'lil keed': ['keed', 'raqhid render'],
    // DaBaby
    'dababy': ['baby jesus', 'jonathan kirk'],
    // Moneybagg Yo
    'moneybagg yo': ['moneybagg', 'demario white'],
    // Key Glock
    'key glock': ['glock', 'markeyvius cathey'],
    // Young Dolph
    'young dolph': ['dolph', 'adolph thornton'],
    // Yo Gotti
    'yo gotti': ['gotti', 'mario mims'],
    // Blueface
    'blueface': ['blue', 'johnathan porter'],
    // NLE Choppa
    'nle choppa': ['choppa', 'bryson potts'],
    // Tee Grizzley
    'tee grizzley': ['tee', 'terry wallace'],
    // 42 Dugg
    '42 dugg': ['dugg', 'dion hayes'],
    // EST Gee
    'est gee': ['gee', 'george stone'],
    // Pooh Shiesty
    'pooh shiesty': ['shiesty', 'lontrell williams'],
    // Fredo Bang
    'fredo bang': ['fredo', 'fredrick givens'],
    // Quando Rondo
    'quando rondo': ['quando', 'tyquian bowman'],
    // Yungeen Ace
    'yungeen ace': ['ace', 'keyanta bullard'],
    // SpotemGottem
    'spotemgottem': ['spotem', 'nehemiah harden'],
    // Hotboii
    'hotboii': ['hotboii', 'javarri walker'],
    // Jackboy
    'jackboy': ['jack', 'pierre delince'],
    // City Girls
    'city girls': ['yung miami and jt'],
    // Saweetie
    'saweetie': ['diamonte harper'],
    // Asian Doll
    'asian doll': ['asian da brat', 'misharron allen'],
    // Cuban Doll
    'cuban doll': ['cuban', 'aaliyah keef'],
    // Kash Doll
    'kash doll': ['kash', 'arkeisha knight'],
    // Lakeyah
    'lakeyah': ['keyah', 'lakeyah danaee'],
    // Flo Milli
    'flo milli': ['flo', 'tamia carter'],
    // BIA
    'bia': ['perico princess', 'bianca landrau'],
    // Armani Caesar
    'armani caesar': ['armani'],
    // Che Noir
    'che noir': ['che', 'marche lashawn'],
    // Latto
    'latto': ['big latto', 'mulatto', 'alyssa stephens'],
    // Baby Tate
    'baby tate': ['tate', 'tate farris'],
    // Rico Nasty
    'rico nasty': ['rico', 'maria kelly'],
    // Chika
    'chika': ['jane chika oranika'],
    // Snow Tha Product
    'snow tha product': ['snow', 'claudia feliciano'],
    // Dreezy
    'dreezy': ['big dreez', 'seandrea sledge'],
    // Tink
    'tink': ['trinity home'],
    // Kamaiyah
    'kamaiyah': ['kamaiyah johnson'],
    // Stunna Girl
    'stunna girl': ['stunna', 'suzanne brown'],
    // Monaleo
    'monaleo': ['mona', 'leondra phillips'],
    // Enchanting
    'enchanting': ['chant'],
    // Big Boss Vette
    'big boss vette': ['vette'],
    // KenTheMan
    'kentheman': ['ken', 'kentavia miller'],
    // Erica Banks
    'erica banks': ['erica'],
    // Renni Rucci
    'renni rucci': ['renni', 'courtney rene'],
    // Mulatto
    'mulatto': ['latto', 'big latto', 'alyssa stephens']
  }), []);

  // Search functionality with memoization
  const searchArtists = useCallback((query) => {
    if (!query || query.length < 2) return [];
    const lowerQuery = query.toLowerCase();
    
    // Create a normalized version of the query for better matching
    const normalizedQuery = lowerQuery
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
    
    // Check if the query matches any alias
    let aliasMatches = [];
    for (const [artistName, aliases] of Object.entries(artistAliases)) {
      const matchedAlias = aliases.find(alias => 
        alias.includes(normalizedQuery) || normalizedQuery.includes(alias)
      );
      if (matchedAlias) {
        // Find the actual artist object
        const artist = allArtists.find(a => a.name.toLowerCase() === artistName);
        if (artist && !aliasMatches.find(a => a.id === artist.id)) {
          aliasMatches.push({ ...artist, matchedAlias });
        }
      }
    }
    
    const results = allArtists
      .map(artist => {
        const lowerName = artist.name.toLowerCase();
        const normalizedName = lowerName
          .replace(/[^\w\s]/g, '') // Remove special characters
          .replace(/\s+/g, ' ') // Normalize spaces
          .trim();
        
        let score = 0;
        let isMatch = false;
        
        // 1. EXACT MATCH (highest priority) - score 100
        if (lowerName === lowerQuery || normalizedName === normalizedQuery) {
          score = 100;
          isMatch = true;
        }
        // 2. STARTS WITH QUERY - score 90
        else if (lowerName.startsWith(lowerQuery) || normalizedName.startsWith(normalizedQuery)) {
          score = 90;
          isMatch = true;
        }
        // 3. EXACT WORD MATCH - score 80
        else if (lowerName.split(' ').includes(lowerQuery) || normalizedName.split(' ').includes(normalizedQuery)) {
          score = 80;
          isMatch = true;
        }
        // 4. WORD STARTS WITH - score 70
        else if (normalizedName.split(' ').some(word => word.startsWith(normalizedQuery))) {
          score = 70;
          isMatch = true;
        }
        // 5. CONTAINS QUERY - score 60
        else if (lowerName.includes(lowerQuery) || normalizedName.includes(normalizedQuery)) {
          score = 60;
          isMatch = true;
        }
        // 6. PARTIAL WORD MATCHING - score 50
        else if (normalizedName.split(' ').some(word => 
          normalizedQuery.split(' ').some(queryWord => word.startsWith(queryWord))
        )) {
          score = 50;
          isMatch = true;
        }
        // 7. ERA MATCHING - score 40
        else if (artist.era.toLowerCase().includes(lowerQuery)) {
          score = 40;
          isMatch = true;
        }
        
        return isMatch ? { ...artist, searchScore: score } : null;
      })
      .filter(Boolean);
    
    // Combine alias matches with regular matches, removing duplicates
    const allMatches = [...aliasMatches.map(a => ({ ...a, searchScore: 95 })), ...results];
    
    // Remove duplicates and sort by score
    const uniqueMatches = Array.from(
      new Map(allMatches.map(item => [item.id, item])).values()
    )
    .sort((a, b) => b.searchScore - a.searchScore)
    .slice(0, 8);
    
    return uniqueMatches;
  }, [allArtists, artistAliases]);

  // Debounced search values for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const debouncedTagSearchQuery = useDebounce(tagSearchQuery, 300);
  const debouncedFriendSearchQuery = useDebounce(friendSearchQuery, 300);

  const searchResults = useMemo(() => searchArtists(debouncedSearchQuery), [debouncedSearchQuery, searchArtists]);

  // Handle search for other lists with debouncing
  const handleOtherListSearchDebounced = useDebouncedCallback((listId, query) => {
    if (query && query.length > 1) {
      const results = searchArtists(query);
      setOtherListSearchResults(prev => ({ ...prev, [listId]: results }));
    } else {
      setOtherListSearchResults(prev => ({ ...prev, [listId]: [] }));
    }
  }, 300);

  const handleOtherListSearch = useCallback((listId, query) => {
    setOtherListSearchQueries(prev => ({ ...prev, [listId]: query }));
    handleOtherListSearchDebounced(listId, query);
  }, [handleOtherListSearchDebounced]);

  // List management functions
  const updateListAndSave = useCallback((listId, newArtists) => {
    console.log('updateListAndSave called:', { listId, newArtistsCount: newArtists.length });
    const updatedLists = userLists.map(l => 
      l.id === listId ? { ...l, artists: newArtists } : l
    );
    setUserLists(updatedLists);
    console.log('userLists updated, new length:', updatedLists.find(l => l.id === listId)?.artists.length);
    
    const listToSave = updatedLists.find(l => l.id === listId);
    if (listToSave) {
      saveRankingToDatabase(listToSave);
    }
  }, [userLists]);

  // Add artist to other list
  const addArtistToOtherList = useCallback((listId, artist) => {
    const list = userLists.find(l => l.id === listId);
    if (!list || list.artists.find(a => a.id === artist.id)) return;
    
    const newArtists = [...list.artists, artist];
    updateListAndSave(listId, newArtists);
    
    // Clear search for this list
    setOtherListSearchQueries(prev => ({ ...prev, [listId]: '' }));
    setOtherListSearchResults(prev => ({ ...prev, [listId]: [] }));
  }, [userLists, updateListAndSave]);

  // Check how many friends rank an artist
  const getFriendCountForArtist = useCallback((artistId) => {
    if (!friends || !friends.length || !friendRankings) return 0;
    
    // Check in loaded friend rankings or user lists for a quick approximation
    let count = 0;
    friends.forEach(friend => {
      // This is a simplified check - in a real app you'd want to cache this data
      if (friendRankings.some(ranking => ranking.artists && ranking.artists.some(a => a.id === artistId))) {
        count++;
      }
    });
    return count;
  }, [friends, friendRankings]);



  // Mobile drag handlers
  const handleMobileDragStart = useCallback((data) => {
    console.log('handleMobileDragStart called with:', data);
    if (data.isOtherRanking) {
      // Handle other rankings dragging
      const { rankingId } = data;
      setDraggedOtherRankingId(rankingId);
    } else {
      // Handle artist dragging
      const { artist, listId } = data;
      setDraggedItem({ artist, listId });
      setDraggedFromList(listId);
    }
  }, []);

  const handleMobileDragMove = useCallback((touch) => {
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (draggedOtherRankingId) {
      // Check if we're dragging an other ranking
      const otherRankingDropZone = element?.closest('[data-list-id]');
      if (otherRankingDropZone) {
        // Find the index of this ranking in the other rankings
        const otherRankingLists = userLists.filter(list => !list.custom_category_id && !list.isAllTime);
        const dropIndex = otherRankingLists.findIndex(list => list.id === otherRankingDropZone.getAttribute('data-list-id'));
        if (dropIndex !== -1) {
          setOtherRankingDragOverIndex(dropIndex);
        }
      } else {
        setOtherRankingDragOverIndex(null);
      }
    } else {
      // Handle artist dragging
      const dropTarget = element?.closest('[data-drop-index]');
      if (dropTarget) {
        const index = parseInt(dropTarget.dataset.dropIndex);
        setDragOverIndex(index);
      } else {
        setDragOverIndex(null);
      }
    }
  }, [draggedOtherRankingId, userLists]);

  const handleMobileDragEnd = useCallback((data, dropTarget) => {
    console.log('Mobile drag end:', { draggedItem, draggedOtherRankingId, dropTarget });
    
    // Handle other rankings dragging
    if (draggedOtherRankingId && dropTarget) {
      const otherRankingDropZone = dropTarget.closest('[data-list-id]');
      if (otherRankingDropZone) {
        const otherRankingLists = userLists.filter(list => !list.custom_category_id && !list.isAllTime);
        const dropIndex = otherRankingLists.findIndex(list => list.id === otherRankingDropZone.getAttribute('data-list-id'));
        if (dropIndex !== -1) {
          const draggedIndex = otherRankingLists.findIndex(list => list.id === draggedOtherRankingId);
          
          if (draggedIndex !== -1 && draggedIndex !== dropIndex) {
            // Reorder the lists
            const newOtherRankingLists = [...otherRankingLists];
            const [removed] = newOtherRankingLists.splice(draggedIndex, 1);
            newOtherRankingLists.splice(dropIndex, 0, removed);

            // Update the order in state
            const newOrder = newOtherRankingLists.map(list => list.id);
            setOtherRankingsOrder(newOrder);

            // Save the order to localStorage
            if (currentUser) {
              localStorage.setItem(`other_rankings_order_${currentUser.id}`, JSON.stringify(newOrder));
            }
          }
        }
      }
      setDraggedOtherRankingId(null);
      setOtherRankingDragOverIndex(null);
      return;
    }
    
    // Handle artist dragging
    if (!draggedItem || !dropTarget) {
      console.log('No dragged item or drop target');
      setDraggedItem(null);
      setDragOverIndex(null);
      return;
    }

    // First try to find a drop index directly
    const dropIndexElement = dropTarget.closest('[data-drop-index]');
    console.log('Drop index element:', dropIndexElement);
    if (!dropIndexElement) {
      console.log('No drop index element found');
      setDraggedItem(null);
      setDragOverIndex(null);
      return;
    }

    // Then find the list container
    const dropZone = dropIndexElement.closest('[data-list-id]');
    console.log('Drop zone:', dropZone);
    if (!dropZone) {
      console.log('No drop zone found');
      setDraggedItem(null);
      setDragOverIndex(null);
      return;
    }

    const listId = dropZone.dataset.listId;
    const targetIndex = parseInt(dropIndexElement.dataset.dropIndex || '0');
    console.log('Drop info:', { listId, targetIndex, draggedItem });

    const list = userLists.find(l => l.id === listId);
    if (!list) {
      console.log('List not found:', listId);
      return;
    }

    console.log('Processing drop on list:', list.title);
    console.log('draggedItem.listId:', draggedItem.listId);
    console.log('target listId:', listId);
    console.log('Are they equal?', draggedItem.listId === listId);

    if (draggedItem.listId === 'search') {
      if (!list.artists.find(a => a.id === draggedItem.artist.id)) {
        const newArtists = [...list.artists];
        newArtists.splice(targetIndex, 0, draggedItem.artist);
        updateListAndSave(listId, newArtists);
        console.log('Added from search');
      }
    } else if (draggedItem.listId === listId) {
      const newArtists = [...list.artists];
      const draggedIndex = newArtists.findIndex(a => a.id === draggedItem.artist.id);
      
      if (draggedIndex !== -1 && draggedIndex !== targetIndex) {
        console.log('Reordering within list:', { draggedIndex, targetIndex });
        console.log('Before reorder:', newArtists.map(a => a.name));
        const [removed] = newArtists.splice(draggedIndex, 1);
        const adjustedIndex = draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
        newArtists.splice(adjustedIndex, 0, removed);
        console.log('After reorder:', newArtists.map(a => a.name));
        console.log('Calling updateListAndSave...');
        updateListAndSave(listId, newArtists);
        console.log('Mobile reorder complete - list should update');
      } else {
        console.log('No reorder needed:', { draggedIndex, targetIndex });
      }
    } else {
      console.log('No matching condition for draggedItem.listId:', draggedItem.listId);
      console.log('Expected either "search" or', listId);
    }
    
    setDraggedItem(null);
    setDragOverIndex(null);
    setDraggedFromList(null);
  }, [draggedItem, draggedOtherRankingId, userLists, updateListAndSave, currentUser]);

  const mobileDrag = useMobileDrag(
    handleMobileDragStart,
    handleMobileDragEnd,
    handleMobileDragMove
  );

  // Desktop drag handlers
  const handleDragStart = useCallback((e, artist, listId) => {
    setDraggedItem({ artist, listId });
    setDraggedFromList(listId);
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.5';
  }, []);

  const handleDragEnd = useCallback((e) => {
    e.target.style.opacity = '1';
    setDragOverIndex(null);
    setDraggedFromList(null);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnter = useCallback((e, index) => {
    if (draggedItem) {
      setDragOverIndex(index);
    }
  }, [draggedItem]);

  const handleDrop = useCallback((e, targetIndex, listId) => {
    e.preventDefault();
    if (!draggedItem) return;

    const list = userLists.find(l => l.id === listId);
    if (!list) return;

    if (draggedItem.listId === 'search') {
      if (!list.artists.find(a => a.id === draggedItem.artist.id)) {
        const newArtists = [...list.artists];
        newArtists.splice(targetIndex, 0, draggedItem.artist);
        updateListAndSave(listId, newArtists);
      }
    } else if (draggedItem.listId === listId) {
      const newArtists = [...list.artists];
      const draggedIndex = newArtists.findIndex(a => a.id === draggedItem.artist.id);
      
      if (draggedIndex !== -1 && draggedIndex !== targetIndex) {
        const [removed] = newArtists.splice(draggedIndex, 1);
        const adjustedIndex = draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
        newArtists.splice(adjustedIndex, 0, removed);
        updateListAndSave(listId, newArtists);
      }
    }
    
    setDraggedItem(null);
    setDragOverIndex(null);
  }, [draggedItem, userLists]);

  const addArtistToList = useCallback((artist, listId) => {
    const list = userLists.find(l => l.id === listId);
    if (list && !list.artists.find(a => a.id === artist.id)) {
      updateListAndSave(listId, [...list.artists, artist]);
    }
    setSearchQuery('');
    setShowSearchResults(false);
  }, [userLists, updateListAndSave]);

  const removeArtistFromList = useCallback((artistId, listId) => {
    const list = userLists.find(l => l.id === listId);
    if (list) {
      updateListAndSave(listId, list.artists.filter(a => a.id !== artistId));
    }
  }, [userLists, updateListAndSave]);

  const loadOtherRankingsOrder = useCallback(async (user = currentUser) => {
    if (!user) return;

    try {
      // Load other rankings order from localStorage
      const savedOtherRankingsOrder = localStorage.getItem(`other_rankings_order_${user.id}`);
      if (savedOtherRankingsOrder) {
        setOtherRankingsOrder(JSON.parse(savedOtherRankingsOrder));
      }
    } catch (error) {
      console.error('Error loading other rankings order:', error);
    }
  }, []);


  const handleDeleteList = useCallback(async (listId) => {
    try {
      // Delete the ranking from database
      const { error } = await supabase
        .from('rankings')
        .delete()
        .eq('id', listId)
        .eq('user_id', currentUser.id);

      if (error) throw error;

      // Remove from local state
      setUserLists(prev => prev.filter(list => list.id !== listId));
      
      addToast('List deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting list:', error);
      addToast('Failed to delete list', 'error');
    }
  }, [currentUser, supabase, addToast]);


  // Other Rankings drag handlers
  const handleOtherRankingDragStart = useCallback((e, rankingId) => {
    setDraggedOtherRankingId(rankingId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleOtherRankingDragEnd = useCallback(() => {
    setDraggedOtherRankingId(null);
    setOtherRankingDragOverIndex(null);
  }, []);

  const handleOtherRankingDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleOtherRankingDragEnter = useCallback((e, index) => {
    if (draggedOtherRankingId) {
      setOtherRankingDragOverIndex(index);
    }
  }, [draggedOtherRankingId]);

  const handleOtherRankingDrop = useCallback(async (e, dropIndex) => {
    e.preventDefault();
    
    if (!draggedOtherRankingId) return;

    const otherRankingLists = userLists.filter(list => !list.custom_category_id && !list.isAllTime);
    const draggedIndex = otherRankingLists.findIndex(list => list.id === draggedOtherRankingId);
    
    if (draggedIndex === -1 || draggedIndex === dropIndex) return;

    // Reorder the lists
    const newOtherRankingLists = [...otherRankingLists];
    const [removed] = newOtherRankingLists.splice(draggedIndex, 1);
    newOtherRankingLists.splice(dropIndex, 0, removed);

    // Update the order in state
    const newOrder = newOtherRankingLists.map(list => list.id);
    setOtherRankingsOrder(newOrder);

    // Save the order to localStorage
    if (currentUser) {
      localStorage.setItem(`other_rankings_order_${currentUser.id}`, JSON.stringify(newOrder));
    }

    setOtherRankingDragOverIndex(null);
  }, [draggedOtherRankingId, userLists, currentUser]);

  const createNewList = useCallback((categoryId = null, customCategory = null) => {
    const tempId = `temp-${Date.now()}`;
    let newList;
    
    if (customCategory) {
      // Creating from custom category
      newList = {
        id: tempId,
        title: customCategory.category_name,
        category: null,
        custom_category_id: customCategory.id,
        artists: [],
        created: "Just now",
        isAllTime: false
      };
    } else {
      // Creating from starter category
      const category = starterCategories.find(c => c.id === categoryId);
      newList = {
        id: tempId,
        title: category ? category.name : "New Ranking",
        category: categoryId,
        custom_category_id: null,
        artists: [],
        created: "Just now",
        isAllTime: categoryId === 'all-time'
      };
    }
    
    setUserLists([...userLists, newList]);
    if (!categoryId && !customCategory) {
      setEditingRanking(tempId);
    }
    
    // Save to database immediately to enable editing
    if (categoryId || customCategory) {
      saveRankingToDatabase(newList);
    }
  }, [userLists]);

  const handleCustomCategorySelected = useCallback((category) => {
    createNewList(null, category);
    setShowCustomCategorySelector(false);
  }, [createNewList]);

  const hasAllTimeList = userLists.some(list => list.isAllTime);

  const handleScroll = useCallback((e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 100; // Load before hitting exact bottom
    if (bottom && loadedRankings < fullRankings.length) {
      setLoadedRankings(prev => Math.min(prev + 25, fullRankings.length)); // Load 25 at a time
    }
  }, [loadedRankings, fullRankings.length]);

  const quickAddToList = useCallback((artist) => {
    if (!hasAllTimeList) {
      const newList = {
        id: `temp-${Date.now()}`,
        title: "Greatest of All Time",
        category: 'all-time',
        artists: [artist],
        created: "Just now",
        isAllTime: true
      };
      setUserLists([newList, ...userLists]);
      saveRankingToDatabase(newList);
    } else {
      const allTimeList = userLists.find(l => l.isAllTime);
      if (allTimeList && !allTimeList.artists.find(a => a.id === artist.id)) {
        updateListAndSave(allTimeList.id, [...allTimeList.artists, artist]);
      }
    }
  }, [hasAllTimeList, userLists, updateListAndSave]);

  const shareList = useCallback((list) => {
    const shareUrl = `${window.location.origin}/share/${currentUser.id}`;
    const isGoatList = list.isAllTime || list.is_all_time;
    const shareText = isGoatList 
      ? `Check out my Greatest of All Time list on The Canon:\n${list.artists.slice(0, 5).map((a, i) => `${i + 1}. ${a.name}`).join('\n')}`
      : `Check out my ${list.title} list on The Canon:\n${list.artists.slice(0, 5).map((a, i) => `${i + 1}. ${a.name}`).join('\n')}`;
    
    if (navigator.share) {
      navigator.share({
        title: `${username}'s ${isGoatList ? 'Greatest of All Time' : list.title}`,
        text: shareText,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      addToast('Link copied to clipboard!', 'success');
    }
  }, [currentUser, username]);

  const calculateUniqueness = useCallback((list) => {
    const uniquePicks = Math.floor(list.artists.length * 0.3);
    return {
      score: uniquePicks,
      percentage: list.artists.length > 0 ? Math.round((uniquePicks / list.artists.length) * 100) : 0
    };
  }, []);

  // User Credibility Tier System
  const credibilityTiers = {
    BRONZE: { name: 'Bronze', weight: 1.0, color: '#CD7F32', icon: '🥉', minScore: 0 },
    SILVER: { name: 'Silver', weight: 1.5, color: '#C0C0C0', icon: '🥈', minScore: 100 },
    GOLD: { name: 'Gold', weight: 2.0, color: '#FFD700', icon: '🥇', minScore: 300 },
    PLATINUM: { name: 'Platinum', weight: 3.0, color: '#E5E4E2', icon: '💎', minScore: 600 },
    DIAMOND: { name: 'Diamond', weight: 5.0, color: '#B9F2FF', icon: '💠', minScore: 1000 }
  };

  // Calculate user credibility score (0-1200+ points)
  const calculateUserCredibility = useCallback((userStats) => {
    if (!userStats) return { score: 0, tier: credibilityTiers.BRONZE };
    
    let credibilityScore = 0;
    const factors = {};
    
    // Knowledge Depth Factors (40% of score - max 480 points)
    
    // List diversity (era spanning) - max 120 points
    const eraSpanning = Math.min(5, userStats.uniqueErasCount || 1); // 1-5 eras
    factors.eraSpanning = (eraSpanning / 5) * 120;
    credibilityScore += factors.eraSpanning;
    
    // Deep cut ratio - max 120 points  
    const totalArtists = userStats.totalArtistsRanked || 10;
    const commonArtists = userStats.commonArtistsCount || totalArtists * 0.7;
    const deepCutRatio = Math.max(0, 1 - (commonArtists / totalArtists));
    factors.deepCutRatio = deepCutRatio * 120;
    credibilityScore += factors.deepCutRatio;
    
    // List completeness - max 120 points
    const avgListLength = userStats.avgListLength || 10;
    factors.listCompleteness = Math.min(1, avgListLength / 20) * 120;
    credibilityScore += factors.listCompleteness;
    
    // Genre diversity - max 120 points
    const genreCount = Math.min(8, userStats.uniqueGenresCount || 2);
    factors.genreDiversity = (genreCount / 8) * 120;
    credibilityScore += factors.genreDiversity;
    
    // Engagement Quality Factors (35% of score - max 420 points)
    
    // Face-off accuracy - max 140 points
    const faceOffAccuracy = userStats.faceOffWins / Math.max(1, userStats.faceOffTotal || 1);
    factors.faceOffAccuracy = faceOffAccuracy * 140;
    credibilityScore += factors.faceOffAccuracy;
    
    // Debate quality (avg likes per debate) - max 140 points  
    const debateQuality = Math.min(10, userStats.avgDebateLikes || 0) / 10;
    factors.debateQuality = debateQuality * 140;
    credibilityScore += factors.debateQuality;
    
    // Platform consistency (time between updates) - max 140 points
    const daysSinceJoined = (Date.now() - new Date(userStats.joinDate || Date.now())) / (1000 * 60 * 60 * 24);
    const consistencyScore = Math.min(1, (userStats.totalRankings || 1) / Math.max(1, daysSinceJoined / 30));
    factors.consistency = consistencyScore * 140;
    credibilityScore += factors.consistency;
    
    // Community Validation Factors (25% of score - max 300 points)
    
    // Taste compatibility with others - max 150 points
    const tasteCompatibility = (userStats.avgCompatibilityScore || 50) / 100;
    factors.tasteCompatibility = tasteCompatibility * 150;
    credibilityScore += factors.tasteCompatibility;
    
    // Community engagement (profile views, list shares) - max 150 points
    const engagementScore = Math.min(1, (userStats.profileViews || 0) / 100);
    factors.communityEngagement = engagementScore * 150;
    credibilityScore += factors.communityEngagement;
    
    // Determine tier based on score
    let tier = credibilityTiers.BRONZE;
    if (credibilityScore >= credibilityTiers.DIAMOND.minScore) tier = credibilityTiers.DIAMOND;
    else if (credibilityScore >= credibilityTiers.PLATINUM.minScore) tier = credibilityTiers.PLATINUM;
    else if (credibilityScore >= credibilityTiers.GOLD.minScore) tier = credibilityTiers.GOLD;
    else if (credibilityScore >= credibilityTiers.SILVER.minScore) tier = credibilityTiers.SILVER;
    
    return {
      score: Math.round(credibilityScore),
      tier: tier,
      factors: factors,
      breakdown: {
        knowledge: factors.eraSpanning + factors.deepCutRatio + factors.listCompleteness + factors.genreDiversity,
        engagement: factors.faceOffAccuracy + factors.debateQuality + factors.consistency,
        community: factors.tasteCompatibility + factors.communityEngagement
      }
    };
  }, []);

  // Get user credibility tier for display
  const getUserTier = useCallback((userStats) => {
    return calculateUserCredibility(userStats).tier;
  }, [calculateUserCredibility]);

  // Calculate progress to next tier
  const getTierProgress = useCallback((userStats) => {
    const credibility = calculateUserCredibility(userStats);
    const currentScore = credibility.score;
    const currentTier = credibility.tier;
    
    const tierKeys = Object.keys(credibilityTiers);
    const currentTierIndex = tierKeys.findIndex(key => credibilityTiers[key] === currentTier);
    
    if (currentTierIndex === tierKeys.length - 1) {
      // Already at max tier
      return { progress: 100, nextTier: null, pointsNeeded: 0 };
    }
    
    const nextTierKey = tierKeys[currentTierIndex + 1];
    const nextTier = credibilityTiers[nextTierKey];
    const pointsNeeded = nextTier.minScore - currentScore;
    const tierRange = nextTier.minScore - currentTier.minScore;
    const progress = Math.max(0, Math.min(100, ((currentScore - currentTier.minScore) / tierRange) * 100));
    
    return {
      progress: Math.round(progress),
      nextTier: nextTier,
      pointsNeeded: Math.max(0, pointsNeeded),
      currentScore: currentScore
    };
  }, [calculateUserCredibility]);

  const checkPioneerStatus = useCallback((artistId) => {
    return Math.random() < 0.1;
  }, []);

  // User Tier Badge Component
  const UserTierBadge = ({ userStats, size = 'sm', showName = false, showProgress = false }) => {
    const credibility = calculateUserCredibility(userStats);
    const tier = credibility.tier;
    const progress = getTierProgress(userStats);
    
    const sizeClasses = {
      xs: 'text-xs px-1 py-0.5',
      sm: 'text-sm px-2 py-1', 
      md: 'text-base px-3 py-1.5',
      lg: 'text-lg px-4 py-2'
    };
    
    return (
      <div className="flex items-center gap-2">
        <div 
          className={`inline-flex items-center gap-1 rounded-full border ${sizeClasses[size]} font-medium transition-all hover:scale-105`}
          style={{ 
            backgroundColor: `${tier.color}15`, 
            borderColor: `${tier.color}50`,
            color: tier.color 
          }}
          title={`${tier.name} Tier • Score: ${credibility.score} • Voice Weight: ${tier.weight}x`}
        >
          <span>{tier.icon}</span>
          {showName && <span>{tier.name}</span>}
          <span className="text-xs opacity-75">{tier.weight}x</span>
        </div>
        
        {showProgress && progress.nextTier && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-gray-400 to-white transition-all duration-1000"
                style={{ width: `${progress.progress}%` }}
              />
            </div>
            <span>{progress.pointsNeeded} to {progress.nextTier.name}</span>
          </div>
        )}
      </div>
    );
  };

  const handleFaceOffVote = (winnerId) => {
    if (dailyFaceOffsCompleted >= 10) {
      addToast("You've reached your daily limit of 10 face-offs!", 'warning');
      return;
    }
    
    if (dailyPowerVotes > 0 && convictionLevel > 75) {
      setDailyPowerVotes(prev => prev - 1);
    }
    setUserVotes({ ...userVotes, [currentFaceOff]: winnerId });
    setDailyFaceOffsCompleted(prev => prev + 1);
    
    if (faceOffs[currentFaceOff]) {
      const currentFaceOffData = faceOffs[currentFaceOff];
      const artist1Id = currentFaceOffData.artist1.id;
      const artist2Id = currentFaceOffData.artist2.id;
      const loserId = winnerId === artist1Id ? artist2Id : artist1Id;
      
      // Update head-to-head records
      const matchupKey = [artist1Id, artist2Id].sort().join('-');
      setHeadToHeadRecords(prev => {
        const current = prev[matchupKey] || { 
          [artist1Id]: { wins: 0, losses: 0 },
          [artist2Id]: { wins: 0, losses: 0 }
        };
        
        return {
          ...prev,
          [matchupKey]: {
            ...current,
            [winnerId]: {
              wins: current[winnerId].wins + 1,
              losses: current[winnerId].losses
            },
            [loserId]: {
              wins: current[loserId].wins,
              losses: current[loserId].losses + 1
            }
          }
        };
      });
      
      saveFaceOffVote(artist1Id, artist2Id, winnerId, convictionLevel);
    }
    
    const hasAllTimeList = userLists.some(list => list.isAllTime);
    if (dailyFaceOffsCompleted === 0 && !hasAllTimeList) {
      const votedArtist = winnerId === faceOffs[currentFaceOff].artist1.id 
        ? faceOffs[currentFaceOff].artist1 
        : faceOffs[currentFaceOff].artist2;
      setSelectedArtistToAdd(votedArtist);
      setPromptAddToList(true);
    }
    
    setTimeout(() => {
      setShowFaceOff(false);
      const newFaceOff = generateFaceOff();
      if (newFaceOff) {
        setFaceOffs([newFaceOff]);
        setCurrentFaceOff(0);
      }
    }, 2000);
  };

  // Get head-to-head win percentage
  const getHeadToHeadPercentage = useCallback((artist1Id, artist2Id) => {
    const matchupKey = [artist1Id, artist2Id].sort().join('-');
    const record = headToHeadRecords[matchupKey];
    
    if (!record || (!record[artist1Id]?.wins && !record[artist1Id]?.losses)) {
      return null; // No previous matchups
    }
    
    const artist1Stats = record[artist1Id] || { wins: 0, losses: 0 };
    const totalGames = artist1Stats.wins + artist1Stats.losses;
    
    if (totalGames === 0) return null;
    
    const winPercentage = Math.round((artist1Stats.wins / totalGames) * 100);
    return {
      artist1WinPercentage: winPercentage,
      artist2WinPercentage: 100 - winPercentage,
      totalGames
    };
  }, [headToHeadRecords]);

  // UI helper functions
  const getTabName = () => {
    const allTimeList = userLists.find(l => l.isAllTime);
    if (!allTimeList) return "MY TOP 10";
    const count = allTimeList.artists.length;
    if (count <= 10) return "MY TOP 10";
    if (count <= 15) return "MY TOP 15";
    if (count <= 20) return "MY TOP 20";
    if (count <= 25) return "MY TOP 25";
    if (count <= 50) return "MY TOP 50";
    if (count <= 100) return "MY TOP 100";
    if (count <= 150) return "MY TOP 150";
    return `MY TOP ${Math.ceil(count / 50) * 50}`;
  };

  // Tutorial Component
  const Tutorial = () => (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => setShowTutorial(false)}
    >
      <div 
        className="bg-slate-800 border border-white/20 p-8 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h1 className="text-3xl font-black text-center mb-2">WELCOME TO THE CANON</h1>
        <p className="text-purple-400 text-center mb-6 font-medium">
          Where hip-hop legends earn their crown... and pretenders are exposed.
        </p>
        
        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-3">
            <Crown className="w-5 h-5 text-yellow-400 mt-1" />
            <p className="text-sm">Build your Top 10+ of the greatest to ever do it</p>
          </div>
          <div className="flex items-start gap-3">
            <Swords className="w-5 h-5 text-purple-400 mt-1" />
            <p className="text-sm">Face-offs let you defend your picks head-to-head</p>
          </div>
          <div className="flex items-start gap-3">
            <BarChart3 className="w-5 h-5 text-green-400 mt-1" />
            <p className="text-sm">Unique picks = more influence on the final rankings</p>
          </div>
          <div className="flex items-start gap-3">
            <MessageCircle className="w-5 h-5 text-blue-400 mt-1" />
            <p className="text-sm">Make your case in the debates when people disagree</p>
          </div>
        </div>
        
        <p className="text-center text-gray-400 mb-6 text-sm italic">
          The Canon rewards those who know the culture, not just the hits.
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowTutorial(false);
              setShowFaceOff(true);
            }}
            className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 transition-colors font-medium"
          >
            Start Face-Off
          </button>
          <button
            onClick={() => {
              setShowTutorial(false);
              setActiveTab('mytop10');
            }}
            className="flex-1 py-3 bg-white/10 hover:bg-white/20 border border-white/20 transition-colors font-medium"
          >
            Build My Top 10
          </button>
        </div>
      </div>
    </div>
  );

  // Enhanced Artist Card Component
  const ArtistCard = ({ artist, onClose }) => {
    const [artistStats, setArtistStats] = useState(null);
    const [friendsWhoRankArtist, setFriendsWhoRankArtist] = useState([]);
    
    useEffect(() => {
      // Load artist stats
      const loadStats = async () => {
        const { data } = await supabase
          .from('artist_stats')
          .select('*')
          .eq('artist_id', artist.id)
          .single();
        
        if (data) setArtistStats(data);
      };
      
      // Find friends who also rank this artist
      const findFriendsWithArtist = async () => {
        if (!friends || friends.length === 0) return;
        
        try {
          const { data: friendRankings, error } = await supabase
            .from('ranking_artists')
            .select(`
              position,
              user_rankings!inner (
                user_id,
                list_title,
                profiles!inner (
                  id,
                  username,
                  display_name
                )
              )
            `)
            .eq('artist_id', artist.id)
            .in('user_rankings.user_id', friends.map(f => f.id));
            
          if (error) throw error;
          
          const friendsWithArtist = friendRankings.map(ranking => ({
            friend: ranking.user_rankings.profiles,
            listTitle: ranking.user_rankings.list_title,
            position: ranking.position
          }));
          
          setFriendsWhoRankArtist(friendsWithArtist);
        } catch (error) {
          console.error('Error finding friends with artist:', error);
        }
      };
      
      loadStats();
      findFriendsWithArtist();
    }, [artist.id, friends]);
    
    return (
      <div 
        className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={() => setShowArtistCard(null)}
      >
        <div 
          className={`bg-slate-800 border border-white/20 p-6 ${isMobile ? 'w-full' : 'max-w-2xl w-full'} max-h-[80vh] overflow-y-auto`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-4">
              <div className={`${isMobile ? 'text-4xl' : 'text-6xl'}`}><ArtistAvatar artist={artist} size={isMobile ? "w-12 h-12" : "w-16 h-16"} /></div>
              <div>
                <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>{artist.name}</h2>
                <p className="text-gray-400">{artist.era} • {artist.region}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-sm bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                    Canon Score: {artist.canonScore}
                  </span>
                  {checkPioneerStatus(artist.id) && (
                    <span className="text-sm bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                      🏆 Pioneer Pick
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Artist Social Actions */}
            <div className="mr-4">
              <ArtistSocialActions
                artist={artist}
                currentUser={currentUser}
                onChallenge={handleSocialChallenge}
                onCompare={handleArtistCompare}
                onAddToPlaylist={(artist) => addToast(`Added ${artist.name} to playlist!`, 'success')}
              />
            </div>
            
            <button onClick={onClose} className="p-2 hover:bg-white/10 transition-colors touch-target">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Battle Stats */}
            <div className="bg-black/30 border border-white/10 p-4 rounded">
              <h3 className="font-bold mb-2">Battle Stats</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Win Rate</p>
                  <p className="text-xl font-bold">{artistStats?.win_rate || 0}%</p>
                </div>
                <div>
                  <p className="text-gray-400">Total Battles</p>
                  <p className="text-xl font-bold">{artistStats?.total_battles || 0}</p>
                </div>
              </div>
            </div>
            
            {/* Friends Who Rank This Artist */}
            {friendsWhoRankArtist.length > 0 && (
              <div className="bg-purple-500/10 border border-purple-400/30 p-4 rounded">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  Your Friends Also Rank {artist.name}
                </h3>
                <div className="space-y-2">
                  {friendsWhoRankArtist.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center">
                          <User className="w-3 h-3 text-purple-400" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-purple-300">{item.friend.username}</span>
                          <UserTierBadge userStats={item.friend} size="xs" />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">{item.listTitle}</p>
                        <p className="text-xs font-bold">#{item.position}</p>
                      </div>
                    </div>
                  ))}
                  {friendsWhoRankArtist.length > 5 && (
                    <p className="text-xs text-gray-400 text-center pt-2">
                      +{friendsWhoRankArtist.length - 5} more friends rank this artist
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {/* Similar Artists */}
            <div className="bg-black/30 border border-white/10 p-4 rounded">
              <h3 className="font-bold mb-2">Fans Also Rank High</h3>
              <div className="flex flex-wrap gap-2">
                {allArtists
                  .filter(a => a.era === artist.era && a.id !== artist.id)
                  .slice(0, 5)
                  .map(similar => (
                    <button
                      key={similar.id}
                      onClick={() => {
                        onClose();
                        setShowArtistCard(similar);
                      }}
                      className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-sm transition-colors"
                    >
                      {similar.name}
                    </button>
                  ))}
              </div>
            </div>
            
            <div className="bg-black/30 border border-white/10 p-4 rounded">
              <h3 className="font-bold mb-2">About</h3>
              <p className="text-sm text-gray-300">
                {artist.wikipedia_extract || "Loading artist information..."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Loading state with skeleton loaders
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header skeleton */}
          <div className="mb-8">
            <SkeletonLoader variant="text" className="h-8 w-48 mb-4" />
            <div className="flex gap-2">
              <SkeletonLoader variant="button" className="w-24 h-10" />
              <SkeletonLoader variant="button" className="w-24 h-10" />
              <SkeletonLoader variant="button" className="w-24 h-10" />
            </div>
          </div>
          
          {/* Content skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonLoader variant="rankingCard" />
            <SkeletonLoader variant="rankingCard" />
          </div>
          
          {/* Face-off skeleton */}
          <div className="mt-8">
            <SkeletonLoader variant="faceOff" />
          </div>
        </div>
      </div>
    );
  }

  // Main render
  if (!supabase) {
    console.error('Supabase client not provided');
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Configuration Error</h1>
          <p className="text-gray-400">Database connection not available</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className={`min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white font-sans`}>
        {/* Toast Notifications */}
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}

        {/* Daily Challenge Banner */}
        {dailyChallenge && !showTutorial && (
          <div 
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 text-center cursor-pointer hover:from-purple-700 hover:to-pink-700 transition-colors"
            onClick={() => setShowChallengeModal(true)}
          >
            <p className="text-sm font-medium flex items-center justify-center gap-2">
              <Target className="w-4 h-4" />
              Today's Challenge: {dailyChallenge.title} 
              <span className="text-xs opacity-75">(+3 bonus points per vote)</span>
            </p>
          </div>
        )}

        {/* Main scrollable container for mobile */}
        <div className={isMobile ? 'h-full overflow-y-auto overflow-x-hidden' : ''}>
          {/* Header */}
          <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/70 border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setShowCanonExplanation(true)}
                    className={`${isMobile ? 'text-xl' : 'text-2xl'} font-black tracking-tight flex items-center gap-2 hover:text-purple-400 transition-colors cursor-pointer`}
                  >
                    THE CANON
                    <Crown className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-yellow-400`} />
                  </button>
                  {!isMobile && (
                    <div className="text-xs text-gray-400 italic">Settle the Canon. Start the war.</div>
                  )}
                </div>
                <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-4'}`}>
                  {currentUser ? (
                    <>
                      {/* Gamification Display */}
                      <div className={`flex items-center ${isMobile ? 'gap-1 text-xs' : 'gap-3 text-sm'}`}>
                        {userStreak > 0 && !isMobile && (
                          <span className="flex items-center gap-1">
                            <Flame className="w-4 h-4 text-orange-400" />
                            {userStreak} day streak
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Star className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-yellow-400`} />
                          {isMobile ? userPoints.toLocaleString() : `${userPoints.toLocaleString()} points`}
                        </span>
                      </div>
                      
                      {!isMobile && (
                        <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 px-3 py-1.5">
                          <Zap className="w-4 h-4 text-purple-400" />
                          <span className="text-sm font-medium">{dailyPowerVotes} Power Votes</span>
                        </div>
                      )}
                    </>
                  ) : (
                    /* Public Preview CTA */
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-gray-400">
                        👀 Preview Mode
                      </div>
                      <button 
                        onClick={() => setShowLoginModal(true)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Sign In
                      </button>
                    </div>
                  )}
                  
                  {currentUser && (
                    <>
                      {/* Debug friend requests */}
                      {process.env.NODE_ENV === 'development' && (
                        <div className="text-xs text-gray-400 px-2">
                          FR: {friendRequests.length}
                        </div>
                      )}
                      
                      {friendRequests.length > 0 && (
                        <button 
                          onClick={() => setActiveTab('mypeople')}
                          className={`relative p-2 hover:bg-white/10 border border-white/10 transition-colors ${isMobile ? 'touch-target' : ''}`}
                          title={`${friendRequests.length} pending friend request${friendRequests.length > 1 ? 's' : ''}`}
                        >
                          <Bell className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-yellow-400`} />
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                            {friendRequests.length}
                          </div>
                        </button>
                      )}
                      
                      <div className="relative">
                        <button
                          onClick={() => setShowProfile(!showProfile)}
                          className="hover:opacity-80 transition-opacity"
                        >
                          <UserAvatar 
                            user={{ username, profile_picture_url: userProfilePicture }} 
                            profilePicture={userProfilePicture} 
                            size={isMobile ? "w-8 h-8" : "w-10 h-10"} 
                          />
                        </button>
                        
                        {/* Profile Dropdown */}
                        {showProfile && (
                          <>
                            <div 
                              className="fixed inset-0 z-40" 
                              onClick={() => setShowProfile(false)}
                            />
                            <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-white/20 shadow-2xl z-50">
                            <div className="p-4 border-b border-white/10">
                              <div className="flex items-center gap-3">
                                <UserAvatar 
                                  user={{ username, profile_picture_url: userProfilePicture }} 
                                  profilePicture={userProfilePicture} 
                                  size="w-12 h-12" 
                                />
                                <div>
                                  <p className="font-bold">{username}</p>
                                  <UserTierBadge userStats={userStats} size="sm" />
                                </div>
                              </div>
                            </div>
                            
                            {/* Stats Grid */}
                            <div className="p-4 grid grid-cols-2 gap-4 border-b border-white/10">
                              <div className="text-center">
                                <p className="text-2xl font-bold">{userPoints.toLocaleString()}</p>
                                <p className="text-xs text-gray-400">Total Points</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold">{userStreak}</p>
                                <p className="text-xs text-gray-400">Day Streak</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold">{userLists.length}</p>
                                <p className="text-xs text-gray-400">Rankings Created</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold">0</p>
                                <p className="text-xs text-gray-400">Debates Posted</p>
                              </div>
                            </div>
                            
                            {/* Taste Profile */}
                            {(() => {
                              const userRanking = userLists.find(list => list.isAllTime === true)?.artists || [];
                              if (userRanking.length > 0) {
                                const eraCounts = {};
                                userRanking.forEach(artist => {
                                  eraCounts[artist.era] = (eraCounts[artist.era] || 0) + 1;
                                });
                                const favoriteEra = Object.entries(eraCounts).sort((a, b) => b[1] - a[1])[0];
                                const uniquenessScore = calculateUniqueness({ artists: userRanking });
                                
                                return (
                                  <div className="p-4 border-b border-white/10">
                                    <h3 className="text-sm font-bold mb-2 text-gray-400">Taste Profile</h3>
                                    <div className="space-y-2">
                                      <div className="flex justify-between text-sm">
                                        <span>Favorite Era</span>
                                        <span className="text-purple-400">{favoriteEra?.[0] || 'N/A'}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span>Uniqueness Score</span>
                                        <span className="text-green-400">{uniquenessScore.percentage}%</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span>Top 10 Size</span>
                                        <span>{userRanking.length} artists</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            })()}
                            
                            {/* Achievement Badges */}
                            <div className="p-4 border-b border-white/10">
                              <h3 className="text-sm font-bold mb-2 text-gray-400">Achievements</h3>
                              <div className="flex flex-wrap gap-2">
                                {userPoints >= 1000 && <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">🏆 1K Club</span>}
                                {userStreak >= 7 && <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded">🔥 Week Warrior</span>}
                                {userLists.length >= 5 && <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">📋 List Master</span>}
                                {userStats?.pioneering_score >= 80 && <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">🏆 Pioneer</span>}
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="p-4 space-y-2">
                              <button 
                                onClick={() => {
                                  setShowProfile(false);
                                  setShowSettings(true);
                                }}
                                className="w-full py-2 text-left hover:bg-white/10 transition-colors px-3 rounded"
                              >
                                <Settings className="w-4 h-4 inline mr-2" />
                                Settings
                              </button>
                              <button 
                                onClick={() => {
                                  setShowProfile(false);
                                  supabase.auth.signOut();
                                }}
                                className="w-full py-2 text-left hover:bg-white/10 transition-colors px-3 rounded text-red-400"
                              >
                                <LogOut className="w-4 h-4 inline mr-2" />
                                Sign Out
                              </button>
                            </div>
                          </div>
                          </>
                        )}
                      </div>
                      
                      {/* Notifications Bell */}
                      <button 
                        onClick={() => setShowNotifications(true)}
                        className={`relative p-2 hover:bg-white/10 border border-white/10 transition-colors ${isMobile ? 'touch-target' : ''}`}
                  >
                    <Bell className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                    {unreadNotifications > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                      </div>
                    )}
                  </button>
                  
                      <button 
                        onClick={() => setShowSettings(true)}
                        className={`p-2 hover:bg-white/10 border border-white/10 transition-colors ${isMobile ? 'touch-target' : ''}`}
                      >
                        <Settings className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                      </button>
                      
                      {!isMobile && (
                        <button 
                          onClick={() => supabase.auth.signOut()}
                          className="p-2 hover:bg-white/10 border border-white/10 transition-colors text-sm"
                        >
                          Sign Out
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Saving Status Notification */}
          {savingStatus && (
            <div className="fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
              {savingStatus}
            </div>
          )}

          {/* Tutorial Modal */}
          {showTutorial && <Tutorial />}

          {/* Settings Modal */}
          {showSettings && (
            <div 
              className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setShowSettings(false)}
            >
              <div 
                className={`bg-slate-800 border border-white/20 p-6 ${isMobile ? 'w-full' : 'max-w-md w-full'}`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Settings</h2>
                  <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-white/10 transition-colors touch-target">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Username</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="flex-1 px-3 py-2 bg-black/50 border border-white/20 focus:border-purple-400 focus:outline-none"
                      />
                      <button 
                        onClick={async () => {
                          if (!currentUser) {
                            addToast('Please log in', 'error');
                            return;
                          }
                          
                          try {
                            const { error } = await supabase
                              .from('profiles')
                              .update({ 
                                username: username.trim(),
                                display_name: username.trim() 
                              })
                              .eq('id', currentUser.id);
                            
                            if (error) {
                              console.error('Error updating username:', error);
                              addToast('Error updating username: ' + error.message, 'error');
                            } else {
                              addToast('Username updated successfully!', 'success');
                              setShowSettings(false);
                            }
                          } catch (error) {
                            console.error('Error updating username:', error);
                            addToast('Error updating username', 'error');
                          }
                        }}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 transition-colors"
                      >
                        Update
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Can only be changed once every 30 days</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Profile Picture</label>
                    <div className="flex items-center gap-4">
                      <UserAvatar 
                        user={{ username, profile_picture_url: userProfilePicture }} 
                        profilePicture={userProfilePicture} 
                        size="w-16 h-16" 
                      />
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              uploadProfilePicture(file);
                            }
                          }}
                          className="hidden"
                          id="profile-picture-input"
                        />
                        <div className="flex gap-2">
                          <label
                            htmlFor="profile-picture-input"
                            className={`px-4 py-2 bg-purple-600 hover:bg-purple-700 transition-colors cursor-pointer text-center rounded ${
                              uploadingProfilePicture ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {uploadingProfilePicture ? 'Uploading...' : 'Upload Custom'}
                          </label>
                          <button
                            onClick={() => setShowAvatarSelector(true)}
                            disabled={uploadingProfilePicture}
                            className="px-4 py-2 bg-slate-600 hover:bg-slate-500 transition-colors rounded disabled:opacity-50"
                          >
                            Choose Avatar
                          </button>
                        </div>
                        {userProfilePicture && (
                          <button
                            onClick={async () => {
                              try {
                                const { error } = await supabase
                                  .from('profiles')
                                  .update({ profile_picture_url: null })
                                  .eq('id', currentUser.id);
                                
                                if (error) {
                                  addToast('Error removing profile picture', 'error');
                                } else {
                                  setUserProfilePicture(null);
                                  addToast('Profile picture removed', 'success');
                                }
                              } catch (error) {
                                addToast('Error removing profile picture', 'error');
                              }
                            }}
                            className="ml-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-400/50 transition-colors text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF or WebP. Max 5MB.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Email Preferences</h3>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Weekly ranking updates</span>
                    </label>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Privacy</h3>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Make my rankings public</span>
                    </label>
                  </div>
                  
                  {isMobile && (
                    <button 
                      onClick={() => supabase.auth.signOut()}
                      className="w-full py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-400/50 transition-colors text-sm"
                    >
                      Sign Out
                    </button>
                  )}
                  
                  {/* Debug Section (Development Only) */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="pt-4 border-t border-white/10">
                      <h3 className="font-medium mb-2 text-red-400">Debug Functions</h3>
                      <button
                        onClick={async () => {
                          await forceRegenerateRankings();
                          setShowSettings(false);
                        }}
                        className="w-full py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-400/50 transition-colors text-sm mb-2"
                      >
                        🔄 Force Regenerate Canon Rankings
                      </button>
                      <button
                        onClick={() => {
                          debugCleanupFriendships();
                          setShowSettings(false);
                        }}
                        className="w-full py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-400/50 transition-colors text-sm mb-2"
                      >
                        🗑️ Clean Up All Friendships
                      </button>
                      <p className="text-xs text-gray-500">
                        This will delete all friendship records for debugging
                      </p>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex gap-2 text-sm">
                      <a href="/terms" className="text-purple-400 hover:text-purple-300">Terms of Service</a>
                      <span className="text-gray-500">•</span>
                      <a href="/privacy" className="text-purple-400 hover:text-purple-300">Privacy Policy</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Face-off Modal */}
          {showFaceOff && !showProfile && faceOffs.length > 0 && (
            <div 
              className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setShowFaceOff(false)}
            >
              <div 
                className={`bg-slate-800 border border-white/20 p-6 ${isMobile ? 'w-full' : 'max-w-2xl w-full'}`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold tracking-tight flex items-center gap-2`}>
                    <Swords className="w-5 h-5" />
                    FACE-OFF
                  </h2>
                  <button onClick={() => setShowFaceOff(false)} className="p-2 hover:bg-white/10 transition-colors touch-target">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="text-center mb-4">
                  <p className="text-gray-400">Who's the better MC?</p>
                  <p className="text-sm text-purple-400 mt-1">Face-off {dailyFaceOffsCompleted + 1}/10 today</p>
                  
                  {/* Head-to-head stats */}
                  {(() => {
                    const h2h = getHeadToHeadPercentage(faceOffs[0].artist1.id, faceOffs[0].artist2.id);
                    if (h2h) {
                      return (
                        <div className="mt-3 text-xs text-gray-300">
                          <p className="mb-1">Head-to-Head Record ({h2h.totalGames} previous matchups)</p>
                          <div className="flex justify-center items-center gap-4">
                            <span className="text-blue-400">{faceOffs[0].artist1.name}: {h2h.artist1WinPercentage}%</span>
                            <span className="text-gray-500">vs</span>
                            <span className="text-red-400">{faceOffs[0].artist2.name}: {h2h.artist2WinPercentage}%</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[faceOffs[0].artist1, faceOffs[0].artist2].map((artist) => (
                    <button
                      key={artist.id}
                      onClick={() => handleFaceOffVote(artist.id)}
                      className={`group relative p-6 transition-all transform hover:scale-105 touch-target ${
                        userVotes[currentFaceOff] === artist.id 
                          ? 'bg-purple-500/20 border-2 border-purple-400' 
                          : 'bg-white/5 border border-white/10 hover:border-purple-400/50'
                      }`}
                    >
                      <div className={`${isMobile ? 'text-4xl' : 'text-6xl'} mb-3`}><ArtistAvatar artist={artist} /></div>
                      <h3 className="font-bold mb-1">{artist.name}</h3>
                      <p className="text-sm text-gray-400">{artist.era}</p>
                      <p className="text-xs text-gray-500">Canon Score: {artist.canonScore}</p>
                      {userVotes[currentFaceOff] === artist.id && (
                        <Check className="absolute top-2 right-2 w-5 h-5 text-purple-400" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Conviction Level</span>
                    <span className={convictionLevel > 75 ? 'text-purple-400 font-bold' : 'text-gray-400'}>
                      {convictionLevel}% {convictionLevel > 75 && '(Power Vote!)'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={convictionLevel}
                    onChange={(e) => setConvictionLevel(parseInt(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>

                <button 
                  onClick={() => {
                    const newFaceOff = generateFaceOff();
                    if (newFaceOff) {
                      setFaceOffs([newFaceOff]);
                      setCurrentFaceOff(0);
                    }
                  }}
                  className="w-full py-2 bg-white/10 hover:bg-white/20 border border-white/20 transition-colors text-sm"
                >
                  Get Another Face-Off
                </button>
              </div>
            </div>
          )}

          {/* Prompt to Add to List Modal */}
          {promptAddToList && selectedArtistToAdd && (
            <div 
              className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setPromptAddToList(false)}
            >
              <div 
                className="bg-slate-800 border border-white/20 p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-bold mb-4">Start Your Greatest of All Time List!</h2>
                <p className="text-gray-300 mb-6">
                  You voted for <span className="font-bold">{selectedArtistToAdd.name}</span>! 
                  Add them to your GOAT list to help settle The Canon.
                </p>
                <div className="bg-yellow-500/10 border border-yellow-400/50 p-4 rounded mb-6">
                  <p className="text-sm text-yellow-300">
                    Your GOAT list contributes to the official rankings. The more unique your picks, the more your voice counts!
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      quickAddToList(selectedArtistToAdd);
                      setPromptAddToList(false);
                      setActiveTab('mytop10');
                    }}
                    className="flex-1 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400 transition-colors font-medium"
                  >
                    Add to My Top 10
                  </button>
                  <button
                    onClick={() => setPromptAddToList(false)}
                    className="flex-1 py-2 bg-white/10 hover:bg-white/20 border border-white/20 transition-colors"
                  >
                    Not Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Create Debate Modal */}
          {showDebateModal && (
            <div 
              className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setShowDebateModal(false)}
            >
              <div 
                className={`bg-slate-800 border border-white/20 p-6 ${isMobile ? 'w-full' : 'max-w-lg w-full'} max-h-[80vh] overflow-y-auto`}
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-bold mb-4">Start a Debate</h2>
                
                <input
                  type="text"
                  placeholder="Debate title..."
                  value={debateTitle}
                  onChange={(e) => setDebateTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-black/50 border border-white/20 focus:border-purple-400 focus:outline-none mb-4"
                />
                
                <div className="relative">
                  <textarea
                    placeholder="Make your case... (use @ to mention friends)"
                    value={debateContent}
                    onChange={handleDebateContentChange}
                    className="w-full px-4 py-2 bg-black/50 border border-white/20 focus:border-purple-400 focus:outline-none h-32 mb-4"
                  />
                  
                  {/* Friend mention dropdown */}
                  {showMentionDropdown && (
                    <div className="absolute top-full left-0 w-full max-h-48 overflow-y-auto bg-slate-700 border border-white/20 shadow-lg z-10">
                      {friends
                        .filter(friend => 
                          friend.username.toLowerCase().includes(mentionSearchQuery.toLowerCase())
                        )
                        .slice(0, 5)
                        .map(friend => (
                          <button
                            key={friend.id}
                            onClick={() => insertMention(friend)}
                            className="w-full px-4 py-2 text-left hover:bg-white/10 flex items-center gap-2 transition-colors"
                          >
                            <UserAvatar 
                              user={friend} 
                              profilePicture={friend.profile_picture_url} 
                              size="w-6 h-6" 
                            />
                            {friend.username}
                          </button>
                        ))
                      }
                      {friends.filter(friend => 
                        friend.username.toLowerCase().includes(mentionSearchQuery.toLowerCase())
                      ).length === 0 && (
                        <p className="px-4 py-2 text-gray-400 text-sm">No friends found</p>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Artist Tags */}
                <div className="mb-4">
                  <label className="text-sm font-medium mb-2 block">Tag Artists (optional)</label>
                  
                  {/* Selected tags */}
                  {selectedArtistTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedArtistTags.map(artist => (
                        <span
                          key={artist.id}
                          className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        >
                          <ArtistAvatar artist={artist} /> {artist.name}
                          <button
                            onClick={() => setSelectedArtistTags(prev => prev.filter(a => a.id !== artist.id))}
                            className="hover:text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Tag search */}
                  <div className="relative tag-search-container">
                    <input
                      type="text"
                      placeholder="Search artists to tag..."
                      value={tagSearchQuery}
                      onChange={(e) => {
                        setTagSearchQuery(e.target.value);
                        setShowTagSearch(true);
                      }}
                      onFocus={() => setShowTagSearch(true)}
                      className="w-full px-4 py-2 bg-black/50 border border-white/20 focus:border-purple-400 focus:outline-none"
                    />
                    
                    {showTagSearch && tagSearchQuery && (
                      <div className="absolute top-full mt-1 w-full bg-slate-700 border border-white/20 max-h-48 overflow-y-auto z-10">
                        {searchArtists(tagSearchQuery).map(artist => (
                          <button
                            key={artist.id}
                            onClick={() => {
                              if (!selectedArtistTags.find(a => a.id === artist.id)) {
                                setSelectedArtistTags([...selectedArtistTags, artist]);
                              }
                              setTagSearchQuery('');
                              setShowTagSearch(false);
                            }}
                            className="w-full p-2 hover:bg-white/10 flex items-center gap-2 text-left"
                          >
                            <span className="text-xl"><ArtistAvatar artist={artist} /></span>
                            <span>{artist.name}</span>
                          </button>
                        ))}
                        {/* Always show Add Rapper button if no exact match */}
                        {tagSearchQuery.length > 1 && !searchArtists(tagSearchQuery).some(artist => 
                          artist.name.toLowerCase() === tagSearchQuery.toLowerCase()
                        ) && (
                          <button
                            onClick={() => {
                              setShowArtistRequestModal(true);
                              setRequestedArtistName(tagSearchQuery);
                              setShowTagSearch(false);
                            }}
                            className="w-full p-2 hover:bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center gap-2 text-left"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Can't find who you're looking for? Request "{tagSearchQuery}"</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <LoadingButton
                    onClick={createDebate}
                    loading={isPostingDebate}
                    loadingText="Posting..."
                    className="flex-1"
                    icon={<MessageCircle className="w-4 h-4" />}
                  >
                    Post Debate
                  </LoadingButton>
                  <button
                    onClick={() => {
                      setShowDebateModal(false);
                      setDebateTitle('');
                      setDebateContent('');
                      setSelectedArtistTags([]);
                      setMentionedFriends([]);
                      setShowMentionDropdown(false);
                    }}
                    className="flex-1 py-2 bg-white/10 hover:bg-white/20 border border-white/20 transition-colors"
                    disabled={isPostingDebate}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reply Modal */}
          {showReplyModal && replyingTo && (
            <div 
              className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setShowReplyModal(false)}
            >
              <div 
                className={`bg-slate-800 border border-white/20 p-6 ${isMobile ? 'w-full' : 'max-w-lg w-full'}`}
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-bold mb-4">Reply to Debate</h2>
                
                <div className="bg-black/30 p-3 mb-4 rounded">
                  <p className="text-sm text-gray-400">Replying to:</p>
                  <p className="font-bold">{replyingTo.title}</p>
                </div>
                
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (replyContent.trim() && !isPostingReply) {
                        postReply();
                      }
                    }
                  }}
                  placeholder="Share your thoughts... (Enter to post, Shift+Enter for new line)"
                  className="w-full px-4 py-2 bg-black/50 border border-white/20 focus:border-purple-400 focus:outline-none h-32 mb-4 resize-none"
                />
                
                <div className="flex gap-3">
                  <button
                    onClick={postReply}
                    disabled={isPostingReply || !replyContent.trim()}
                    className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    {isPostingReply && (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    {isPostingReply ? 'Posting...' : 'Post Reply'}
                  </button>
                  <button
                    onClick={() => {
                      setShowReplyModal(false);
                      setReplyContent('');
                      setReplyingTo(null);
                    }}
                    className="flex-1 py-2 bg-white/10 hover:bg-white/20 border border-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Report Modal */}
          <ReportModal
            isOpen={showReportModal}
            onClose={() => {
              setShowReportModal(false);
              setReportContent(null);
            }}
            contentType={reportContent?.type}
            contentId={reportContent?.id}
            supabase={supabase}
            onSuccess={() => console.log('Report submitted')}
          />

          {/* Top 100 Modal */}
          {showTop100Modal && (
            <div 
              className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden"
              onClick={() => setShowTop100Modal(false)}
            >
              <div 
                className={`bg-slate-800 border border-white/20 ${isMobile ? 'p-3 w-full h-full' : 'p-6 max-w-4xl w-full'} ${isMobile ? 'max-h-full' : 'max-h-[80vh]'} flex flex-col overflow-hidden rounded-lg`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold tracking-tight flex items-center gap-2`}>
                    <Trophy className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-yellow-400`} />
                    THE CANON TOP 100+
                  </h2>
                  <button onClick={() => setShowTop100Modal(false)} className="p-2 hover:bg-white/10 transition-colors touch-target">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-hidden">
                  <VirtualList
                    items={fullRankings}
                    itemHeight={isMobile ? 60 : 80}
                    containerHeight={isMobile ? (typeof window !== 'undefined' ? window.innerHeight - 200 : 500) : 600}
                    className="pr-2"
                    renderItem={(item) => (
                      <div 
                        key={item.rank} 
                        className={`flex items-center ${isMobile ? 'gap-2 p-2' : 'gap-3 p-3'} bg-black/30 border cursor-pointer hover:bg-white/5 mb-2 ${
                          item.trend === 'hot' ? 'border-orange-400/50 bg-orange-500/5' : 'border-white/10'
                        }`}
                        onClick={() => setShowArtistCard(item.artist)}
                      >
                        <div className={`${isMobile ? 'w-8' : 'w-12'} text-center flex-shrink-0`}>
                          <span className={`${isMobile ? 'text-sm' : 'text-xl'} font-bold text-gray-400`}>#{item.rank}</span>
                        </div>
                        
                        <div className={`${isMobile ? 'w-5' : 'w-8'} flex-shrink-0`}>
                          {item.trend === 'up' && <ArrowUp className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-green-400`} />}
                          {item.trend === 'down' && <ArrowDown className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-red-400`} />}
                          {item.trend === 'hot' && <Flame className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-orange-400`} />}
                        </div>
                        
                        <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} flex-shrink-0`}>
                          <ArtistAvatar artist={item.artist} size={isMobile ? 'w-8 h-8' : 'w-10 h-10'} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold truncate ${isMobile ? 'text-sm' : 'text-base'}`}>{item.artist.name}</p>
                          {!isMobile && item.artist.era && (
                            <p className="text-sm text-gray-400 truncate">{item.artist.era}</p>
                          )}
                          {isMobile && item.artist.era && (
                            <p className="text-xs text-gray-400 truncate">{item.artist.era}</p>
                          )}
                        </div>
                        
                        <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2'} flex-shrink-0`}>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              quickAddToList(item.artist);
                            }}
                            className={`${isMobile ? 'p-1' : 'p-1.5'} hover:bg-white/10 border border-white/10 transition-colors touch-target`}
                            title="Add to My Top 10"
                          >
                            <Plus className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                          </button>
                          <div className="text-right">
                            <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>{item.canonScore || item.totalPoints.toFixed(1)}</p>
                            <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-500`}>{item.votes} vote{item.votes !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    emptyState={
                      <div className="text-center py-12 text-gray-400">
                        <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No rankings available yet</p>
                      </div>
                    }
                  />
                  
                  {false && loadedRankings < fullRankings.length && (
                    <div className="text-center py-8 text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading more... ({loadedRankings} of {fullRankings.length})
                      </div>
                    </div>
                  )}
                  
                  {loadedRankings >= fullRankings.length && fullRankings.length > 50 && (
                    <div className="text-center py-8 text-gray-500">
                      🎉 You've reached the end! {fullRankings.length} total artists
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Daily Challenge Modal */}
          {showChallengeModal && dailyChallenge && (
            <div 
              className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setShowChallengeModal(false)}
            >
              <div 
                className={`bg-slate-800 border border-white/20 p-6 ${isMobile ? 'w-full' : 'max-w-lg w-full'} max-h-[80vh] overflow-y-auto`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-400" />
                    Today's Challenge
                  </h2>
                  <button
                    onClick={() => setShowChallengeModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-purple-300 mb-2">{dailyChallenge.title}</h3>
                  <p className="text-sm text-gray-300 mb-3">{dailyChallenge.description}</p>
                  
                  <div className="flex items-center gap-2 text-sm text-yellow-400">
                    <Trophy className="w-4 h-4" />
                    <span className="font-medium">Bonus: +3 points per vote</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-purple-300 mb-2">How it works:</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Face-offs will focus on {dailyChallenge.title.toLowerCase()}</li>
                      <li>• Each vote earns you 3 bonus points instead of 1</li>
                      <li>• Challenge resets daily at midnight</li>
                      <li>• Participate to climb the leaderboard faster!</li>
                    </ul>
                  </div>
                  
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <p className="text-sm text-gray-400">
                      <strong>Pro tip:</strong> Use high conviction votes (75%+) during daily challenges 
                      to maximize your bonus points and show your expertise!
                    </p>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        setShowChallengeModal(false);
                        // Generate a new face-off for the challenge
                        const newFaceOff = generateFaceOff();
                        if (newFaceOff) {
                          setFaceOffs([newFaceOff]);
                          setCurrentFaceOff(0);
                          setShowFaceOff(true);
                        } else {
                          addToast('Unable to generate face-off. Try again later.', 'error');
                        }
                      }}
                      className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 transition-colors text-sm font-medium rounded"
                    >
                      Start Challenge
                    </button>
                    <button
                      onClick={() => setShowChallengeModal(false)}
                      className="px-4 py-2 bg-slate-600 hover:bg-slate-700 transition-colors text-sm rounded"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Battle Modal */}
          {showBattleModal && (
            <div 
              className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setShowBattleModal(false)}
            >
              <div 
                className={`bg-slate-800 border border-white/20 p-6 ${isMobile ? 'w-full' : 'max-w-lg w-full'} max-h-[80vh] overflow-y-auto`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Swords className="w-5 h-5 text-red-400" />
                    Challenge a Friend
                  </h2>
                  <button
                    onClick={() => setShowBattleModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Friend:</label>
                    <select 
                      value={selectedFriend}
                      onChange={(e) => setSelectedFriend(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-white/20 rounded focus:border-purple-400 focus:outline-none"
                    >
                      <option value="">Choose a friend...</option>
                      {friends.map(friend => (
                        <option key={friend.id} value={friend.id}>{friend.username}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Face-off Type:</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          name="battleType" 
                          value="random" 
                          checked={battleType === 'random'}
                          onChange={(e) => setBattleType(e.target.value)}
                          className="text-purple-500" 
                        />
                        <span className="text-sm">Random artists from database</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          name="battleType" 
                          value="custom" 
                          checked={battleType === 'custom'}
                          onChange={(e) => setBattleType(e.target.value)}
                          className="text-purple-500" 
                        />
                        <span className="text-sm">Custom artist matchup</span>
                      </label>
                    </div>
                  </div>
                  
                  {battleType === 'custom' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-2">Artist 1:</label>
                        <select 
                          value={battleArtist1}
                          onChange={(e) => setBattleArtist1(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-700 border border-white/20 rounded focus:border-purple-400 focus:outline-none text-sm"
                        >
                          <option value="">Select artist...</option>
                          {allArtists
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map(artist => (
                            <option key={artist.id} value={artist.id}>{artist.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Artist 2:</label>
                        <select 
                          value={battleArtist2}
                          onChange={(e) => setBattleArtist2(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-700 border border-white/20 rounded focus:border-purple-400 focus:outline-none text-sm"
                        >
                          <option value="">Select artist...</option>
                          {allArtists
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map(artist => (
                            <option key={artist.id} value={artist.id}>{artist.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                  
                  {battleType === 'custom' && battleArtist1 && battleArtist2 && battleArtist1 !== battleArtist2 && (
                    <div className="bg-slate-700/50 rounded-lg p-3">
                      <p className="text-sm text-gray-300 text-center">
                        <strong>{allArtists.find(a => a.id == battleArtist1)?.name}</strong> vs <strong>{allArtists.find(a => a.id == battleArtist2)?.name}</strong>
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Message (optional):</label>
                    <textarea 
                      value={battleMessage}
                      onChange={(e) => setBattleMessage(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-white/20 rounded focus:border-purple-400 focus:outline-none"
                      rows="2"
                      placeholder="Add a message with your challenge..."
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={async () => {
                        if (!selectedFriend) {
                          addToast('Please select a friend', 'error');
                          return;
                        }
                        
                        if (battleType === 'custom' && (!battleArtist1 || !battleArtist2 || battleArtist1 === battleArtist2)) {
                          addToast('Please select two different artists', 'error');
                          return;
                        }
                        
                        console.log('Current user:', currentUser);
                        console.log('Selected friend:', selectedFriend);
                        console.log('Battle type:', battleType);
                        
                        const challengeData = {
                          challenger_id: currentUser.id,
                          challenged_id: selectedFriend,
                          status: 'pending',
                          challenge_type: battleType,
                          message: battleMessage || null
                        };
                        
                        try {
                          
                          if (battleType === 'custom') {
                            challengeData.artist1_id = parseInt(battleArtist1);
                            challengeData.artist2_id = parseInt(battleArtist2);
                          }
                          
                          console.log('Sending challenge data:', challengeData);
                          
                          const { data, error } = await supabase
                            .from('friend_challenges')
                            .insert(challengeData)
                            .select();
                            
                          console.log('Challenge insert result - data:', data, 'error:', error);
                          
                          if (error) throw error;
                          
                          // Send notification and email
                          await createChallengeNotification(
                            selectedFriend,
                            currentUser.id,
                            battleType,
                            battleMessage
                          );
                          
                          setShowBattleModal(false);
                          setSelectedFriend('');
                          setBattleArtist1('');
                          setBattleArtist2('');
                          setBattleType('random');
                          setBattleMessage('');
                          addToast('Challenge sent successfully!', 'success');
                        } catch (error) {
                          console.error('Error sending challenge:', error);
                          console.error('Challenge data:', challengeData);
                          addToast(`Failed to send challenge: ${error.message}`, 'error');
                        }
                      }}
                      disabled={!selectedFriend || (battleType === 'custom' && (!battleArtist1 || !battleArtist2 || battleArtist1 === battleArtist2))}
                      className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-sm font-medium rounded"
                    >
                      Send Challenge
                    </button>
                    <button
                      onClick={() => {
                        setShowBattleModal(false);
                        setSelectedFriend('');
                        setBattleArtist1('');
                        setBattleArtist2('');
                        setBattleType('random');
                        setBattleMessage('');
                      }}
                      className="px-4 py-2 bg-slate-600 hover:bg-slate-700 transition-colors text-sm rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className={`sticky ${isMobile ? 'top-[60px]' : 'top-16'} z-40 bg-slate-900/70 backdrop-blur-xl border-b border-white/10`}>
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('foryou')}
                  className={`flex-1 py-4 font-medium tracking-tight transition-colors relative ${
                    activeTab === 'foryou' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                  } ${isMobile ? 'text-sm' : ''}`}
                >
                  FOR YOU
                  {activeTab === 'foryou' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
                  )}
                </button>
                <button
                  onClick={() => {
                    if (requireAuth('create top 10')) {
                      setActiveTab('mytop10');
                    }
                  }}
                  className={`flex-1 py-4 font-medium tracking-tight transition-colors relative ${
                    activeTab === 'mytop10' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                  } ${isMobile ? 'text-sm' : ''}`}
                >
                  {getTabName()}
                  {activeTab === 'mytop10' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
                  )}
                </button>
                <button
                  onClick={() => {
                    if (requireAuth('connect with friends')) {
                      setActiveTab('mypeople');
                    }
                  }}
                  className={`flex-1 py-4 font-medium tracking-tight transition-colors relative ${
                    activeTab === 'mypeople' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                  } ${isMobile ? 'text-sm' : ''}`}
                >
                  MY PEOPLE
                  {friendRequests.length > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {friendRequests.length}
                    </div>
                  )}
                  {activeTab === 'mypeople' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 py-6">
            {console.log('🔍 Current activeTab in main content:', activeTab)}
            {activeTab === 'foryou' ? (
              <div className="space-y-6">
                {/* Tournament Widget - Secondary Feature */}
                {currentTournament && (
                  <TournamentWidget 
                    tournament={currentTournament}
                    currentUser={currentUser}
                    onSubmitEntry={() => {
                      // TODO: Implement tournament submission
                      setShowTournamentBracket(true);
                    }}
                    onExpandBracket={() => setShowTournamentBracket(true)}
                  />
                )}
                
                {/* Enhanced Top 10 Canon - Primary Feature */}
                <div className="space-y-4">
                  {/* Canon Header with Activity */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-yellow-400" />
                        THE CANON
                      </h2>
                      <p className="text-sm text-gray-400 mt-1">
                        All-time greatest, ranked by the community
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Live indicator */}
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-full">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-xs text-green-400">Live</span>
                      </div>
                      {/* Total voters count */}
                      <div className="text-xs text-gray-400">
                        {totalVoters} voters
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced Top 10 List - Gold Accented */}
                  {fullRankings.length > 0 && (
                    <div className="relative bg-gradient-to-br from-yellow-900/20 via-amber-900/15 to-orange-900/20 border-2 border-yellow-500/40 rounded-lg p-4 shadow-[0_0_30px_rgba(250,204,21,0.15)]">
                      {/* Gold corner accents */}
                      <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-yellow-400/60 rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-yellow-400/60 rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-yellow-400/60 rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-yellow-400/60 rounded-br-lg" />
                      <div className="space-y-2">
                        {fullRankings.slice(0, 10).map((item, idx) => {
                          const recentChange = Math.random() > 0.7 ? Math.floor(Math.random() * 3) - 1 : 0;
                          const isYourVote = Math.random() > 0.8;
                          const isNumberOne = item.rank === 1;
                          
                          return (
                            <div 
                              key={idx} 
                              className={`relative flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                                isNumberOne 
                                  ? 'bg-gradient-to-r from-yellow-900/40 via-amber-800/30 to-yellow-900/40 border-2 border-yellow-400/50 shadow-[0_0_20px_rgba(250,204,21,0.25)]' 
                                  : 'bg-black/30 hover:bg-white/5'
                              } ${
                                item.trend === 'hot' && !isNumberOne ? 'ring-2 ring-orange-400/50' : ''
                              }`}
                              onClick={() => setShowArtistCard(item.artist)}
                            >
                              {/* Crown for #1 */}
                              {isNumberOne && (
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                  <Crown className="w-6 h-6 text-yellow-400 animate-pulse" />
                                </div>
                              )}
                              <div className="text-center w-12">
                                <span className={`text-2xl font-bold ${
                                  isNumberOne ? 'text-yellow-400' : 'text-gray-400'
                                }`}>
                                  {isNumberOne ? (
                                    <span className="text-3xl font-black">#1</span>
                                  ) : (
                                    `#${item.rank}`
                                  )}
                                </span>
                              </div>
                              
                              <div className="w-8">
                                {recentChange > 0 && <ArrowUp className="w-4 h-4 text-green-400" />}
                                {recentChange < 0 && <ArrowDown className="w-4 h-4 text-red-400" />}
                                {item.trend === 'hot' && <Flame className="w-4 h-4 text-orange-400 animate-pulse" />}
                              </div>
                              
                              <div className="w-12 h-12">
                                <ArtistAvatar artist={item.artist} size="w-12 h-12" />
                              </div>
                              
                              <div className="flex-1">
                                <p className="font-bold text-lg">{item.artist.name}</p>
                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                  {item.artist.era && <span>{item.artist.era}</span>}
                                  {isYourVote && (
                                    <span className="text-purple-400 flex items-center gap-1">
                                      <Check className="w-3 h-3" />
                                      Your vote helped
                                    </span>
                                  )}
                                  {friends.length > 0 && Math.random() > 0.5 && (
                                    <span className="text-blue-400">
                                      {Math.floor(Math.random() * 3) + 1} friends agree
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <p className={`text-lg font-bold ${
                                  isNumberOne ? 'text-yellow-300' : 'text-yellow-400'
                                }`}>
                                  {item.canonScore || Math.round(item.totalPoints)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {item.votes} votes
                                  {isNumberOne && (
                                    <span className="block text-yellow-400/70 text-[10px] font-medium mt-1">REIGNING</span>
                                  )}
                                </p>
                              </div>
                              
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  quickAddToList(item.artist);
                                }}
                                className="p-2 hover:bg-white/10 rounded transition-colors"
                                title="Add to My Top 10"
                              >
                                <Plus className="w-5 h-5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Bottom expand button */}
                      <div className="mt-4 pt-4 border-t border-yellow-500/30">
                        <button 
                          onClick={() => setShowTop100Modal(true)}
                          className="w-full py-3 text-center bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                        >
                          <Trophy className="w-5 h-5" />
                          View Full Top 100+ Rankings
                          <ChevronDown className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="mt-3 flex justify-between text-xs text-gray-400">
                        <span>{totalVoters} total voters</span>
                        <span>Updated live</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Top Section - Hot Debates + All-Time Top 10 */}
                <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'} gap-6`}>
                  {/* Hot Debates - Left Side */}
                  <div className={isMobile ? '' : 'lg:col-span-2'}>
                    <h2 className="text-lg font-bold tracking-tight mb-4">HOT DEBATES</h2>
                    
                    {/* Your Debates Section */}
                    {realDebates.filter(d => d.isOwn).length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-md font-bold tracking-tight mb-3 text-purple-400">YOUR DEBATES</h3>
                        <div className="space-y-4">
                          {realDebates.filter(d => d.isOwn).map((debate) => (
                            <div key={debate.id} className="bg-slate-800/50 border border-purple-400/30 p-4">
                              <div className="flex gap-3">
                                <UserAvatar 
                                  user={debate.userProfile} 
                                  profilePicture={debate.profilePicture} 
                                  size="w-10 h-10" 
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <button 
                                      onClick={() => handleUsernameClick(debate.userProfile)}
                                      className="font-bold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                                    >
                                      {debate.user}
                                    </button>
                                    <UserTierBadge userStats={debate.userProfile} size="xs" />
                                    <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5">Your debate</span>
                                    {debate.hot && <Flame className="w-4 h-4 text-orange-500" />}
                                    <span className="text-gray-500 text-sm ml-auto">{debate.timestamp}</span>
                                  </div>
                                  <h4 className="font-bold mb-1">{debate.title}</h4>
                                  <p className="mb-2 leading-relaxed">{renderDebateContent(debate.content)}</p>
                                  
                                  {/* Artist Tags */}
                                  {debate.artistTags.length > 0 && (
                                    <div className="flex flex-wrap items-end gap-2 mb-3">
                                      {debate.artistTags.map((artistId) => {
                                        const artist = allArtists.find(a => a.id === artistId);
                                        return artist ? (
                                          <span key={artistId} className="inline-flex items-center gap-1 text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                                            {artist.avatar_url ? (
                                              <>
                                                <span className="flex-shrink-0"><ArtistAvatar artist={artist} /></span>
                                                <span className="break-words">{artist.name}</span>
                                              </>
                                            ) : (
                                              <span className="break-words">{artist.name}</span>
                                            )}
                                          </span>
                                        ) : null;
                                      })}
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center gap-4">
                                    <button 
                                      onClick={() => {
                                        if (!currentUser) {
                                          addToast('Please sign in to like debates', 'warning');
                                          return;
                                        }
                                        toggleLike('debate', debate.id);
                                      }}
                                      className={`flex items-center gap-1 text-sm transition-colors ${
                                        debateLikes[debate.id]?.userLiked 
                                          ? 'text-purple-400' 
                                          : 'hover:text-purple-400'
                                      }`}
                                    >
                                      <Heart 
                                        className={`w-4 h-4 ${debateLikes[debate.id]?.userLiked ? 'fill-current' : ''}`} 
                                      />
                                      {debateLikes[debate.id]?.count || 0}
                                    </button>
                                    <button 
                                      onClick={() => toggleComments(debate.id)}
                                      className="flex items-center gap-1 text-sm hover:text-purple-400 transition-colors"
                                    >
                                      <MessageCircle className="w-4 h-4" />
                                      {debate.replies}
                                    </button>
                                    <button className="flex items-center gap-1 text-sm hover:text-purple-400 transition-colors">
                                      <Share2 className="w-4 h-4" />
                                    </button>
                                  </div>

                                  {/* Reply button */}
                                  <div className="mt-3 pt-3 border-t border-white/10">
                                    <button 
                                      onClick={() => {
                                        setReplyingTo(debate);
                                        setShowReplyModal(true);
                                      }}
                                      className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                                    >
                                      + Reply to this debate
                                    </button>
                                  </div>

                                  {/* Comments Thread */}
                                  {expandedComments[debate.id] && (
                                    <div className="mt-4 pl-4 border-l-2 border-purple-500/30 space-y-3">
                                      {debateComments[debate.id]?.length > 0 ? (
                                        debateComments[debate.id].map((comment) => (
                                          <div key={comment.id} className="bg-slate-700/30 p-3 rounded">
                                            <div className="flex items-center gap-2 mb-1">
                                              <span className="font-medium text-sm">{comment.author}</span>
                                              <span className="text-xs text-gray-500">{comment.timestamp}</span>
                                            </div>
                                            <p className="text-sm text-gray-300 mb-2">{comment.content}</p>
                                            <div className="flex items-center gap-2">
                                              <button 
                                                onClick={() => toggleLike('comment', comment.id)}
                                                className={`flex items-center gap-1 text-xs transition-colors ${
                                                  commentLikes[comment.id]?.userLiked 
                                                    ? 'text-purple-400' 
                                                    : 'hover:text-purple-400'
                                                }`}
                                              >
                                                <Heart 
                                                  className={`w-3 h-3 ${commentLikes[comment.id]?.userLiked ? 'fill-current' : ''}`} 
                                                />
                                                {commentLikes[comment.id]?.count || 0}
                                              </button>
                                            </div>
                                          </div>
                                        ))
                                      ) : (
                                        <p className="text-sm text-gray-500 italic">No comments yet. Be the first to reply!</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {/* Bottom expand button */}
                          <div className="mt-3 pt-2 border-t border-white/10">
                            <button 
                              onClick={() => setShowTop100Modal(true)}
                              className={`w-full py-2 text-center text-yellow-400 hover:text-yellow-300 hover:bg-white/5 rounded transition-colors ${isMobile ? 'text-sm' : 'text-xs'}`}
                            >
                              View Full Top 100+ →
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* All Debates */}
                    <div className="space-y-4">
                      {/* Show real debates first */}
                      {realDebates.filter(d => !d.isOwn).map((debate) => (
                        <div key={debate.id} className="bg-slate-800/50 border border-white/10 p-4">
                          <div className="flex gap-3">
                            <UserAvatar 
                              user={debate.userProfile} 
                              profilePicture={debate.profilePicture} 
                              size="w-10 h-10" 
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <button 
                                  onClick={() => handleUsernameClick(debate.userProfile)}
                                  className="font-bold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                                >
                                  {debate.user}
                                </button>
                                <UserTierBadge userStats={debate.userProfile} size="xs" />
                                {debate.hot && <Flame className="w-4 h-4 text-orange-500" />}
                                <span className="text-gray-500 text-sm ml-auto">{debate.timestamp}</span>
                              </div>
                              <h4 className="font-bold mb-1">{debate.title}</h4>
                              <p className="mb-2 leading-relaxed">{renderDebateContent(debate.content)}</p>
                              
                              {/* Artist Tags */}
                              {debate.artistTags.length > 0 && (
                                <div className="flex gap-2 mb-3">
                                  {debate.artistTags.map((artistId) => {
                                    const artist = allArtists.find(a => a.id === artistId);
                                    return artist ? (
                                      <span key={artistId} className="inline-flex items-center gap-1 text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                                        {artist.avatar_url ? (
                                          <>
                                            <span className="flex-shrink-0"><ArtistAvatar artist={artist} /></span>
                                            <span className="break-words">{artist.name}</span>
                                          </>
                                        ) : (
                                          <span className="break-words">{artist.name}</span>
                                        )}
                                      </span>
                                    ) : null;
                                  })}
                                </div>
                              )}
                              
                              <div className="flex items-center gap-4">
                                <button 
                                  onClick={() => {
                                    if (requireAuth('like debates')) {
                                      toggleLike('debate', debate.id);
                                    }
                                  }}
                                  className={`flex items-center gap-1 text-sm transition-colors ${
                                    debateLikes[debate.id]?.userLiked 
                                      ? 'text-purple-400' 
                                      : 'hover:text-purple-400'
                                  }`}
                                >
                                  <Heart 
                                    className={`w-4 h-4 ${debateLikes[debate.id]?.userLiked ? 'fill-current' : ''}`} 
                                  />
                                  {debateLikes[debate.id]?.count || 0}
                                </button>
                                <button 
                                  onClick={() => toggleComments(debate.id)}
                                  className="flex items-center gap-1 text-sm hover:text-purple-400 transition-colors"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  {debate.replies}
                                </button>
                                <button className="flex items-center gap-1 text-sm hover:text-purple-400 transition-colors">
                                  <Share2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setReportContent({ type: 'debate', id: debate.id });
                                    setShowReportModal(true);
                                  }}
                                  className="flex items-center gap-1 text-sm hover:text-red-400 transition-colors ml-auto"
                                >
                                  <AlertCircle className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Reply button */}
                              <div className="mt-3 pt-3 border-t border-white/10">
                                <button 
                                  onClick={() => {
                                    setReplyingTo(debate);
                                    setShowReplyModal(true);
                                  }}
                                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                                >
                                  + Reply to this debate
                                </button>
                              </div>

                              {/* Comments Thread */}
                              {expandedComments[debate.id] && (
                                <div className="mt-4 pl-4 border-l-2 border-purple-500/30 space-y-3">
                                  {debateComments[debate.id]?.length > 0 ? (
                                    debateComments[debate.id].map((comment) => (
                                      <div key={comment.id} className="bg-slate-700/30 p-3 rounded">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-medium text-sm">{comment.author}</span>
                                          <span className="text-xs text-gray-500">{comment.timestamp}</span>
                                        </div>
                                        <p className="text-sm text-gray-300 mb-2">{comment.content}</p>
                                        <div className="flex items-center gap-2">
                                          <button 
                                            onClick={() => toggleLike('comment', comment.id)}
                                            className={`flex items-center gap-1 text-xs transition-colors ${
                                              commentLikes[comment.id]?.userLiked 
                                                ? 'text-purple-400' 
                                                : 'hover:text-purple-400'
                                            }`}
                                          >
                                            <Heart 
                                              className={`w-3 h-3 ${commentLikes[comment.id]?.userLiked ? 'fill-current' : ''}`} 
                                            />
                                            {commentLikes[comment.id]?.count || 0}
                                          </button>
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-sm text-gray-500 italic">No comments yet. Be the first to reply!</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* All-Time Top 10 - Right Side (Compact) */}
                  {fullRankings.length > 0 && (
                    <div className={isMobile ? '' : 'lg:col-span-1'}>
                      <div className="bg-slate-800/50 border-2 border-yellow-400/50 p-3">
                        <div className="flex items-center justify-between mb-3">
                        <h3 className={`font-bold tracking-tight flex items-center gap-1.5 ${isMobile ? 'text-base' : 'text-sm'}`}>
                          <Trophy className={`text-yellow-400 ${isMobile ? 'w-4 h-4' : 'w-3.5 h-3.5'}`} />
                          GREATEST OF ALL TIME
                        </h3>
                        <button 
                          onClick={() => setShowTop100Modal(true)}
                          className={`text-yellow-400 hover:text-yellow-300 ${isMobile ? 'text-sm' : 'text-xs'}`}
                        >
                          Top 100 →
                        </button>
                      </div>
                        
                        <div className="space-y-1">
                          {fullRankings.slice(0, 10).map((item, idx) => {
                            const isNumberOne = item.rank === 1;
                            return (
                              <div 
                                key={idx} 
                                className={`flex items-center gap-2 px-2 py-1 ${isMobile ? 'text-sm' : 'text-xs'} cursor-pointer hover:bg-white/5 ${
                                  isNumberOne ? 'bg-gradient-to-r from-yellow-900/30 to-transparent border-l-2 border-yellow-400' :
                                  item.trend === 'hot' ? 'bg-orange-500/10 border-l-2 border-orange-400' : ''
                                }`}
                                onClick={() => setShowArtistCard(item.artist)}
                              >
                                <div className={`text-center ${isMobile ? 'w-10' : 'w-8'}`}>
                                  {isNumberOne ? (
                                    <span className="font-bold text-yellow-400 flex items-center gap-0.5">
                                      <Crown className="w-3 h-3" />
                                      <span>1</span>
                                    </span>
                                  ) : (
                                    <span className="font-bold text-gray-500">#{item.rank}</span>
                                  )}
                                </div>
                                
                                <div className={isMobile ? 'w-5' : 'w-4'}>
                                  {item.trend === 'up' && <ArrowUp className={`text-green-400 ${isMobile ? 'w-4 h-4' : 'w-3 h-3'}`} />}
                                  {item.trend === 'down' && <ArrowDown className={`text-red-400 ${isMobile ? 'w-4 h-4' : 'w-3 h-3'}`} />}
                                  {item.trend === 'hot' && <Flame className={`text-orange-400 ${isMobile ? 'w-4 h-4' : 'w-3 h-3'}`} />}
                                </div>
                                
                                <div className={isMobile ? 'text-xl' : 'text-lg'}>
                                  <ArtistAvatar artist={item.artist} size={isMobile ? 'w-8 h-8' : 'w-6 h-6'} />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{item.artist.name}</p>
                                  {friends.length > 0 && (
                                    <p className="text-xs text-purple-400 mt-0.5">
                                      {Math.floor(Math.random() * 3) + 1} friends rank this artist
                                    </p>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      quickAddToList(item.artist);
                                    }}
                                    className={`hover:bg-white/10 rounded ${isMobile ? 'p-1 touch-target' : 'p-0.5'}`}
                                    title="Add to My Top 10"
                                  >
                                    <Plus className={isMobile ? 'w-4 h-4' : 'w-3 h-3'} />
                                  </button>
                                  <span className={`text-gray-500 ${isMobile ? 'text-sm' : 'text-xs'}`}>{item.canonScore || Math.round(item.totalPoints)}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className={`mt-3 pt-3 border-t border-white/10 flex justify-between text-gray-400 ${isMobile ? 'text-sm' : 'text-xs'}`}>
                          <span>{totalVoters} {totalVoters === 1 ? 'voter' : 'voters'}</span>
                          <span>Avg unique: 6.8</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Live Friend Activity Feed for For You Tab */}
                <div className="mt-8">
                  <LiveActivityFeed
                    supabase={supabase}
                    currentUser={currentUser}
                    friends={friends}
                    onUserClick={handleUserClick}
                    onArtistClick={setShowArtistCard}
                  />
                </div>
              </div>
            ) : activeTab === 'mytop10' ? (
              <div className="space-y-6">
                {/* All-Time List Section */}
                {!hasAllTimeList ? (
                  // Show create prompt only if no all-time list exists
                  <div className="bg-yellow-500/10 border-2 border-yellow-400/50 p-6 text-center">
                    <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                    <h2 className="text-xl font-bold mb-2">Create Your Greatest of All Time List</h2>
                    <p className="text-gray-300 mb-4">
                      Start building your GOAT list to influence The Canon
                    </p>
                    <button
                      onClick={() => createNewList('all-time')}
                      className="px-6 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400 transition-colors font-medium"
                    >
                      Start My GOAT List
                    </button>
                  </div>
                ) : (
                  // Show existing all-time list - only show the first one to prevent duplicates
                  userLists
                    .filter(list => list.isAllTime)
                    .slice(0, 1)
                    .map((list, index) => {
                      console.log('Rendering GOAT list:', { index, listId: list.id, title: list.title, isAllTime: list.isAllTime });
                      const uniqueness = calculateUniqueness(list);
                      const isExpanded = expandedLists.has(list.id);
                      const displayCount = isExpanded ? list.artists.length : Math.min(list.artists.length, 10);
                      
                      return (
                        <div key={list.id} className="bg-yellow-500/5 border-2 border-yellow-400/50 p-4" data-list-id={list.id}>
                          {/* List header */}
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-bold flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-400" />
                                Greatest of All Time
                              </h3>
                              <p className="text-sm text-gray-400">{list.created}</p>
                              <p className="text-sm text-yellow-400 mt-1">
                                Unique Score: {uniqueness.score}/{list.artists.length} • 
                                Your voice weight: {uniqueness.percentage}%
                              </p>
                            </div>
                            <button
                              onClick={() => shareList(list)}
                              className="p-2 hover:bg-white/10 border border-white/10 transition-colors"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {/* Search Bar */}
                          <div className="relative mb-4" ref={searchRef}>
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                  setSearchQuery(e.target.value);
                                  setShowSearchResults(true);
                                  setSelectedSearchIndex(-1); // Reset selection when typing
                                }}
                                onFocus={() => setShowSearchResults(true)}
                                onKeyDown={(e) => {
                                  if (!showSearchResults || searchResults.length === 0) return;
                                  
                                  switch (e.key) {
                                    case 'ArrowDown':
                                      e.preventDefault();
                                      setSelectedSearchIndex(prev => 
                                        prev < searchResults.length - 1 ? prev + 1 : 0
                                      );
                                      break;
                                    case 'ArrowUp':
                                      e.preventDefault();
                                      setSelectedSearchIndex(prev => 
                                        prev > 0 ? prev - 1 : searchResults.length - 1
                                      );
                                      break;
                                    case 'Enter':
                                      e.preventDefault();
                                      if (selectedSearchIndex >= 0 && selectedSearchIndex < searchResults.length) {
                                        addArtistToList(searchResults[selectedSearchIndex], list.id);
                                        setSearchQuery('');
                                        setShowSearchResults(false);
                                        setSelectedSearchIndex(-1);
                                      }
                                      break;
                                    case 'Escape':
                                      setShowSearchResults(false);
                                      setSelectedSearchIndex(-1);
                                      break;
                                  }
                                }}
                                placeholder="Search artists to add..."
                                className="w-full pl-10 pr-4 py-2 bg-black/50 border border-white/20 focus:border-purple-400/50 focus:outline-none"
                              />
                            </div>
                            
                            {/* Search hint for common nicknames */}
                            {searchQuery.length === 0 && showSearchResults && (
                              <div className="absolute top-full mt-2 w-full bg-slate-800 border border-white/20 shadow-lg p-3 z-10">
                                <p className="text-xs text-gray-400 mb-2">💡 Pro tip: Try searching with nicknames!</p>
                                <div className="flex flex-wrap gap-2">
                                  {['biggie', 'pac', 'hov', 'ye', 'drizzy', 'weezy'].map(nickname => (
                                    <button
                                      key={nickname}
                                      onClick={() => {
                                        setSearchQuery(nickname);
                                        setShowSearchResults(true);
                                      }}
                                      className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded hover:bg-purple-500/30 transition-colors"
                                    >
                                      "{nickname}"
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Search Results */}
                            {showSearchResults && searchQuery && (
                              <div className="absolute top-full mt-2 w-full bg-slate-800 border border-white/20 shadow-xl max-h-64 overflow-y-auto z-10">
                                {searchResults.map((artist, index) => {
                                  const friendCount = getFriendCountForArtist(artist.id);
                                  const isSelected = index === selectedSearchIndex;
                                  return (
                                    <div
                                      key={artist.id}
                                      className={`p-3 transition-colors flex items-center gap-3 cursor-pointer ${
                                        isSelected ? 'bg-purple-600/20 border-l-2 border-purple-400' : 'hover:bg-white/10'
                                      }`}
                                      onClick={() => addArtistToList(artist, list.id)}
                                    >
                                      <span className="text-2xl"><ArtistAvatar artist={artist} /></span>
                                      <div className="flex-1">
                                        <p className="font-medium">{artist.name}</p>
                                        <div className="flex items-center gap-2">
                                          <p className="text-sm text-gray-400">{artist.era}</p>
                                          {artist.matchedAlias && (
                                            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                                              aka "{artist.matchedAlias}"
                                            </span>
                                          )}
                                          {friendCount > 0 && (
                                            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded flex items-center gap-1">
                                              <Users className="w-3 h-3" />
                                              {friendCount} friend{friendCount > 1 ? 's' : ''}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                                {/* Always show Add Rapper button if no exact match */}
                                {searchQuery.length > 1 && !searchResults.some(artist => 
                                  artist.name.toLowerCase() === searchQuery.toLowerCase()
                                ) && (
                                  <div className={searchResults.length > 0 ? "p-3 border-t border-white/10" : "p-3"}>
                                    <button
                                      onClick={() => {
                                        setShowArtistRequestModal(true);
                                        setRequestedArtistName(searchQuery);
                                        setShowSearchResults(false);
                                      }}
                                      className="w-full p-2 hover:bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center gap-2 rounded"
                                    >
                                      <Plus className="w-4 h-4" />
                                      <span>Can't find who you're looking for? Request "{searchQuery}"</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* Empty state */}
                          {list.artists.length === 0 && (
                            <div
                              data-drop-index="0"
                              className="border-2 border-dashed border-gray-600 p-12 text-center text-gray-400"
                            >
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
                                    onRemove={() => removeArtistFromList(artist.id, list.id)}
                                    onShowDetails={setShowArtistCard}
                                    isDraggable={true}
                                    isMobile={isMobile}
                                    dragHandlers={!isMobile ? {
                                      draggable: true,
                                      onDragStart: (e) => handleDragStart(e, artist, list.id),
                                      onDragEnd: handleDragEnd,
                                      onDragEnter: (e) => handleDragEnter(e, index),
                                      onDragOver: handleDragOver,
                                      onDrop: (e) => handleDrop(e, index, list.id)
                                    } : {}}
                                    mobileDragHandlers={isMobile ? {
                                      onTouchStart: (e) => mobileDrag.handleTouchStart(e, { artist, listId: list.id }),
                                      onTouchMove: mobileDrag.handleTouchMove,
                                      onTouchEnd: mobileDrag.handleTouchEnd
                                    } : {}}
                                    isDragging={draggedItem?.artist.id === artist.id}
                                    isPioneer={checkPioneerStatus(artist.id)}
                                    ArtistAvatar={ArtistAvatar}
                                  />
                                </div>
                              </div>
                            ))}
                            
                            {/* Drop zone at end */}
                            {dragOverIndex === list.artists.length && draggedFromList === list.id && (
                              <div className="h-1 bg-purple-400 rounded transition-all duration-200" />
                            )}
                            
                            <div
                              data-drop-index={list.artists.length}
                              className="h-2"
                            />
                          </div>
                          
                          {/* Show More Button */}
                          {list.artists.length > 10 && (
                            <button 
                              onClick={() => toggleListExpansion(list.id)}
                              className="w-full mt-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 transition-colors text-sm"
                            >
                              {isExpanded ? `Show Less` : `Show All ${list.artists.length}`}
                            </button>
                          )}
                        </div>
                      );
                    })
                )}

                <>
                  {/* Other Category Lists */}
                  <div>
                    <h2 className="text-lg font-bold mb-3">OTHER RANKINGS</h2>
                  <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-4`}>
                    {/* Starter Categories (first 3 slots) */}
                    {starterCategories
                      .sort((a, b) => {
                        const listA = userLists.find(l => l.category === a.id);
                        const listB = userLists.find(l => l.category === b.id);
                        
                        // Only sort if both lists exist
                        if (!listA || !listB) return 0;
                        
                        if (otherRankingsOrder.length === 0) return 0;
                        const indexA = otherRankingsOrder.indexOf(listA.id);
                        const indexB = otherRankingsOrder.indexOf(listB.id);
                        if (indexA === -1 && indexB === -1) return 0;
                        if (indexA === -1) return 1;
                        if (indexB === -1) return -1;
                        return indexA - indexB;
                      })
                      .map((category, index) => {
                      const existingList = userLists.find(l => l.category === category.id);
                      
                      if (!existingList) {
                        return (
                          <button
                            key={category.id}
                            onClick={() => createNewList(category.id)}
                            className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-left"
                          >
                            <h3 className="font-bold mb-1">{category.name}</h3>
                            <p className="text-sm text-gray-400">{category.description}</p>
                          </button>
                        );
                      }
                        
                        return (
                          <div key={category.id}>
                            {/* Drop indicator */}
                            {otherRankingDragOverIndex === index && (
                              <div className="h-1 bg-blue-400 rounded transition-all duration-200 mb-2" />
                            )}
                            
                            <div 
                              className={`bg-white/5 border border-white/10 p-4 ${!isMobile ? 'cursor-move' : ''} ${
                                draggedOtherRankingId === existingList.id ? 'opacity-50' : ''
                              }`}
                              data-list-id={existingList.id}
                              draggable={!isMobile}
                              onDragStart={(e) => handleOtherRankingDragStart(e, existingList.id)}
                              onDragEnd={handleOtherRankingDragEnd}
                              onDragOver={handleOtherRankingDragOver}
                              onDragEnter={(e) => handleOtherRankingDragEnter(e, index)}
                              onDrop={(e) => handleOtherRankingDrop(e, index)}
                            >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-2">
                                {/* Mobile drag handle for other rankings */}
                                {isMobile && (
                                  <div 
                                    className="touch-target flex items-center justify-center w-6 h-6 cursor-grab active:cursor-grabbing"
                                    onTouchStart={(e) => mobileDrag.handleTouchStart(e, { rankingId: existingList.id, isOtherRanking: true })}
                                    onTouchMove={mobileDrag.handleTouchMove}
                                    onTouchEnd={mobileDrag.handleTouchEnd}
                                  >
                                    <GripVertical className="w-3 h-3 text-gray-400" />
                                  </div>
                                )}
                                <h3 className="font-bold">{existingList.title}</h3>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => shareList(existingList)}
                                  className="p-1 hover:bg-white/10 transition-colors rounded"
                                  title="Share"
                                >
                                  <Share2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Are you sure you want to delete "${existingList.title}"? This cannot be undone.`)) {
                                      handleDeleteList(existingList.id);
                                    }
                                  }}
                                  className="p-1 hover:bg-white/10 transition-colors rounded"
                                  title="Delete list"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            {/* Add Search Bar for existing category lists */}
                            <div className="relative mb-3">
                              <input
                                type="text"
                                placeholder="Search artists..."
                                value={otherListSearchQueries[existingList.id] || ''}
                                className="w-full px-3 py-1.5 text-sm bg-black/50 border border-white/20 focus:border-purple-400/50 focus:outline-none rounded"
                                onChange={(e) => handleOtherListSearch(existingList.id, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const results = otherListSearchResults[existingList.id];
                                    if (results && results.length > 0) {
                                      addArtistToOtherList(existingList.id, results[0]);
                                    }
                                  }
                                }}
                                onBlur={() => {
                                  // Delay clearing to allow click on search results
                                  setTimeout(() => {
                                    setOtherListSearchResults(prev => ({ ...prev, [existingList.id]: [] }));
                                  }, 300);
                                }}
                              />
                              
                              {/* Search Results Dropdown */}
                              {otherListSearchResults[existingList.id] && otherListSearchResults[existingList.id].length > 0 && (
                                <div className="absolute top-full mt-1 w-full bg-slate-800 border border-white/20 shadow-xl max-h-48 overflow-y-auto z-20">
                                  {otherListSearchResults[existingList.id].map((artist) => (
                                    <div
                                      key={artist.id}
                                      className="p-3 hover:bg-white/10 transition-colors flex items-center gap-3 cursor-pointer"
                                      onMouseDown={(e) => {
                                        e.preventDefault(); // Prevent blur event
                                        addArtistToOtherList(existingList.id, artist);
                                      }}
                                      onClick={() => addArtistToOtherList(existingList.id, artist)}
                                    >
                                      <ArtistAvatar artist={artist} size="w-8 h-8" />
                                      <div>
                                        <p className="font-medium">{artist.name}</p>
                                        <p className="text-xs text-gray-400">{artist.genre || 'Artist'}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="space-y-1">
                              {existingList.artists.map((artist, index) => (
                                <div key={artist.id}>
                                  {/* Drop indicator */}
                                  {dragOverIndex === index && draggedFromList === existingList.id && (
                                    <div className="h-1 bg-purple-400 rounded transition-all duration-200" />
                                  )}
                                  
                                  <div data-drop-index={index}>
                                    <ArtistRow
                                      artist={artist}
                                      index={index}
                                      onRemove={() => {
                                        const newArtists = existingList.artists.filter(a => a.id !== artist.id);
                                        updateListAndSave(existingList.id, newArtists);
                                      }}
                                      onShowDetails={setShowArtistCard}
                                      isDraggable={true}
                                      isMobile={isMobile}
                                      dragHandlers={!isMobile ? {
                                        draggable: true,
                                        onDragStart: (e) => handleDragStart(e, artist, existingList.id),
                                        onDragOver: handleDragOver,
                                        onDragEnter: (e) => handleDragEnter(e, index),
                                        onDrop: (e) => handleDrop(e, index, existingList.id)
                                      } : {}}
                                      mobileDragHandlers={isMobile ? {
                                        onTouchStart: (e) => mobileDrag.handleTouchStart(e, { artist, listId: existingList.id }),
                                        onTouchMove: mobileDrag.handleTouchMove,
                                        onTouchEnd: mobileDrag.handleTouchEnd
                                      } : {}}
                                      isDragging={draggedItem?.artist.id === artist.id}
                                      isPioneer={false} // Custom lists don't show pioneer status
                                      ArtistAvatar={ArtistAvatar}
                                    />
                                  </div>
                                </div>
                              ))}
                              
                              {/* Drop indicator at the end */}
                              {dragOverIndex === existingList.artists.length && draggedFromList === existingList.id && (
                                <div className="h-1 bg-purple-400 rounded transition-all duration-200" />
                              )}
                              
                              {/* Drop zone at the end */}
                              <div
                                data-drop-index={existingList.artists.length}
                                className={`${existingList.artists.length === 0 ? 
                                  'border-2 border-dashed border-gray-600 p-6 text-center text-gray-400 text-sm' : 
                                  'h-4 border border-dashed border-transparent hover:border-gray-600 transition-colors'
                                }`}
                                {...(!isMobile ? {
                                  onDragOver: handleDragOver,
                                  onDragEnter: (e) => handleDragEnter(e, existingList.artists.length),
                                  onDrop: (e) => handleDrop(e, existingList.artists.length, existingList.id),
                                } : {})}
                              >
                                {existingList.artists.length === 0 && (
                                  isMobile ? 'Search and tap artists to add them' : 'Search artists or drag them here'
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        );
                      })}
                      
                      {/* Final drop zone for other rankings reordering */}
                      {starterCategories.filter(cat => userLists.find(l => l.category === cat.id)).length > 0 && 
                       otherRankingDragOverIndex === starterCategories.filter(cat => userLists.find(l => l.category === cat.id)).length && (
                        <div className="h-1 bg-blue-400 rounded transition-all duration-200 mb-2" />
                      )}
                    </div>
                  </div>
                  
                  {/* Custom Categories */}
                  <CustomCategorySection
                    userLists={userLists}
                    userCustomCategories={userCustomCategories}
                    setUserCustomCategories={setUserCustomCategories}
                    currentUser={currentUser}
                    supabase={supabase}
                    isMobile={isMobile}
                    mobileDrag={mobileDrag}
                    draggedItem={draggedItem}
                    dragOverIndex={dragOverIndex}
                    draggedFromList={draggedFromList}
                    setDragOverIndex={setDragOverIndex}
                    setDraggedFromList={setDraggedFromList}
                    otherListSearchQueries={otherListSearchQueries}
                    otherListSearchResults={otherListSearchResults}
                    setOtherListSearchResults={setOtherListSearchResults}
                    handleOtherListSearch={handleOtherListSearch}
                    addArtistToOtherList={addArtistToOtherList}
                    setShowArtistCard={setShowArtistCard}
                    removeArtistFromList={removeArtistFromList}
                    updateListAndSave={updateListAndSave}
                    shareList={shareList}
                    setShowCustomCategorySelector={setShowCustomCategorySelector}
                    addToast={addToast}
                    ArtistAvatar={ArtistAvatar}
                  />
                </>
              </div>
            ) : (
              <div className="space-y-6">
                {/* My People Tab Content */}
                
                {/* My Stats Section */}
                {currentUser && (
                  <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-white/20 p-6 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold flex items-center gap-3">
                        <UserAvatar 
                          user={currentUser} 
                          profilePicture={userProfilePicture} 
                          size="w-10 h-10" 
                        />
                        My Stats
                      </h2>
                      <button
                        onClick={() => handleUsernameClick({
                          ...currentUser,
                          username: username || currentUser.email?.split('@')[0],
                          profile_picture_url: userProfilePicture
                        })}
                        className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
                      >
                        View Full Profile →
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div className="bg-slate-800/50 p-3 rounded">
                        <div className="text-xl font-bold text-purple-400">{currentUserStats.debates_started}</div>
                        <div className="text-xs text-gray-400">Debates Started</div>
                      </div>
                      <div className="bg-slate-800/50 p-3 rounded">
                        <div className="text-xl font-bold text-blue-400">{currentUserStats.comments_made}</div>
                        <div className="text-xs text-gray-400">Comments</div>
                      </div>
                      <div className="bg-slate-800/50 p-3 rounded">
                        <div className="text-xl font-bold text-pink-400">{currentUserStats.likes_received}</div>
                        <div className="text-xs text-gray-400">Likes Received</div>
                      </div>
                      <div className="bg-slate-800/50 p-3 rounded">
                        <div className="text-xl font-bold text-green-400">{friends.length}</div>
                        <div className="text-xs text-gray-400">Friends</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-400">
                      <span>Member since {currentUser.created_at ? new Date(currentUser.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Unknown'}</span>
                      {currentUser.created_at && (
                        <span className="text-purple-400">
                          • {Math.floor((new Date() - new Date(currentUser.created_at)) / (1000 * 60 * 60 * 24))} days active
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Friend Search Section */}
                <div>
                  <h2 className="text-lg font-bold mb-3">Find Friends</h2>
                  <div className="relative friend-search-container">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={friendSearchQuery}
                        onChange={(e) => {
                          setFriendSearchQuery(e.target.value);
                          if (e.target.value.length > 1) {
                            searchFriends(e.target.value);
                            setShowFriendSearch(true);
                          } else {
                            setFriendSearchResults([]);
                            setShowFriendSearch(false);
                          }
                        }}
                        onFocus={() => friendSearchQuery && setShowFriendSearch(true)}
                        placeholder="Search by username..."
                        className="w-full pl-10 pr-4 py-2 bg-black/50 border border-white/20 focus:border-purple-400/50 focus:outline-none"
                      />
                    </div>
                    
                    {/* Friend Search Results */}
                    {showFriendSearch && (
                      <div className="absolute top-full mt-2 w-full bg-slate-800 border border-white/20 shadow-xl max-h-64 overflow-y-auto z-10">
                        {isLoadingSearch ? (
                          <div className="p-4">
                            <div className="flex items-center gap-3 animate-pulse">
                              <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
                              <div className="flex-1">
                                <div className="h-4 bg-gray-600 rounded w-20 mb-1"></div>
                                <div className="h-3 bg-gray-700 rounded w-16"></div>
                              </div>
                              <div className="w-12 h-6 bg-gray-600 rounded"></div>
                            </div>
                          </div>
                        ) : friendSearchResults.length > 0 ? (
                          <>
                            {friendSearchResults.map((user) => (
                              <div
                                key={user.id}
                                className="p-3 hover:bg-white/10 transition-colors flex items-center justify-between"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-purple-400" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{user.username || user.display_name}</p>
                                    <p className="text-sm text-gray-400">User</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => sendFriendRequest(user.id)}
                                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 transition-colors text-sm rounded"
                                >
                                  Add Friend
                                </button>
                              </div>
                            ))}
                          </>
                        ) : (
                          <div className="p-4 text-center text-gray-400">
                            <Search className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                            <p>No users found</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Friend-of-Friend Suggestions */}
                {friends.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold mb-3">People You May Know</h2>
                    <div className="space-y-2">
                      {friends.slice(0, 3).map((friend, idx) => {
                        const suggestions = [
                          { username: "JayZFan95", mutualFriend: friend.username, reason: "loves 90s hip-hop" },
                          { username: "VinylCollector", mutualFriend: friend.username, reason: "rates Nas highly" },
                          { username: "BeatMaker", mutualFriend: friend.username, reason: "similar taste" },
                        ];
                        const suggestion = suggestions[idx % suggestions.length];
                        
                        return (
                          <div key={`suggestion-${idx}`} className="bg-slate-800/30 border border-white/10 p-3 flex items-center justify-between">
                            <div>
                              <p className="font-medium">{suggestion.username}</p>
                              <p className="text-xs text-gray-400">
                                Friend of <span className="text-purple-400">{suggestion.mutualFriend}</span> • {suggestion.reason}
                              </p>
                            </div>
                            <button
                              onClick={async () => {
                                // Simulate friend request
                                const newRequest = {
                                  id: Date.now(),
                                  from_user_id: currentUser?.id,
                                  to_user_id: `suggested-${idx}`,
                                  user: { username: suggestion.username }
                                };
                                addToast(`Friend request sent to ${suggestion.username}!`, 'success');
                              }}
                              className="px-3 py-1 bg-purple-600/20 text-purple-400 border border-purple-500/30 hover:bg-purple-600/30 transition-colors text-xs font-medium"
                            >
                              Add
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Friend Requests */}
                <div>
                  <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                    Friend Requests
                    {friendRequests.length > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                        {friendRequests.length}
                      </span>
                    )}
                  </h2>
                  {friendRequests.length > 0 ? (
                    <div className="space-y-2">
                      {friendRequests.map(request => (
                        <div key={request.id} className="bg-slate-800/50 border border-white/10 p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <UserAvatar 
                              user={request.profiles} 
                              profilePicture={request.profiles?.profile_picture_url} 
                              size="w-10 h-10" 
                            />
                            <div>
                              <p className="font-bold">{request.profiles?.username || 'Unknown User'}</p>
                              <p className="text-sm text-gray-400">Wants to be your friend</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => acceptFriendRequest(request.id)}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 transition-colors text-sm rounded"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => declineFriendRequest(request.id)}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 transition-colors text-sm rounded"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-800/30 border border-white/10 p-4 text-center text-gray-400">
                      No pending friend requests
                    </div>
                  )}
                </div>

                {/* Friends List */}
                <div>
                  <h2 className="text-lg font-bold mb-3">Your Friends ({friends.length})</h2>
                  {isLoadingFriends ? (
                    <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-4`}>
                      {[...Array(4)].map((_, index) => (
                        <div key={index} className="bg-slate-800/50 border border-white/10 p-4 animate-pulse">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="h-4 bg-gray-600 rounded w-24 mb-2"></div>
                              <div className="h-3 bg-gray-700 rounded w-32"></div>
                            </div>
                            <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : friends.length > 0 ? (
                    <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-4`}>
                      {friends.map(friend => {
                        const compatibility = compatibilityScores[friend.id];
                        return (
                          <div key={friend.id} className="bg-slate-800/50 border border-white/10 p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <button 
                                    onClick={() => handleUsernameClick(friend)}
                                    className="font-bold hover:text-purple-400 transition-colors cursor-pointer text-left"
                                  >
                                    {friend.username}
                                  </button>
                                  <UserTierBadge userStats={friend} size="xs" />
                                </div>
                                <p className="text-sm text-gray-400">Friend since recently</p>
                              </div>
                              <UserAvatar 
                                user={friend} 
                                profilePicture={friend.profile_picture_url} 
                                size="w-10 h-10" 
                              />
                            </div>
                            
                            {/* Compatibility Score */}
                            {compatibility && (
                              <div className="mt-3 pt-3 border-t border-white/10">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <div className={`text-2xl font-bold ${
                                      compatibility.score >= 80 ? 'text-green-400' :
                                      compatibility.score >= 60 ? 'text-yellow-400' :
                                      compatibility.score >= 40 ? 'text-orange-400' :
                                      'text-red-400'
                                    }`}>
                                      {compatibility.score}%
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      <div>Taste Match</div>
                                      <div>{compatibility.matchCount} shared artists</div>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => setViewingFriend(friend)}
                                    className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                                  >
                                    View Rankings →
                                  </button>
                                </div>
                                
                                {/* Genre/Era Insights */}
                                {compatibility.insights && (
                                  <div className="space-y-2 text-xs">
                                    {/* Era alignment */}
                                    {compatibility.insights.topEras?.length > 0 && (
                                      <div className="bg-black/20 px-2 py-1.5 rounded">
                                        <span className="text-gray-400">Both love </span>
                                        <span className="text-purple-300 font-medium">
                                          {compatibility.insights.topEras[0].era}
                                        </span>
                                        <span className="text-gray-500"> ({compatibility.insights.topEras[0].count} artists)</span>
                                      </div>
                                    )}
                                    
                                    {/* Strongest alignment */}
                                    {compatibility.insights.strongestAlignment && (
                                      <div className="bg-black/20 px-2 py-1.5 rounded">
                                        <span className="text-gray-400">You both rank </span>
                                        <span className="text-green-300 font-medium">
                                          {compatibility.insights.strongestAlignment.artist.name}
                                        </span>
                                        <span className="text-gray-500"> similarly (#{compatibility.insights.strongestAlignment.userRank} & #{compatibility.insights.strongestAlignment.otherRank})</span>
                                      </div>
                                    )}
                                    
                                    {/* Biggest disagreement */}
                                    {compatibility.insights.biggestDisagreement && 
                                     compatibility.insights.biggestDisagreement.rankDiff > 5 && (
                                      <div className="bg-black/20 px-2 py-1.5 rounded">
                                        <span className="text-gray-400">Biggest debate: </span>
                                        <span className="text-orange-300 font-medium">
                                          {compatibility.insights.biggestDisagreement.artist.name}
                                        </span>
                                        <span className="text-gray-500"> (You: #{compatibility.insights.biggestDisagreement.userRank}, Them: #{compatibility.insights.biggestDisagreement.otherRank})</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-slate-800/30 border border-dashed border-gray-600 rounded-lg">
                      <Users className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-300 mb-2">No Friends Yet</h3>
                      <p className="text-gray-400 mb-4">Connect with other music lovers to see their rankings and get recommendations!</p>
                      <button 
                        onClick={() => {
                          const searchInput = document.querySelector('input[placeholder*="Search for friends"]');
                          if (searchInput) {
                            searchInput.focus();
                            searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                        }}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                      >
                        Search for Friends
                      </button>
                    </div>
                  )}
                </div>

                {/* Discover Compatible Users */}
                <div>
                  <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    Discover Compatible Users
                  </h2>
                  
                  {isLoadingCompatibility ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, index) => (
                        <div key={index} className="bg-slate-800/50 border border-white/10 p-4 animate-pulse">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-600 rounded-full"></div>
                            <div className="flex-1">
                              <div className="h-4 bg-gray-600 rounded w-24 mb-2"></div>
                              <div className="h-3 bg-gray-700 rounded w-32"></div>
                            </div>
                            <div className="text-right">
                              <div className="h-6 bg-gray-600 rounded w-12 mb-1"></div>
                              <div className="h-2 bg-gray-700 rounded w-16"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : topCompatibleUsers.length > 0 ? (
                    <div className="space-y-3">
                      {topCompatibleUsers.map((match, index) => (
                        <div key={match.user.id} className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-400/30 p-4 hover:border-purple-400/50 transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <UserAvatar 
                                user={match.user} 
                                profilePicture={match.user.profile_picture_url} 
                                size="w-12 h-12" 
                              />
                              <div>
                                <button 
                                  onClick={() => handleUsernameClick(match.user)}
                                  className="font-bold hover:text-purple-400 transition-colors"
                                >
                                  {match.user.username || match.user.display_name}
                                </button>
                                <p className="text-xs text-gray-400">
                                  {index === 0 && '🥇 Most Compatible'}
                                  {index === 1 && '🥈 2nd Most Compatible'}
                                  {index === 2 && '🥉 3rd Most Compatible'}
                                  {index > 2 && `#${index + 1} Compatible`}
                                </p>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${
                                match.score >= 80 ? 'text-green-400' :
                                match.score >= 60 ? 'text-yellow-400' :
                                match.score >= 40 ? 'text-orange-400' :
                                'text-red-400'
                              }`}>
                                {match.score}%
                              </div>
                              <p className="text-xs text-gray-400">
                                {match.matchCount} shared
                              </p>
                            </div>
                          </div>
                          
                          {/* Genre/Era Insights */}
                          {match.insights && (
                            <div className="space-y-2 mt-3 pt-3 border-t border-white/10">
                              {/* Common era preference */}
                              {match.insights.topEras?.length > 0 && (
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="text-gray-400">Both into:</span>
                                  <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">
                                    {match.insights.topEras[0].era} ({match.insights.topEras[0].count} artists)
                                  </span>
                                </div>
                              )}
                              
                              {/* Show their top 3 artists */}
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">Their top 3:</span>
                                <div className="flex gap-2 flex-1 flex-wrap">
                                  {match.topArtists.map((artist, idx) => (
                                    <span key={artist.id} className="text-xs bg-black/30 px-2 py-1 rounded">
                                      {idx + 1}. {artist.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => sendFriendRequest(match.user.id)}
                              className="flex-1 py-1.5 bg-purple-600 hover:bg-purple-700 transition-colors text-sm rounded"
                            >
                              Add Friend
                            </button>
                            <button
                              onClick={() => handleUsernameClick(match.user)}
                              className="flex-1 py-1.5 bg-slate-700 hover:bg-slate-600 transition-colors text-sm rounded"
                            >
                              View Profile
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : userLists.find(l => l.isAllTime === true)?.artists?.length > 0 ? (
                    <div className="text-center py-6 bg-slate-800/30 border border-dashed border-gray-600 rounded-lg">
                      <Search className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-400">No highly compatible users found yet</p>
                      <p className="text-xs text-gray-500 mt-1">We'll find more as the community grows!</p>
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-slate-800/30 border border-dashed border-gray-600 rounded-lg">
                      <Target className="w-10 h-10 text-purple-400 mx-auto mb-2" />
                      <p className="text-gray-300">Create your Canon to find compatible users</p>
                      <button
                        onClick={() => setActiveTab('mytop10')}
                        className="mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 transition-colors text-sm rounded"
                      >
                        Build Your Canon
                      </button>
                    </div>
                  )}
                </div>

                {/* Artist Recommendations */}
                {compatibilityRecommendations.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      Recommended Artists
                      <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                        Based on your matches
                      </span>
                    </h2>
                    
                    <div className="space-y-3">
                      {compatibilityRecommendations.map((rec, index) => (
                        <div key={rec.artist?.id || index} className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-400/30 p-4 hover:border-green-400/50 transition-all">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <ArtistAvatar artist={rec.artist} size="w-12 h-12" />
                              <div>
                                <h3 className="font-bold text-green-300">{rec.artist?.name || 'Unknown Artist'}</h3>
                                <p className="text-xs text-gray-400">
                                  Recommended by {rec.recommenderCount || 0} compatible user{rec.recommenderCount > 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-400">
                                {Math.round(rec.averageCompatibility)}% avg
                              </div>
                              <p className="text-xs text-gray-400">
                                #{rec.topPosition} highest rank
                              </p>
                            </div>
                          </div>
                          
                          {/* Show who recommended this artist */}
                          <div className="flex items-center gap-2 mb-3 pt-2 border-t border-white/10">
                            <span className="text-xs text-gray-400">Loved by:</span>
                            <div className="flex gap-1">
                              {rec.recommenders.slice(0, 3).map((recommender, idx) => (
                                <span key={recommender.user.id} className="text-xs bg-black/30 px-2 py-1 rounded">
                                  {recommender.user.username} ({recommender.score}%)
                                </span>
                              ))}
                              {rec.recommenders.length > 3 && (
                                <span className="text-xs text-gray-400">
                                  +{rec.recommenders.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                // Add to user's canon ranking  
                                const canonList = userLists.find(l => l.isAllTime === true);
                                if (canonList) {
                                  const newArtists = [...canonList.artists, rec.artist];
                                  updateListAndSave(canonList.id, newArtists);
                                  addToast(`Added ${rec.artist.name} to your Canon!`, 'success');
                                } else {
                                  addToast('Create your Canon first to add artists', 'info');
                                  setActiveTab('mytop10');
                                }
                              }}
                              className="flex-1 py-1.5 bg-green-600 hover:bg-green-700 transition-colors text-sm rounded"
                            >
                              Add to Canon
                            </button>
                            <button
                              onClick={() => {
                                // Show artist details
                                setShowArtistCard(rec.artist);
                              }}
                              className="flex-1 py-1.5 bg-slate-700 hover:bg-slate-600 transition-colors text-sm rounded"
                            >
                              Learn More
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Live Friend Activity Feed */}
                <LiveActivityFeed
                  supabase={supabase}
                  currentUser={currentUser}
                  friends={friends}
                  onUserClick={handleUserClick}
                  onArtistClick={setShowArtistCard}
                />

                {/* Group Challenges */}
                <div className="mt-6">
                  <GroupChallenges
                    currentUser={currentUser}
                    friends={friends}
                    onJoinChallenge={handleGroupChallengeJoin}
                    onCreateChallenge={handleGroupChallengeCreate}
                    onStartWorking={handleGroupChallengeStart}
                  />
                </div>
              </div>
            )}
          </main>

          {/* Friend Rankings Modal */}
          {viewingFriend && (
            <div 
              className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setViewingFriend(null)}
            >
              <div 
                className={`bg-slate-800 border border-white/20 ${isMobile ? 'w-full h-full' : 'max-w-4xl w-full max-h-[90vh]'} flex flex-col rounded-lg overflow-hidden`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Fixed Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/10 flex-shrink-0">
                  <h2 className={`font-bold tracking-tight flex items-center gap-3 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                    <UserAvatar 
                      user={viewingFriend} 
                      profilePicture={viewingFriend.profile_picture_url} 
                      size={isMobile ? "w-8 h-8" : "w-10 h-10"} 
                    />
                    <span className="flex items-center gap-3">
                      {viewingFriend.username || viewingFriend.display_name || 'User'}'s Rankings
                      {viewingFriend.canon_points !== undefined && (
                        <span className="text-sm bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full font-medium">
                          {viewingFriend.canon_points} points
                        </span>
                      )}
                    </span>
                  </h2>
                  <button 
                    onClick={() => {
                      setViewingFriend(null);
                      setFriendRankings([]);
                    }}
                    className="p-2 hover:bg-white/10 transition-colors touch-target"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6">
                
                {/* User Profile Stats Section - Compact Version */}
                <div className="mb-4 p-3 bg-slate-700/30 border border-white/10 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Canon OG Badge - Made More Prominent */}
                      {viewingFriend.is_canon_og && (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold rounded-full shadow-lg animate-pulse">
                          <Crown className="w-4 h-4" />
                          CANON OG
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        Member since {viewingFriend.created_at ? new Date(viewingFriend.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Unknown'}
                      </span>
                    </div>
                    
                    {/* Compact Stats Row */}
                    <div className="flex items-center gap-4 text-xs">
                      <div className="text-center">
                        <div className="font-bold text-purple-400">{viewingFriend.stats?.debates_started || 0}</div>
                        <div className="text-gray-500">Debates</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-blue-400">{viewingFriend.stats?.comments_made || 0}</div>
                        <div className="text-gray-500">Comments</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-pink-400">{viewingFriend.stats?.likes_received || 0}</div>
                        <div className="text-gray-500">Likes</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-green-400">{viewingFriend.stats?.friend_count || 0}</div>
                        <div className="text-gray-500">Friends</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Achievements Row - Compact */}
                  {viewingFriend.achievements && viewingFriend.achievements.length > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <Award className="w-3 h-3 text-yellow-400" />
                      <div className="flex flex-wrap gap-1">
                        {viewingFriend.achievements.slice(0, 3).map((achievement, idx) => (
                          <span key={idx} className="text-xs text-yellow-300">
                            {achievement}{idx < Math.min(2, viewingFriend.achievements.length - 1) && ','}
                          </span>
                        ))}
                        {viewingFriend.achievements.length > 3 && (
                          <span className="text-xs text-gray-400">+{viewingFriend.achievements.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Music Compatibility Score */}
                {userLists.length > 0 && friendRankings.length > 0 && (
                  <div className="mb-4">
                    <FriendCompatibility
                      userRankings={userLists.find(list => list.isAllTime)?.artists || []}
                      friendRankings={friendRankings.find(list => list.isAllTime)?.artists || []}
                      userName={currentUser?.username || 'You'}
                      friendName={viewingFriend.username || viewingFriend.display_name}
                      onViewDetails={() => addToast('Detailed comparison coming soon!', 'info')}
                    />
                  </div>
                )}

                {/* Quick Social Actions */}
                <div className="mb-4">
                  <QuickSocialActions
                    targetUser={viewingFriend}
                    targetList={friendRankings.find(list => list.isAllTime)}
                    currentUser={currentUser}
                    onChallenge={handleSocialChallenge}
                    onMessage={handleSocialMessage}
                    onShare={handleSocialShare}
                    onLike={handleSocialLike}
                  />
                </div>
                
                  {friendRankings.length > 0 ? (
                    <div className="space-y-6">
                      {/* Top 10 Lists */}
                      {friendRankings.filter(list => list.isAllTime).length > 0 && (
                        <div>
                          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Crown className="w-5 h-5 text-yellow-400" />
                            Top 10 Lists
                          </h3>
                          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-4`}>
                            {friendRankings.filter(list => list.isAllTime).map(list => (
                              <div key={list.id} className="bg-slate-700/50 border border-white/10 p-4">
                                <div className="flex justify-between items-start mb-3">
                                  <h4 className="font-bold flex items-center gap-2">
                                    <Crown className="w-4 h-4 text-yellow-400" />
                                    {list.title}
                                  </h4>
                                  <button
                                    onClick={() => {
                                      setCommentingOnList(list);
                                      setShowCommentModal(true);
                                    }}
                                    className="p-1 hover:bg-white/10 transition-colors rounded relative"
                                    title="Comment on this list"
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                    {listComments[list.id] && listComments[list.id].length > 0 && (
                                      <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                        {listComments[list.id].length}
                                      </span>
                                    )}
                                  </button>
                                </div>
                                <div className="space-y-2">
                                  {list.artists.slice(0, 10).map((artist, idx) => (
                                    <div key={artist.id} className="flex items-center gap-3 text-sm">
                                      <span className="text-gray-500 w-6">#{idx + 1}</span>
                                      <ArtistAvatar artist={artist} size="w-6 h-6" />
                                      <span className="truncate">{artist.name}</span>
                                    </div>
                                  ))}
                                  {list.artists.length > 10 && (
                                    <p className="text-xs text-gray-400 mt-2">
                                      +{list.artists.length - 10} more artists
                                    </p>
                                  )}
                                </div>
                                
                                {/* Comments Section */}
                                {listComments[list.id] && listComments[list.id].length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-white/10">
                                    <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                                      <MessageCircle className="w-3 h-3" />
                                      {listComments[list.id].length} {listComments[list.id].length === 1 ? 'comment' : 'comments'}
                                    </p>
                                    <div className="space-y-2 max-h-32 overflow-y-auto">
                                      {listComments[list.id].slice(0, 3).map(comment => (
                                        <div key={comment.id} className="text-xs bg-slate-800/50 p-2 rounded">
                                          <div className="flex items-center gap-1 mb-1">
                                            <UserAvatar 
                                              user={comment.profiles} 
                                              profilePicture={comment.profiles?.profile_picture_url} 
                                              size="w-4 h-4" 
                                            />
                                            <div className="flex items-center gap-2">
                                              <span className="font-medium text-blue-400">
                                                {comment.profiles?.username || comment.profiles?.display_name}
                                              </span>
                                              <UserTierBadge userStats={comment.profiles} size="xs" />
                                            </div>
                                            <span className="text-gray-500">
                                              {new Date(comment.created_at).toLocaleDateString()}
                                            </span>
                                          </div>
                                          <p className="text-gray-300 mb-1">{comment.content}</p>
                                          <div className="flex items-center gap-2">
                                            <button 
                                              onClick={() => toggleLike('comment', comment.id)}
                                              className={`flex items-center gap-1 text-xs transition-colors ${
                                                commentLikes[comment.id]?.userLiked 
                                                  ? 'text-purple-400' 
                                                  : 'hover:text-purple-400'
                                              }`}
                                            >
                                              <Heart 
                                                className={`w-3 h-3 ${commentLikes[comment.id]?.userLiked ? 'fill-current' : ''}`} 
                                              />
                                              {commentLikes[comment.id]?.count || 0}
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                      {listComments[list.id].length > 3 && (
                                        <p className="text-xs text-purple-400 cursor-pointer hover:text-purple-300">
                                          View all comments →
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Other Lists */}
                      {friendRankings.filter(list => !list.isAllTime).length > 0 && (
                        <div>
                          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5 text-purple-400" />
                            Other Lists
                          </h3>
                          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-4`}>
                            {friendRankings.filter(list => !list.isAllTime).map(list => (
                              <div key={list.id} className="bg-slate-700/50 border border-white/10 p-4">
                                <div className="flex justify-between items-start mb-3">
                                  <h4 className="font-bold flex items-center gap-2">
                                    {list.title}
                                  </h4>
                                  <button
                                    onClick={() => {
                                      setCommentingOnList(list);
                                      setShowCommentModal(true);
                                    }}
                                    className="p-1 hover:bg-white/10 transition-colors rounded relative"
                                    title="Comment on this list"
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                    {listComments[list.id] && listComments[list.id].length > 0 && (
                                      <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                        {listComments[list.id].length}
                                      </span>
                                    )}
                                  </button>
                                </div>
                                <div className="space-y-2">
                                  {list.artists.slice(0, 10).map((artist, idx) => (
                                    <div key={artist.id} className="flex items-center gap-3 text-sm">
                                      <span className="text-gray-500 w-6">#{idx + 1}</span>
                                      <ArtistAvatar artist={artist} size="w-6 h-6" />
                                      <span className="truncate">{artist.name}</span>
                                    </div>
                                  ))}
                                  {list.artists.length > 10 && (
                                    <p className="text-xs text-gray-400 mt-2">
                                      +{list.artists.length - 10} more artists
                                    </p>
                                  )}
                                </div>
                                
                                {/* Comments Section */}
                                {listComments[list.id] && listComments[list.id].length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-white/10">
                                    <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                                      <MessageCircle className="w-3 h-3" />
                                      {listComments[list.id].length} {listComments[list.id].length === 1 ? 'comment' : 'comments'}
                                    </p>
                                    <div className="space-y-2 max-h-32 overflow-y-auto">
                                      {listComments[list.id].slice(0, 3).map(comment => (
                                        <div key={comment.id} className="text-xs bg-slate-800/50 p-2 rounded">
                                          <div className="flex items-center gap-1 mb-1">
                                            <UserAvatar 
                                              user={comment.profiles} 
                                              profilePicture={comment.profiles?.profile_picture_url} 
                                              size="w-4 h-4" 
                                            />
                                            <div className="flex items-center gap-2">
                                              <span className="font-medium text-blue-400">
                                                {comment.profiles?.username || comment.profiles?.display_name}
                                              </span>
                                              <UserTierBadge userStats={comment.profiles} size="xs" />
                                            </div>
                                            <span className="text-gray-500">
                                              {new Date(comment.created_at).toLocaleDateString()}
                                            </span>
                                          </div>
                                          <p className="text-gray-300 mb-1">{comment.content}</p>
                                          <div className="flex items-center gap-2">
                                            <button 
                                              onClick={() => toggleLike('comment', comment.id)}
                                              className={`flex items-center gap-1 text-xs transition-colors ${
                                                commentLikes[comment.id]?.userLiked 
                                                  ? 'text-purple-400' 
                                                  : 'hover:text-purple-400'
                                              }`}
                                            >
                                              <Heart 
                                                className={`w-3 h-3 ${commentLikes[comment.id]?.userLiked ? 'fill-current' : ''}`} 
                                              />
                                              {commentLikes[comment.id]?.count || 0}
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                      {listComments[list.id].length > 3 && (
                                        <p className="text-xs text-purple-400 cursor-pointer hover:text-purple-300">
                                          View all comments →
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>{viewingFriend.username} hasn't created any rankings yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Floating Action Buttons */}
          <div className={`fixed ${isMobile ? 'bottom-20 right-4' : 'bottom-6 right-6'} flex flex-col gap-3`}>
            <button 
              onClick={() => setShowBattleModal(true)}
              className="p-4 bg-red-500 border border-red-400 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all touch-target"
            >
              <Swords className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-slate-900 border-t border-white/10 py-6 mt-8">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
              <button 
                onClick={() => setShowTermsModal(true)}
                className="hover:text-white transition-colors"
              >
                Terms of Service
              </button>
              <button 
                onClick={() => setShowPrivacyModal(true)}
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </button>
              <a 
                href="mailto:info@thecanon.io"
                className="hover:text-white transition-colors"
              >
                info@thecanon.io
              </a>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              © 2024 The Canon. All rights reserved.
            </p>
          </div>
        </footer>

        {/* Terms of Service Modal */}
        {showTermsModal && (
          <div 
            className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowTermsModal(false)}
          >
            <div 
              className={`bg-slate-800 border border-white/20 p-6 ${isMobile ? 'w-full' : 'max-w-2xl w-full'} max-h-[80vh] overflow-y-auto`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Terms of Service</h2>
                <button 
                  onClick={() => setShowTermsModal(false)}
                  className="p-2 hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="prose prose-invert max-w-none text-sm">
                <p className="mb-4">
                  Welcome to The Canon! By using our service, you agree to these terms.
                </p>
                
                <h3 className="text-lg font-semibold mb-2">1. Acceptable Use</h3>
                <p className="mb-4">
                  You agree to use The Canon respectfully and not to post harmful, offensive, or inappropriate content. 
                  We reserve the right to remove content and suspend accounts that violate these guidelines.
                </p>
                
                <h3 className="text-lg font-semibold mb-2">2. User Content</h3>
                <p className="mb-4">
                  You retain rights to content you create, but grant us permission to display and distribute it through our service. 
                  You are responsible for ensuring your content doesn't violate others' rights.
                </p>
                
                <h3 className="text-lg font-semibold mb-2">3. Privacy</h3>
                <p className="mb-4">
                  We respect your privacy and handle your data according to our Privacy Policy.
                </p>
                
                <h3 className="text-lg font-semibold mb-2">4. Changes</h3>
                <p className="mb-4">
                  We may update these terms occasionally. Continued use means acceptance of any changes.
                </p>
                
                <p className="text-gray-400 text-xs">
                  Last updated: January 2024
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Policy Modal */}
        {showPrivacyModal && (
          <div 
            className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowPrivacyModal(false)}
          >
            <div 
              className={`bg-slate-800 border border-white/20 p-6 ${isMobile ? 'w-full' : 'max-w-2xl w-full'} max-h-[80vh] overflow-y-auto`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Privacy Policy</h2>
                <button 
                  onClick={() => setShowPrivacyModal(false)}
                  className="p-2 hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="prose prose-invert max-w-none text-sm">
                <p className="mb-4">
                  Your privacy is important to us. This policy explains how we collect, use, and protect your information.
                </p>
                
                <h3 className="text-lg font-semibold mb-2">Information We Collect</h3>
                <p className="mb-4">
                  We collect information you provide directly (account info, rankings, posts) and automatically 
                  (usage data, device information) to provide and improve our service.
                </p>
                
                <h3 className="text-lg font-semibold mb-2">How We Use Your Information</h3>
                <p className="mb-4">
                  We use your information to provide the service, personalize your experience, 
                  communicate with you, and improve our platform.
                </p>
                
                <h3 className="text-lg font-semibold mb-2">Information Sharing</h3>
                <p className="mb-4">
                  We don't sell your personal information. We may share data with service providers 
                  who help us operate the platform, and as required by law.
                </p>
                
                <h3 className="text-lg font-semibold mb-2">Data Security</h3>
                <p className="mb-4">
                  We implement security measures to protect your information, though no system is 100% secure.
                </p>
                
                <h3 className="text-lg font-semibold mb-2">Your Rights</h3>
                <p className="mb-4">
                  You can access, update, or delete your account information. Contact us at info@thecanon.io for assistance.
                </p>
                
                <p className="text-gray-400 text-xs">
                  Last updated: January 2024
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Modal */}
        {showNotifications && (
          <div 
            className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowNotifications(false)}
          >
            <div 
              className={`bg-slate-800 border border-white/20 p-6 ${isMobile ? 'w-full' : 'max-w-lg w-full'} max-h-[80vh] flex flex-col`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Notifications</h2>
                <button 
                  onClick={() => {
                    setShowNotifications(false);
                    // Mark all visible notifications as read
                    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
                    if (unreadIds.length > 0) {
                      markNotificationsAsRead(unreadIds);
                    }
                  }}
                  className="p-2 hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`p-4 border border-white/10 transition-colors cursor-pointer hover:bg-white/5 ${
                          !notification.read ? 'bg-purple-500/10 border-purple-400/30' : 'bg-slate-700/50'
                        }`}
                        onClick={() => {
                          // Mark as read and potentially navigate to the debate
                          if (!notification.read) {
                            markNotificationsAsRead([notification.id]);
                          }
                          // Could add navigation to the specific debate here
                          setShowNotifications(false);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <UserAvatar 
                            user={notification.from_user} 
                            profilePicture={notification.from_user?.profile_picture_url} 
                            size="w-8 h-8" 
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">
                              <span className="font-medium text-blue-400">
                                {notification.from_user?.username || notification.from_user?.display_name}
                              </span>
                              {' '}{notification.content}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {getRelativeTime(notification.created_at)}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0 mt-2"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No notifications yet</p>
                    <p className="text-xs mt-1">You'll be notified when someone mentions you in a debate!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Comment Modal */}
        {showCommentModal && commentingOnList && (
          <div 
            className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowCommentModal(false)}
          >
            <div 
              className={`bg-slate-800 border border-white/20 p-6 ${isMobile ? 'w-full' : 'max-w-lg w-full'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Comment on {commentingOnList.title}</h2>
                <button 
                  onClick={() => {
                    setShowCommentModal(false);
                    setCommentingOnList(null);
                    setCommentText('');
                  }}
                  className="p-2 hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-3">
                  Share your thoughts on {viewingFriend?.username || viewingFriend?.display_name}'s ranking
                </p>
                
                {/* Show top 5 artists from the list for context */}
                <div className="bg-slate-700/50 p-3 rounded mb-4">
                  <p className="text-xs text-gray-400 mb-2">Top 5 from this list:</p>
                  <div className="space-y-1">
                    {commentingOnList.artists.slice(0, 5).map((artist, idx) => (
                      <div key={artist.id} className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500 w-4">#{idx + 1}</span>
                        <ArtistAvatar artist={artist} size="w-5 h-5" />
                        <span>{artist.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="What do you think about this ranking?"
                  className="w-full px-3 py-2 bg-slate-700 border border-white/20 rounded focus:border-purple-400 focus:outline-none resize-none"
                  rows="4"
                  maxLength="500"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">
                  {commentText.length}/500
                </p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    if (!commentText.trim()) return;
                    
                    try {
                      // Submit comment
                      const { data, error } = await supabase
                        .from('ranking_comments')
                        .insert({
                          ranking_id: commentingOnList.id,
                          user_id: currentUser.id,
                          content: commentText.trim(),
                          list_owner_id: viewingFriend.id
                        })
                        .select('*, profiles:user_id(username, display_name, profile_picture_url)');
                      
                      if (error) throw error;
                      
                      // Update local state
                      setListComments(prev => ({
                        ...prev,
                        [commentingOnList.id]: [...(prev[commentingOnList.id] || []), data[0]]
                      }));
                      
                      // Create notification for list owner
                      await supabase
                        .from('notifications')
                        .insert({
                          to_user_id: viewingFriend.id,
                          from_user_id: currentUser.id,
                          type: 'comment',
                          content: `commented on your ${commentingOnList.title}`,
                          reference_id: commentingOnList.id
                        });
                      
                      addToast('Comment posted!', 'success');
                      setShowCommentModal(false);
                      setCommentingOnList(null);
                      setCommentText('');
                    } catch (error) {
                      console.error('Error posting comment:', error);
                      addToast('Failed to post comment', 'error');
                    }
                  }}
                  disabled={!commentText.trim()}
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                  Post Comment
                </button>
                <button
                  onClick={() => {
                    setShowCommentModal(false);
                    setCommentingOnList(null);
                    setCommentText('');
                  }}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Login Modal */}
        {showLoginModal && (
          <div 
            className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowLoginModal(false)}
          >
            <div 
              className={`bg-slate-800 border border-white/20 p-6 ${isMobile ? 'w-full' : 'max-w-md w-full'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Join The Canon</h2>
                <button 
                  onClick={() => setShowLoginModal(false)}
                  className="p-2 hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="text-center mb-6">
                <p className="text-gray-400 mb-4">
                  Sign in to participate in debates, create your Top 10 lists, and connect with hip-hop heads worldwide.
                </p>
                
                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div className="flex flex-col items-center">
                    <MessageCircle className="w-6 h-6 text-purple-400 mb-1" />
                    <span>Start Debates</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Crown className="w-6 h-6 text-yellow-400 mb-1" />
                    <span>Build Lists</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Users className="w-6 h-6 text-blue-400 mb-1" />
                    <span>Find Friends</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = '/login'}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                >
                  Sign In / Sign Up
                </button>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="w-full py-2 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Continue browsing
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Artist Card Modal */}
        {showArtistCard && <ArtistCard artist={showArtistCard} onClose={() => setShowArtistCard(null)} />}

        {/* Avatar Selector Modal */}
        {showAvatarSelector && (
          <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-white/20 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Choose Your Avatar</h2>
                <button
                  onClick={() => setShowAvatarSelector(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-4 gap-4 mb-6">
                {presetAvatars.map((avatarUrl, index) => (
                  <button
                    key={index}
                    onClick={() => selectPresetAvatar(avatarUrl)}
                    disabled={uploadingProfilePicture}
                    className="relative group aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-purple-400 transition-all disabled:opacity-50"
                  >
                    <img
                      src={avatarUrl}
                      alt={`Preset avatar ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  </button>
                ))}
              </div>
              
              <div className="border-t border-white/10 pt-6">
                <p className="text-sm text-gray-400 mb-4">Or upload your own:</p>
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        uploadProfilePicture(e.target.files[0]);
                      }
                    }}
                    disabled={uploadingProfilePicture}
                    className="hidden"
                  />
                  <div className="px-4 py-2 bg-slate-700 hover:bg-slate-600 transition-colors rounded-lg text-center cursor-pointer disabled:opacity-50">
                    {uploadingProfilePicture ? 'Uploading...' : 'Upload Custom Image'}
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Artist Request Modal */}
        {showArtistRequestModal && (
          <div 
            className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowArtistRequestModal(false)}
          >
            <div 
              className={`bg-slate-800 border border-white/20 p-6 ${isMobile ? 'w-full' : 'max-w-md w-full'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Request New Artist</h2>
                <button 
                  onClick={() => setShowArtistRequestModal(false)}
                  className="p-2 hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Artist Name</label>
                  <input
                    type="text"
                    value={requestedArtistName}
                    onChange={(e) => setRequestedArtistName(e.target.value)}
                    placeholder="Enter artist name"
                    className="w-full px-3 py-2 bg-black/50 border border-white/20 focus:border-purple-400 focus:outline-none rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Genre</label>
                  <select
                    value={requestedArtistGenre}
                    onChange={(e) => setRequestedArtistGenre(e.target.value)}
                    className="w-full px-3 py-2 bg-black/50 border border-white/20 focus:border-purple-400 focus:outline-none rounded"
                  >
                    <option value="Hip-Hop">Hip-Hop</option>
                    <option value="R&B">R&B</option>
                    <option value="Pop">Pop</option>
                    <option value="Rock">Rock</option>
                    <option value="Jazz">Jazz</option>
                    <option value="Electronic">Electronic</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Era</label>
                  <select
                    value={requestedArtistEra}
                    onChange={(e) => setRequestedArtistEra(e.target.value)}
                    className="w-full px-3 py-2 bg-black/50 border border-white/20 focus:border-purple-400 focus:outline-none rounded"
                  >
                    <option value="2020s">2020s</option>
                    <option value="2010s">2010s</option>
                    <option value="2000s">2000s</option>
                    <option value="1990s">1990s</option>
                    <option value="1980s">1980s</option>
                    <option value="1970s">1970s</option>
                    <option value="1960s">1960s</option>
                    <option value="Earlier">Earlier</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Additional Notes (Optional)</label>
                  <textarea
                    value={requestNotes}
                    onChange={(e) => setRequestNotes(e.target.value)}
                    placeholder="Any additional info about the artist..."
                    rows={3}
                    className="w-full px-3 py-2 bg-black/50 border border-white/20 focus:border-purple-400 focus:outline-none rounded resize-none"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={submitArtistRequest}
                  disabled={!requestedArtistName.trim()}
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium rounded"
                >
                  Submit Request
                </button>
                <button
                  onClick={() => setShowArtistRequestModal(false)}
                  className="flex-1 py-2 bg-white/10 hover:bg-white/20 border border-white/20 transition-colors rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Category Selector Modal */}
        {showCustomCategorySelector && (
          <CustomCategorySelector 
            supabase={supabase}
            currentUser={currentUser}
            onCategorySelected={handleCustomCategorySelected}
            onClose={() => setShowCustomCategorySelector(false)}
            existingUserCategories={userLists}
          />
        )}

        {/* Canon Explanation Modal */}
        {showCanonExplanation && (
          <div 
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowCanonExplanation(false)}
          >
            <div 
              className={`bg-slate-800 border border-white/20 ${isMobile ? 'w-full max-h-[90vh]' : 'max-w-4xl w-full max-h-[85vh]'} overflow-y-auto`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-slate-800 border-b border-white/10 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Crown className="w-8 h-8 text-yellow-400" />
                  <div>
                    <h2 className="text-2xl font-black text-white">THE CANON</h2>
                    <p className="text-purple-400 text-sm font-medium">How we settle the greatest debate in music</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCanonExplanation(false)}
                  className="p-2 hover:bg-white/10 transition-colors rounded"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-8">
                {/* Introduction */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-3">Welcome to the Ultimate Hip-Hop Rankings</h3>
                  <p className="text-gray-300 leading-relaxed">
                    For decades, hip-hop heads have argued about who belongs in the pantheon of greatness. 
                    The Canon isn't just another ranking site—it's a <span className="text-purple-400 font-semibold">smart democracy</span> that 
                    amplifies the voices of true hip hop fans while giving everyone a chance to be heard.
                  </p>
                </div>

                {/* How It Works */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-purple-400" />
                    How The Canon Works
                  </h3>
                  <div className="space-y-4 text-gray-300">
                    <div className="bg-slate-700/30 border border-white/10 p-4 rounded-lg">
                      <p className="font-semibold text-white mb-2">🗳️ Your Voice Builds the Canon</p>
                      <p>Every member builds their personal Top XX list. These individual canons form the backbone of our collective rankings.</p>
                    </div>
                    <div className="bg-slate-700/30 border border-white/10 p-4 rounded-lg">
                      <p className="font-semibold text-white mb-2">🧠 Intelligent Weighting</p>
                      <p>Not all opinions carry equal weight. Our algorithm identifies users who demonstrate deep knowledge across eras, styles, and deep cuts—then amplifies their voice in the final rankings.</p>
                    </div>
                    <div className="bg-slate-700/30 border border-white/10 p-4 rounded-lg">
                      <p className="font-semibold text-white mb-2">⚡ Dynamic Updates</p>
                      <p>The Canon evolves in real-time as members engage, debate, and refine their tastes. Fresh perspectives constantly challenge the established order.</p>
                    </div>
                  </div>
                </div>

                {/* Credibility System */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Award className="w-6 h-6 text-yellow-400" />
                    Your Voice Matters More As You Level Up
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Earn credibility through thoughtful engagement, diverse knowledge, and community recognition. 
                    Your tier badge shows your influence level—and every tier comes with real voting power.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {Object.entries(credibilityTiers).map(([key, tier]) => (
                      <div key={key} className="bg-slate-700/30 border border-white/10 p-4 rounded-lg text-center">
                        <div 
                          className="text-2xl mb-2"
                          style={{ color: tier.color }}
                        >
                          {tier.icon}
                        </div>
                        <p className="font-semibold text-white text-sm">{tier.name}</p>
                        <p className="text-xs text-gray-400 mb-1">{tier.weight}x Voice Weight</p>
                        <p className="text-xs text-gray-500">{tier.minScore}+ points</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-lg">
                    <p className="text-sm text-gray-300">
                      <span className="font-semibold text-purple-400">Pro tip:</span> Diamond members' votes count 5x more than Bronze. 
                      Earn your stripes by showcasing knowledge across different eras, engaging thoughtfully in debates, and building comprehensive rankings.
                    </p>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                    What Makes Us Different
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Flame className="w-3 h-3 text-purple-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Hot Debates</p>
                          <p className="text-gray-400">Tag artists, challenge conventional wisdom, and let the community decide who's right.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Users className="w-3 h-3 text-purple-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Taste Compatibility</p>
                          <p className="text-gray-400">Find users with similar taste and discover new artists through their recommendations.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Swords className="w-3 h-3 text-purple-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Head-to-Head Battles</p>
                          <p className="text-gray-400">Daily face-offs that help fine-tune the algorithm and your credibility score.</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Trophy className="w-3 h-3 text-purple-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Tournament Mode</p>
                          <p className="text-gray-400">March Madness-style brackets that settle specific debates once and for all.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Target className="w-3 h-3 text-purple-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Custom Categories</p>
                          <p className="text-gray-400">Create your own rankings for any theme—from "Best Debut Albums" to "Hardest Beats".</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <TrendingUp className="w-3 h-3 text-purple-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Real-Time Evolution</p>
                          <p className="text-gray-400">Watch as new releases, rediscovered classics, and shifting tastes reshape the canon.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Call to Action */}
                <div className="text-center p-6 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/50 rounded-lg">
                  <h3 className="text-xl font-bold text-white mb-2">Ready to Shape Hip-Hop History?</h3>
                  <p className="text-gray-300 mb-4">
                    Every vote counts, every debate matters, and every ranking tells a story. 
                    Join the conversation and help us build the most accurate, comprehensive, and respected hip-hop canon ever created.
                  </p>
                  <p className="text-sm text-purple-400 font-medium italic">
                    "Settle the Canon. Start the war."
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default TheCanon;