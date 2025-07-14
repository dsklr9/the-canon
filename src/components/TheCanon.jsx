// Part 1 of 5 - TheCanon Mobile Complete with v5 Integration
import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { Heart, MessageCircle, Share2, TrendingUp, Users, Zap, Trophy, Flame, Star, ChevronDown, X, Check, Shuffle, Timer, Search, Plus, GripVertical, User, Edit2, Save, ArrowUp, ArrowDown, Swords, Crown, Settings, Copy, BarChart3, Sparkles, Target, Gift, AlertCircle, Loader2, Filter, Clock, Award, TrendingDown, Users2, Bell } from 'lucide-react';
import { ReportModal, useRateLimit, filterContent } from './ModerationComponents';

// Add CSS styles to prevent viewport issues
const globalStyles = `
  @media (max-width: 768px) {
    body {
      position: fixed;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    
    #root {
      position: fixed;
      width: 100%;
      height: 100%;
      overflow: hidden;
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
    
    /* Prevent text selection on draggable items */
    .draggable-item {
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;
      touch-action: none;
      position: relative;
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
    <div className={`fixed bottom-4 right-4 ${bgColors[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-slide-up`}>
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
      setIsMobile(window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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
    // Only handle touches on the drag handle or draggable item itself
    const isDragTarget = e.target.closest('.drag-handle') || e.target.closest('.draggable-item');
    if (!isDragTarget) return;
    
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
    
    setDraggedElement({ element: e.currentTarget, data });
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
      
      // Find drop target
      const touch = e.changedTouches[0];
      const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
      
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
    const hourInMs = 60 * 60 * 1000;
    
    if (now - lastFaceOffTime < hourInMs) {
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
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [draggedFromList, setDraggedFromList] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [otherListSearchQueries, setOtherListSearchQueries] = useState({});
  const [otherListSearchResults, setOtherListSearchResults] = useState({});
  const [editingRanking, setEditingRanking] = useState(null);
  const [viewingFriend, setViewingFriend] = useState(null);
  const [friendRankings, setFriendRankings] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [showTop100Modal, setShowTop100Modal] = useState(false);
  const [loadedRankings, setLoadedRankings] = useState(100);
  const [promptAddToList, setPromptAddToList] = useState(false);
  const [selectedArtistToAdd, setSelectedArtistToAdd] = useState(null);
  const [username, setUsername] = useState("HipHopFan2025");
  const [editingUsername, setEditingUsername] = useState(false);
  const [userStreak, setUserStreak] = useState(0);
  const [userPoints, setUserPoints] = useState(0);
  const [userAchievements, setUserAchievements] = useState([]);
  const [showArtistCard, setShowArtistCard] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all-time');
  const [dailyFaceOffsCompleted, setDailyFaceOffsCompleted] = useState(0);
  const [showDebateModal, setShowDebateModal] = useState(false);
  const [debateTitle, setDebateTitle] = useState('');
  const [debateContent, setDebateContent] = useState('');
  const searchRef = useRef(null);
  const myTop10SearchRef = useRef(null);
  const [fullRankings, setFullRankings] = useState([]);
  
  // New debate-related state
  const [realDebates, setRealDebates] = useState([]);
  const [selectedArtistTags, setSelectedArtistTags] = useState([]);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [showTagSearch, setShowTagSearch] = useState(false);
  
  // New social features state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportContent, setReportContent] = useState(null);
  const [userLikes, setUserLikes] = useState(new Set());
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
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
  const [userBadges, setUserBadges] = useState([]);
  const [hotTakes, setHotTakes] = useState([]);
  const [collaborativeLists, setCollaborativeLists] = useState([]);
  const [rankingComments, setRankingComments] = useState({});
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentingOn, setCommentingOn] = useState(null);
  
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
  
  // Toast notifications
  const [toasts, setToasts] = useState([]);

  // Mobile detection
  const isMobile = useIsMobile();
  
  // Enhanced rate limiting
  const { checkRateLimit, checkFaceOffLimit } = useEnhancedRateLimit(supabase);

  // Artist Avatar Component
  const ArtistAvatar = memo(({ artist, size = "w-8 h-8" }) => {
    const imageUrl = artist.avatar_url || (artist.avatar && artist.avatar.startsWith && artist.avatar.startsWith('http') ? artist.avatar : null);
    
    if (imageUrl) {
      return <img src={imageUrl} alt={artist.name} className={`${size} rounded-full object-cover`} loading="lazy" />;
    }
    
    const emoji = artist.avatar && !artist.avatar.startsWith('http') ? artist.avatar : '🎤';
    return <span className="text-2xl">{emoji}</span>;
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
        
        // Check if touch is on a draggable element
        const target = e.target.closest('.draggable-item, .drag-handle');
        if (target) {
          // Let our custom drag handler deal with it
          return;
        }
      };
      
      // Also prevent scroll bounce on iOS
      const preventScrollBounce = (e) => {
        const target = e.target.closest('.draggable-item, .drag-handle');
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

  // Category definitions
  const rankingCategories = [
    { id: 'all-time', name: 'Greatest of All Time', locked: true },
    { id: 'lyricists', name: 'Best Lyricists' },
    { id: 'influential', name: 'Most Influential' },
    { id: 'flow', name: 'Best Flow' },
    { id: 'upcoming', name: 'Best Up & Coming' },
    { id: 'current', name: 'Best in the Game (Right Now)' }
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

  // Combined initialization effect
  useEffect(() => {
    let mounted = true;
    
    const initializeApp = async () => {
      console.log('Starting app initialization...');
      
      try {
        // First check authentication and first login
        const { data: { user } } = await supabase.auth.getUser();
        if (!mounted) return;
        
        if (user) {
          setCurrentUser(user);
          
          // Check first login
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
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
          setUsername(profile?.username || profile?.display_name || user.email.split('@')[0]);
          setUserStreak(profile?.login_streak || 0);
          setUserPoints(profile?.total_points || 0);
          
          // Load all data in parallel for better performance
          await Promise.all([
            loadUserRankings(user.id),
            loadArtistsFromDB(),
            loadDebates(),
            loadUserLikes(),
            loadFriends(),
            loadDailyChallenge(),
            loadBattleHistory()
          ]);
        }
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

  // Real-time subscription for friend requests
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
          // Reload friends when friendship data changes
          loadFriends();
        }
      )
      .subscribe();

    return () => {
      friendRequestsSubscription.unsubscribe();
    };
  }, [currentUser]);

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
      
      // Load user's rankings
      await loadUserRankings(user.id);
    }
  };

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
          artists: ranking.ranking_items
            .sort((a, b) => a.position - b.position)
            .map(item => ({
              ...item.artists,
              avatar: item.artists.avatar_url || '🎤',
              canonScore: item.artists.heat_score || 50,
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
            username,
            display_name
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
          user: debate.profiles.username || debate.profiles.display_name,
          avatar: "🎤",
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

  // Load ranking comments
  const loadRankingComments = async (rankingId) => {
    try {
      const { data: comments } = await supabase
        .from('ranking_comments')
        .select(`
          *,
          profiles (username, display_name)
        `)
        .eq('ranking_id', rankingId)
        .order('created_at', { ascending: false });
      
      if (comments) {
        setRankingComments(prev => ({
          ...prev,
          [rankingId]: comments
        }));
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
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
  const loadFriends = async () => {
    if (!currentUser) return;

    try {
      // Load accepted friends
      const { data: friendships } = await supabase
        .from('friendships')
        .select(`
          *,
          friend:friend_id(id, username, display_name),
          user:user_id(id, username, display_name)
        `)
        .or(`user_id.eq.${currentUser.id},friend_id.eq.${currentUser.id}`)
        .eq('status', 'accepted');

      if (friendships) {
        const friendList = friendships.map(f => 
          f.user_id === currentUser.id ? f.friend : f.user
        );
        setFriends(friendList);
      }

      // Load pending requests
      const { data: requests } = await supabase
        .from('friendships')
        .select(`
          *,
          user:user_id(id, username, display_name)
        `)
        .eq('friend_id', currentUser.id)
        .eq('status', 'pending');

      if (requests) {
        setFriendRequests(requests);
      }
    } catch (error) {
      console.error('Error loading friends:', error);
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

  // Toggle like on debate with rate limiting
  const toggleLike = async (debateId) => {
    if (!currentUser) {
      addToast('Please log in to like debates', 'warning');
      return;
    }

    // Check rate limit
    if (!await checkRateLimit('like', 30, 1)) {
      addToast('Too many likes! Please slow down.', 'warning');
      return;
    }

    try {
      if (userLikes.has(debateId)) {
        // Unlike
        await supabase
          .from('debate_likes')
          .delete()
          .eq('debate_id', debateId)
          .eq('user_id', currentUser.id);
        
        setUserLikes(prev => {
          const newSet = new Set(prev);
          newSet.delete(debateId);
          return newSet;
        });
        
        // Update local debate count
        setRealDebates(prev => prev.map(d => 
          d.id === debateId ? { ...d, likes: d.likes - 1 } : d
        ));
      } else {
        // Like
        await supabase
          .from('debate_likes')
          .insert({
            debate_id: debateId,
            user_id: currentUser.id
          });
        
        setUserLikes(prev => new Set([...prev, debateId]));
        
        // Update local debate count
        setRealDebates(prev => prev.map(d => 
          d.id === debateId ? { ...d, likes: d.likes + 1 } : d
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      addToast('Error updating like', 'error');
    }
  };

  // Post reply to debate
  const postReply = async () => {
    if (!currentUser || !replyingTo || !replyContent.trim()) return;

    // Check rate limit
    if (!await checkRateLimit('comment', 10, 5)) {
      addToast('Too many comments! Take a breather.', 'warning');
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
      
      setShowReplyModal(false);
      setReplyContent('');
      setReplyingTo(null);
      addToast('Reply posted!', 'success');
    } catch (error) {
      console.error('Error posting reply:', error);
      addToast('Error posting reply', 'error');
    }
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
        canonScore: artist.heat_score || 50,
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

  // Generate rankings when artists are loaded
  useEffect(() => {
    const hasAllTimeList = userLists.some(list => list.isAllTime);
    if (allArtists.length > 0 && hasAllTimeList) {
      setFullRankings(generateTop100());
    }
  }, [allArtists, userLists]);

  // Generate face-offs when notable artists are loaded
  useEffect(() => {
    if (notableArtists.length >= 2 && !showTutorial && checkFaceOffLimit()) {
      const newFaceOff = generateFaceOff();
      if (newFaceOff) {
        setFaceOffs([newFaceOff]);
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

  // Calculate Canon Score
  const calculateCanonScore = (appearanceRate, avgPosition) => {
    const positionScore = (11 - avgPosition) / 10;
    return Math.round((appearanceRate * 0.7 + positionScore * 0.3) * 100);
  };

  // Save ranking to database with validation
  const saveRankingToDatabase = async (ranking) => {
    if (!currentUser) return;
    
    // Validate ranking
    if (!ranking.title || ranking.title.trim().length < 3) {
      addToast('Ranking title too short', 'error');
      return;
    }
    
    if (ranking.artists.length === 0) {
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

  // Save face-off vote to database with battle history
  const saveFaceOffVote = async (artist1Id, artist2Id, winnerId, conviction) => {
    if (!currentUser) return;
    
    try {
      const voteData = {
        user_id: currentUser.id,
        artist1_id: artist1Id,
        artist2_id: artist2Id,
        winner_id: winnerId,
        conviction_level: conviction,
        is_power_vote: conviction > 75,
        is_daily_challenge: faceOffs[currentFaceOff]?.isDailyChallenge || false,
        created_at: new Date().toISOString()
      };
      
      await supabase
        .from('faceoff_votes')
        .insert(voteData);

      // Update battle history
      setBattleHistory(prev => [voteData, ...prev]);

      // Award points
      const points = conviction > 75 ? 5 : 2;
      const bonusPoints = faceOffs[currentFaceOff]?.isDailyChallenge ? 3 : 0;
      await awardPoints(points + bonusPoints, 'faceoff_vote');
      
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
    
    if (!await checkRateLimit('debate', 5, 60)) {
      addToast('Too many debates! Wait a bit.', 'warning');
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
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      await loadDebates();
      
      setShowDebateModal(false);
      setDebateTitle('');
      setDebateContent('');
      setSelectedArtistTags([]);
      
      addToast('Debate posted! 🔥', 'success');
      
      // Check for debater badge
      const userDebates = realDebates.filter(d => d.isOwn);
      if (userDebates.length >= 10) {
        awardBadge('debater');
      }
      
    } catch (error) {
      console.error('Error creating debate:', error);
      addToast('Error creating debate', 'error');
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
  const sendFriendRequest = async (friendId) => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('friendships')
        .insert({
          user_id: currentUser.id,
          friend_id: friendId,
          status: 'pending'
        });

      if (error) {
        if (error.code === '23505') {
          addToast('Friend request already sent', 'info');
        } else {
          throw error;
        }
      } else {
        addToast('Friend request sent!', 'success');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      addToast('Error sending friend request', 'error');
    }
  };

  // Accept friend request
  const acceptFriendRequest = async (requestId) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (error) throw error;
      
      loadFriends();
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

  // Load friend's rankings
  const loadFriendRankings = async (friendId) => {
    try {
      const { data: rankings, error } = await supabase
        .from('user_rankings')
        .select(`
          *,
          ranking_artists (
            *,
            artists (*)
          )
        `)
        .eq('user_id', friendId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Format rankings similar to userLists
      const formattedRankings = rankings.map(ranking => ({
        id: ranking.id,
        title: ranking.list_title,
        category: ranking.list_type,
        isAllTime: ranking.is_all_time,
        artists: ranking.ranking_artists
          .sort((a, b) => a.position - b.position)
          .map(ra => ra.artists)
      }));

      setFriendRankings(formattedRankings);
    } catch (error) {
      console.error('Error loading friend rankings:', error);
      addToast('Error loading friend rankings', 'error');
    }
  };

  // Search for friends
  const searchFriends = async (query) => {
    if (!query || query.length < 2) {
      setFriendSearchResults([]);
      return;
    }

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
    }
  };

  // Extended rankings for top 100
  const generateTop100 = useCallback(() => {
    const rankings = [];
    
    const allTimeList = userLists.find(l => l.isAllTime);
    
    if (allTimeList) {
      allTimeList.artists.forEach((artist, index) => {
        rankings.push({
          rank: index + 1,
          artist: artist,
          lastWeek: index + 1,
          trend: 'stable',
          votes: 1,
          canonScore: artist.canonScore || artist.heat_score || 50
        });
      });
    }
    
    // Add trending logic
    rankings.forEach((item, idx) => {
      if (Math.random() < 0.1) item.trend = 'up';
      else if (Math.random() < 0.05) item.trend = 'down';
      else if (Math.random() < 0.02) item.trend = 'hot';
    });
    
    return rankings;
  }, [userLists]);

  // Search functionality with memoization
  const searchArtists = useCallback((query) => {
    if (!query || query.length < 2) return [];
    const lowerQuery = query.toLowerCase();
    return allArtists
      .filter(artist => 
        artist.name.toLowerCase().includes(lowerQuery) ||
        artist.era.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 8);
  }, [allArtists]);

  const searchResults = useMemo(() => searchArtists(searchQuery), [searchQuery, searchArtists]);

  // Handle search for other lists
  const handleOtherListSearch = useCallback((listId, query) => {
    setOtherListSearchQueries(prev => ({ ...prev, [listId]: query }));
    if (query && query.length > 1) {
      const results = searchArtists(query);
      setOtherListSearchResults(prev => ({ ...prev, [listId]: results }));
    } else {
      setOtherListSearchResults(prev => ({ ...prev, [listId]: [] }));
    }
  }, [searchArtists]);

  // List management functions
  const updateListAndSave = useCallback((listId, newArtists) => {
    const updatedLists = userLists.map(l => 
      l.id === listId ? { ...l, artists: newArtists } : l
    );
    setUserLists(updatedLists);
    
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
  const handleMobileDragStart = useCallback((artist, listId) => {
    setDraggedItem({ artist, listId });
    setDraggedFromList(listId);
  }, []);

  const handleMobileDragMove = useCallback((touch) => {
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropTarget = element?.closest('[data-drop-index]');
    
    if (dropTarget) {
      const index = parseInt(dropTarget.dataset.dropIndex);
      setDragOverIndex(index);
    }
  }, []);

  const handleMobileDragEnd = useCallback((data, dropTarget) => {
    if (!draggedItem || !dropTarget) {
      setDraggedItem(null);
      setDragOverIndex(null);
      return;
    }

    // First try to find a drop index directly
    const dropIndexElement = dropTarget.closest('[data-drop-index]');
    if (!dropIndexElement) {
      setDraggedItem(null);
      setDragOverIndex(null);
      return;
    }

    // Then find the list container
    const dropZone = dropIndexElement.closest('[data-list-id]');
    if (!dropZone) {
      setDraggedItem(null);
      setDragOverIndex(null);
      return;
    }

    const listId = dropZone.dataset.listId;
    const targetIndex = parseInt(dropIndexElement.dataset.dropIndex || '0');

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
    setDraggedFromList(null);
  }, [draggedItem, userLists]);

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

  const createNewList = useCallback((categoryId = null) => {
    const category = rankingCategories.find(c => c.id === categoryId);
    const tempId = `temp-${Date.now()}`;
    const newList = {
      id: tempId,
      title: category ? category.name : "New Ranking",
      category: categoryId,
      artists: [],
      created: "Just now",
      isAllTime: categoryId === 'all-time'
    };
    setUserLists([...userLists, newList]);
    if (!categoryId) {
      setEditingRanking(tempId);
    }
    
    // If it's not an all-time list, save it immediately to enable editing
    if (categoryId && categoryId !== 'all-time') {
      saveRankingToDatabase(newList);
    }
  }, [userLists]);

  const hasAllTimeList = userLists.some(list => list.isAllTime);

  const handleScroll = useCallback((e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (bottom && loadedRankings < 150) {
      setLoadedRankings(prev => prev + 50);
    }
  }, [loadedRankings]);

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
    const shareUrl = `${window.location.origin}/user/${username}/${list.id}`;
    const shareText = `Check out my ${list.title} on The Canon:\n${list.artists.slice(0, 5).map((a, i) => `${i + 1}. ${a.name}`).join('\n')}`;
    
    if (navigator.share) {
      navigator.share({
        title: `${username}'s ${list.title}`,
        text: shareText,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      addToast('Link copied to clipboard!', 'success');
    }
  }, [username]);

  const calculateUniqueness = useCallback((list) => {
    const uniquePicks = Math.floor(list.artists.length * 0.3);
    return {
      score: uniquePicks,
      percentage: list.artists.length > 0 ? Math.round((uniquePicks / list.artists.length) * 100) : 0
    };
  }, []);

  const checkPioneerStatus = useCallback((artistId) => {
    return Math.random() < 0.1;
  }, []);

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
      saveFaceOffVote(
        faceOffs[currentFaceOff].artist1.id,
        faceOffs[currentFaceOff].artist2.id,
        winnerId,
        convictionLevel
      );
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
    }, 300);
  };

  const toggleComments = (debateId) => {
    setExpandedComments(prev => ({ ...prev, [debateId]: !prev[debateId] }));
  };

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
    <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-white/20 p-8 max-w-md w-full">
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
      <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
        <div className={`bg-slate-800 border border-white/20 p-6 ${isMobile ? 'w-full' : 'max-w-2xl w-full'} max-h-[80vh] overflow-y-auto`}>
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
                        <span className="text-sm font-medium text-purple-300">{item.friend.username}</span>
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

  // Loading state
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-400">Loading The Canon...</p>
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
      <div className={`min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white font-sans ${isMobile ? 'overflow-hidden fixed inset-0' : ''}`}>
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
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 text-center">
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
                  <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-black tracking-tight flex items-center gap-2`}>
                    THE CANON
                    <Crown className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-yellow-400`} />
                  </h1>
                  {!isMobile && (
                    <div className="text-xs text-gray-400 italic">Settle the Canon. Start the war.</div>
                  )}
                </div>
                <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-4'}`}>
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
            <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
              <div className={`bg-slate-800 border border-white/20 p-6 ${isMobile ? 'w-full' : 'max-w-md w-full'}`}>
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
            <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-800 border border-white/20 p-6 max-w-md w-full">
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
            <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
              <div className={`bg-slate-800 border border-white/20 p-6 ${isMobile ? 'w-full' : 'max-w-lg w-full'} max-h-[80vh] overflow-y-auto`}>
                <h2 className="text-xl font-bold mb-4">Start a Debate</h2>
                
                <input
                  type="text"
                  placeholder="Debate title..."
                  value={debateTitle}
                  onChange={(e) => setDebateTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-black/50 border border-white/20 focus:border-purple-400 focus:outline-none mb-4"
                />
                
                <textarea
                  placeholder="Make your case..."
                  value={debateContent}
                  onChange={(e) => setDebateContent(e.target.value)}
                  className="w-full px-4 py-2 bg-black/50 border border-white/20 focus:border-purple-400 focus:outline-none h-32 mb-4"
                />
                
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
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={createDebate}
                    className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 transition-colors font-medium"
                  >
                    Post Debate
                  </button>
                  <button
                    onClick={() => {
                      setShowDebateModal(false);
                      setDebateTitle('');
                      setDebateContent('');
                      setSelectedArtistTags([]);
                    }}
                    className="flex-1 py-2 bg-white/10 hover:bg-white/20 border border-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reply Modal */}
          {showReplyModal && replyingTo && (
            <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
              <div className={`bg-slate-800 border border-white/20 p-6 ${isMobile ? 'w-full' : 'max-w-lg w-full'}`}>
                <h2 className="text-xl font-bold mb-4">Reply to Debate</h2>
                
                <div className="bg-black/30 p-3 mb-4 rounded">
                  <p className="text-sm text-gray-400">Replying to:</p>
                  <p className="font-bold">{replyingTo.title}</p>
                </div>
                
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full px-4 py-2 bg-black/50 border border-white/20 focus:border-purple-400 focus:outline-none h-32 mb-4"
                />
                
                <div className="flex gap-3">
                  <button
                    onClick={postReply}
                    className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 transition-colors font-medium"
                  >
                    Post Reply
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
            <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
              <div className={`bg-slate-800 border border-white/20 p-6 ${isMobile ? 'w-full' : 'max-w-4xl w-full'} max-h-[80vh] flex flex-col`}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold tracking-tight flex items-center gap-2`}>
                    <Trophy className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-yellow-400`} />
                    THE CANON TOP 100+
                  </h2>
                  <button onClick={() => setShowTop100Modal(false)} className="p-2 hover:bg-white/10 transition-colors touch-target">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto" onScroll={handleScroll}>
                  <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-4`}>
                    {fullRankings.slice(0, loadedRankings).map((item) => (
                      <div 
                        key={item.rank} 
                        className={`flex items-center gap-3 p-3 bg-black/30 border cursor-pointer hover:bg-white/5 ${
                          item.trend === 'hot' ? 'border-orange-400/50 bg-orange-500/5' : 'border-white/10'
                        }`}
                        onClick={() => setShowArtistCard(item.artist)}
                      >
                        <div className="w-12 text-center">
                          <span className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-gray-400`}>#{item.rank}</span>
                        </div>
                        
                        <div className="w-8">
                          {item.trend === 'up' && <ArrowUp className="w-4 h-4 text-green-400" />}
                          {item.trend === 'down' && <ArrowDown className="w-4 h-4 text-red-400" />}
                          {item.trend === 'hot' && <Flame className="w-4 h-4 text-orange-400" />}
                        </div>
                        
                        <div className="text-2xl"><ArtistAvatar artist={item.artist} /></div>
                        
                        <div className="flex-1">
                          <p className="font-bold">{item.artist.name}</p>
                          <p className="text-sm text-gray-400">{item.artist.era}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              quickAddToList(item.artist);
                            }}
                            className="p-1.5 hover:bg-white/10 border border-white/10 transition-colors touch-target"
                            title="Add to My Top 10"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <div className="text-right">
                            <p className="text-sm font-medium">{item.canonScore}</p>
                            <p className="text-xs text-gray-500">{item.votes.toLocaleString()} votes</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {loadedRankings < 150 && (
                    <div className="text-center py-8 text-gray-500">
                      Scroll for more...
                    </div>
                  )}
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
                  onClick={() => setActiveTab('mytop10')}
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
                  onClick={() => setActiveTab('mypeople')}
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
            {activeTab === 'foryou' ? (
              <div className="space-y-6">
                {/* Add Debate Button */}
                <button
                  onClick={() => setShowDebateModal(true)}
                  className="w-full py-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-400/50 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Start a Debate
                </button>
                
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
                                <div className="text-2xl">{debate.avatar}</div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold">{debate.user}</span>
                                    <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5">Your debate</span>
                                    {debate.hot && <Flame className="w-4 h-4 text-orange-500" />}
                                    <span className="text-gray-500 text-sm ml-auto">{debate.timestamp}</span>
                                  </div>
                                  <h4 className="font-bold mb-1">{debate.title}</h4>
                                  <p className="mb-2 leading-relaxed">{debate.content}</p>
                                  
                                  {/* Artist Tags */}
                                  {debate.artistTags.length > 0 && (
                                    <div className="flex gap-2 mb-3">
                                      {debate.artistTags.map((artistId) => {
                                        const artist = allArtists.find(a => a.id === artistId);
                                        return artist ? (
                                          <span key={artistId} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                                            <ArtistAvatar artist={artist} /> {artist.name}
                                          </span>
                                        ) : null;
                                      })}
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center gap-4">
                                    <button 
                                      onClick={() => toggleLike(debate.id)}
                                      className={`flex items-center gap-1 text-sm transition-colors ${
                                        userLikes.has(debate.id) 
                                          ? 'text-purple-400' 
                                          : 'hover:text-purple-400'
                                      }`}
                                    >
                                      <Heart 
                                        className={`w-4 h-4 ${userLikes.has(debate.id) ? 'fill-current' : ''}`} 
                                      />
                                      {debate.likes}
                                    </button>
                                    <button 
                                      onClick={() => {
                                        setReplyingTo(debate);
                                        setShowReplyModal(true);
                                      }}
                                      className="flex items-center gap-1 text-sm hover:text-purple-400 transition-colors"
                                    >
                                      <MessageCircle className="w-4 h-4" />
                                      {debate.replies}
                                    </button>
                                    <button className="flex items-center gap-1 text-sm hover:text-purple-400 transition-colors">
                                      <Share2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* All Debates */}
                    <div className="space-y-4">
                      {/* Show real debates first */}
                      {realDebates.filter(d => !d.isOwn).map((debate) => (
                        <div key={debate.id} className="bg-slate-800/50 border border-white/10 p-4">
                          <div className="flex gap-3">
                            <div className="text-2xl">{debate.avatar}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold">{debate.user}</span>
                                {debate.hot && <Flame className="w-4 h-4 text-orange-500" />}
                                <span className="text-gray-500 text-sm ml-auto">{debate.timestamp}</span>
                              </div>
                              <h4 className="font-bold mb-1">{debate.title}</h4>
                              <p className="mb-2 leading-relaxed">{debate.content}</p>
                              
                              {/* Artist Tags */}
                              {debate.artistTags.length > 0 && (
                                <div className="flex gap-2 mb-3">
                                  {debate.artistTags.map((artistId) => {
                                    const artist = allArtists.find(a => a.id === artistId);
                                    return artist ? (
                                      <span key={artistId} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                                        <ArtistAvatar artist={artist} /> {artist.name}
                                      </span>
                                    ) : null;
                                  })}
                                </div>
                              )}
                              
                              <div className="flex items-center gap-4">
                                <button 
                                  onClick={() => toggleLike(debate.id)}
                                  className={`flex items-center gap-1 text-sm transition-colors ${
                                    userLikes.has(debate.id) 
                                      ? 'text-purple-400' 
                                      : 'hover:text-purple-400'
                                  }`}
                                >
                                  <Heart 
                                    className={`w-4 h-4 ${userLikes.has(debate.id) ? 'fill-current' : ''}`} 
                                  />
                                  {debate.likes}
                                </button>
                                <button 
                                  onClick={() => {
                                    setReplyingTo(debate);
                                    setShowReplyModal(true);
                                  }}
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
                          {fullRankings.slice(0, 10).map((item, idx) => (
                            <div 
                              key={idx} 
                              className={`flex items-center gap-2 px-2 py-1 ${isMobile ? 'text-sm' : 'text-xs'} cursor-pointer hover:bg-white/5 ${
                                item.trend === 'hot' ? 'bg-orange-500/10 border-l-2 border-orange-400' : ''
                              }`}
                              onClick={() => setShowArtistCard(item.artist)}
                            >
                              <div className={`text-center ${isMobile ? 'w-10' : 'w-8'}`}>
                                <span className="font-bold text-gray-500">#{item.rank}</span>
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
                                <span className={`text-gray-500 ${isMobile ? 'text-sm' : 'text-xs'}`}>{item.canonScore}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className={`mt-3 pt-3 border-t border-white/10 flex justify-between text-gray-400 ${isMobile ? 'text-sm' : 'text-xs'}`}>
                          <span>{userLists.filter(l => l.isAllTime).length > 0 ? '1 voter' : '0 voters'}</span>
                          <span>Avg unique: 6.8</span>
                        </div>
                      </div>
                    </div>
                  )}
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
                  // Show existing all-time list
                  userLists
                    .filter(list => list.isAllTime)
                    .map(list => {
                      const uniqueness = calculateUniqueness(list);
                      const displayCount = Math.min(list.artists.length, 20);
                      
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
                                }}
                                onFocus={() => setShowSearchResults(true)}
                                placeholder="Search artists to add..."
                                className="w-full pl-10 pr-4 py-2 bg-black/50 border border-white/20 focus:border-purple-400/50 focus:outline-none"
                              />
                            </div>
                            
                            {/* Search Results */}
                            {showSearchResults && searchQuery && searchResults.length > 0 && (
                              <div className="absolute top-full mt-2 w-full bg-slate-800 border border-white/20 shadow-xl max-h-64 overflow-y-auto z-10">
                                {searchResults.map((artist) => {
                                  const friendCount = getFriendCountForArtist(artist.id);
                                  return (
                                    <div
                                      key={artist.id}
                                      className="p-3 hover:bg-white/10 transition-colors flex items-center gap-3 cursor-pointer"
                                      onClick={() => addArtistToList(artist, list.id)}
                                    >
                                      <span className="text-2xl"><ArtistAvatar artist={artist} /></span>
                                      <div className="flex-1">
                                        <p className="font-medium">{artist.name}</p>
                                        <div className="flex items-center gap-2">
                                          <p className="text-sm text-gray-400">{artist.era} • Canon Score: {artist.canonScore}</p>
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
                                
                                <div
                                  data-drop-index={index}
                                  className={`flex items-center ${isMobile ? 'gap-2 p-2' : 'gap-3 p-3'} bg-black/30 border border-white/10 ${
                                    isMobile ? '' : 'cursor-move hover:bg-white/10'
                                  } transition-all duration-200 ${
                                    draggedItem?.artist.id === artist.id ? 'opacity-50' : ''
                                  } ${isMobile ? 'draggable-item' : ''}`}
                                  {...(isMobile ? {
                                    onTouchStart: (e) => mobileDrag.handleTouchStart(e, { artist, listId: list.id }),
                                    onTouchMove: mobileDrag.handleTouchMove,
                                    onTouchEnd: mobileDrag.handleTouchEnd
                                  } : {
                                    draggable: true,
                                    onDragStart: (e) => handleDragStart(e, artist, list.id),
                                    onDragEnd: handleDragEnd,
                                    onDragEnter: (e) => handleDragEnter(e, index),
                                    onDragOver: handleDragOver,
                                    onDrop: (e) => handleDrop(e, index, list.id)
                                  })}
                                >
                                  <div className={`drag-handle ${isMobile ? 'touch-target flex items-center justify-center w-8 h-8' : ''}`}>
                                    <GripVertical className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-gray-400`} />
                                  </div>
                                  <span className={`font-black text-gray-300 ${isMobile ? 'text-sm w-6 text-center' : 'text-xl w-8'}`}>#{index + 1}</span>
                                  <ArtistAvatar artist={artist} size={isMobile ? 'w-8 h-8' : 'w-10 h-10'} />
                                  <div 
                                    className="flex-1 min-w-0"
                                    onClick={(e) => {
                                      if (!isMobile || !mobileDrag.isDragging) {
                                        e.stopPropagation();
                                        setShowArtistCard(artist);
                                      }
                                    }}
                                  >
                                    <p className={`font-medium truncate ${isMobile ? 'text-sm' : ''}`}>{artist.name}</p>
                                    <p className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>{artist.era}</p>
                                  </div>
                                  {checkPioneerStatus(artist.id) && (
                                    <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                                      🏆 Pioneer
                                    </span>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeArtistFromList(artist.id, list.id);
                                    }}
                                    className={`${isMobile ? 'p-1' : 'p-2'} hover:bg-white/10 transition-colors touch-target rounded`}
                                  >
                                    <X className="w-4 h-4 text-gray-400" />
                                  </button>
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
                          {list.artists.length > 20 && (
                            <button className="w-full mt-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 transition-colors text-sm">
                              Show All {list.artists.length}
                            </button>
                          )}
                        </div>
                      );
                    })
                )}

                {/* Other Category Lists */}
                <div>
                  <h2 className="text-lg font-bold mb-3">OTHER RANKINGS</h2>
                  <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-4`}>
                    {rankingCategories
                      .filter(cat => !cat.locked)
                      .map(category => {
                        const existingList = userLists.find(l => l.category === category.id);
                        
                        if (!existingList) {
                          return (
                            <button
                              key={category.id}
                              onClick={() => createNewList(category.id)}
                              className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-left"
                            >
                              <h3 className="font-bold mb-1">{category.name}</h3>
                              <p className="text-sm text-gray-400">Click to create this ranking</p>
                            </button>
                          );
                        }
                        
                        return (
                          <div key={category.id} className="bg-white/5 border border-white/10 p-4" data-list-id={existingList.id}>
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="font-bold">{existingList.title}</h3>
                              <button
                                onClick={() => shareList(existingList)}
                                className="p-1 hover:bg-white/10 transition-colors"
                              >
                                <Share2 className="w-3 h-3" />
                              </button>
                            </div>
                            {/* Add Search Bar for existing category lists */}
                            <div className="relative mb-3">
                              <input
                                type="text"
                                placeholder="Search artists..."
                                value={otherListSearchQueries[existingList.id] || ''}
                                className="w-full px-3 py-1.5 text-sm bg-black/50 border border-white/20 focus:border-purple-400/50 focus:outline-none rounded"
                                onChange={(e) => handleOtherListSearch(existingList.id, e.target.value)}
                                onBlur={() => {
                                  // Delay clearing to allow click on search results
                                  setTimeout(() => {
                                    setOtherListSearchResults(prev => ({ ...prev, [existingList.id]: [] }));
                                  }, 150);
                                }}
                              />
                              
                              {/* Search Results Dropdown */}
                              {otherListSearchResults[existingList.id] && otherListSearchResults[existingList.id].length > 0 && (
                                <div className="absolute top-full mt-1 w-full bg-slate-800 border border-white/20 shadow-xl max-h-48 overflow-y-auto z-20">
                                  {otherListSearchResults[existingList.id].map((artist) => (
                                    <div
                                      key={artist.id}
                                      className="p-3 hover:bg-white/10 transition-colors flex items-center gap-3 cursor-pointer"
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
                                  
                                  <div
                                    data-drop-index={index}
                                    className={`flex items-center ${isMobile ? 'gap-1 p-1.5' : 'gap-3 p-2'} bg-black/30 border border-white/10 ${
                                      isMobile ? '' : 'cursor-move hover:bg-white/10'
                                    } transition-all duration-200 ${
                                      draggedItem?.artist.id === artist.id ? 'opacity-50' : ''
                                    } ${isMobile ? 'draggable-item' : ''}`}
                                    {...(isMobile ? {
                                      onTouchStart: (e) => mobileDrag.handleTouchStart(e, { artist, listId: existingList.id }),
                                      onTouchMove: mobileDrag.handleTouchMove,
                                      onTouchEnd: mobileDrag.handleTouchEnd,
                                    } : {
                                      draggable: true,
                                      onDragStart: (e) => handleDragStart(e, artist, existingList.id),
                                      onDragOver: handleDragOver,
                                      onDragEnter: (e) => handleDragEnter(e, index),
                                      onDrop: (e) => handleDrop(e, index, existingList.id),
                                    })}
                                  >
                                    <div className={`drag-handle ${isMobile ? 'touch-target flex items-center justify-center w-6 h-6' : ''}`}>
                                      <GripVertical className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-gray-400`} />
                                    </div>
                                    <span className={`text-gray-400 font-bold ${isMobile ? 'text-xs w-4 text-center' : 'text-sm'}`}>#{index + 1}</span>
                                    <ArtistAvatar artist={artist} size={isMobile ? 'w-6 h-6' : 'w-8 h-8'} />
                                    <span className={`truncate flex-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>{artist.name}</span>
                                    <button
                                      onClick={() => {
                                        const newArtists = existingList.artists.filter(a => a.id !== artist.id);
                                        updateListAndSave(existingList.id, newArtists);
                                      }}
                                      className="p-1 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                                      title="Remove artist"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
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
                        );
                      })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* My People Tab Content */}
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
                    {showFriendSearch && friendSearchResults.length > 0 && (
                      <div className="absolute top-full mt-2 w-full bg-slate-800 border border-white/20 shadow-xl max-h-64 overflow-y-auto z-10">
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
                      </div>
                    )}
                  </div>
                </div>

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
                          <div>
                            <p className="font-bold">{request.user.username}</p>
                            <p className="text-sm text-gray-400">Wants to be your friend</p>
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
                  {friends.length > 0 ? (
                    <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-4`}>
                      {friends.map(friend => (
                        <div key={friend.id} className="bg-slate-800/50 border border-white/10 p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold">{friend.username}</p>
                              <p className="text-sm text-gray-400">Friend since recently</p>
                            </div>
                            <button 
                              onClick={() => {
                                setViewingFriend(friend);
                                loadFriendRankings(friend.id);
                              }}
                              className="px-3 py-1 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-400/50 transition-colors text-sm"
                            >
                              View Rankings
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No friends yet. Search for users above to add them!</p>
                  )}
                </div>

                {/* Friend Activity Feed */}
                <div>
                  <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                    Friend Activity
                    {friends.length > 0 && (
                      <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                        {friends.length} friend{friends.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </h2>
                  {friends.length > 0 ? (
                    <div className="space-y-3">
                      {/* Friend Debates */}
                      {realDebates && friends && realDebates
                        .filter(debate => friends.some(friend => friend.id === debate.author_id))
                        .slice(0, 3)
                        .map(debate => (
                          <div key={debate.id} className="bg-slate-800/30 border border-white/10 p-3 rounded">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                                <MessageCircle className="w-4 h-4 text-purple-400" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm">
                                  <span className="font-medium text-purple-400">{debate.author}</span> posted a debate
                                </p>
                                <p className="text-xs text-gray-400 truncate mt-1">{debate.content}</p>
                                <p className="text-xs text-gray-500 mt-1">{getRelativeTime(debate.timestamp)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      
                      {/* Simulated ranking activity */}
                      {friends.slice(0, 2).map((friend, idx) => (
                        <div key={`activity-${friend.id}`} className="bg-slate-800/30 border border-white/10 p-3 rounded">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                              <Crown className="w-4 h-4 text-yellow-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm">
                                <span className="font-medium text-purple-400">{friend.username}</span> updated their rankings
                              </p>
                              <p className="text-xs text-gray-400 mt-1">Added new artists to their Top 10</p>
                              <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {realDebates && friends && realDebates.filter(debate => friends.some(friend => friend.id === debate.author_id)).length === 0 && friends.length > 0 && (
                        <p className="text-gray-400 text-center py-4">Your friends haven't posted any debates yet, but check back soon!</p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Users className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                      <p className="text-gray-400">Add friends to see their activity!</p>
                      <p className="text-xs text-gray-500 mt-1">Friend activity includes rankings, debates, and more</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>

          {/* Friend Rankings Modal */}
          {viewingFriend && (
            <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
              <div className={`bg-slate-800 border border-white/20 p-6 ${isMobile ? 'w-full' : 'max-w-4xl w-full'} max-h-[80vh] flex flex-col`}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className={`font-bold tracking-tight flex items-center gap-2 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                    <User className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-purple-400`} />
                    {viewingFriend.username}'s Rankings
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
                
                <div className="flex-1 overflow-y-auto">
                  {friendRankings.length > 0 ? (
                    <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-4`}>
                      {friendRankings.map(list => (
                        <div key={list.id} className="bg-slate-700/50 border border-white/10 p-4">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-bold flex items-center gap-2">
                              {list.isAllTime && <Crown className="w-4 h-4 text-yellow-400" />}
                              {list.title}
                            </h3>
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
                        </div>
                      ))}
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
              onClick={() => setShowFaceOff(true)}
              className="p-4 bg-purple-500 border border-purple-400 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all touch-target"
            >
              <Swords className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Artist Card Modal */}
        {showArtistCard && <ArtistCard artist={showArtistCard} onClose={() => setShowArtistCard(null)} />}
      </div>
    </ErrorBoundary>
  );
};

export default TheCanon;