import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { Heart, MessageCircle, Share2, TrendingUp, Users, Zap, Trophy, Flame, Star, ChevronDown, X, Check, Shuffle, Timer, Search, Plus, GripVertical, User, Edit2, Save, ArrowUp, ArrowDown, Swords, Crown, Settings, Copy, BarChart3, Sparkles, Target, Gift, AlertCircle, Loader2, Filter, Clock, Award, TrendingDown, Users2 } from 'lucide-react';
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
    }
    
    /* Prevent text selection on draggable items */
    .draggable-item {
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;
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
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="text-gray-400 mb-4">The Canon hit an unexpected error</p>
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

// Enhanced mobile drag handler
const useMobileDrag = (onDragStart, onDragEnd, onDragMove) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedElement, setDraggedElement] = useState(null);
  const touchStartY = useRef(0);
  const touchCurrentY = useRef(0);
  const dragThreshold = 10; // pixels before drag starts

  const handleTouchStart = useCallback((e, data) => {
    e.preventDefault();
    touchStartY.current = e.touches[0].clientY;
    touchCurrentY.current = e.touches[0].clientY;
    setDraggedElement({ element: e.currentTarget, data });
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!draggedElement) return;
    
    e.preventDefault();
    touchCurrentY.current = e.touches[0].clientY;
    
    const distance = Math.abs(touchCurrentY.current - touchStartY.current);
    
    if (!isDragging && distance > dragThreshold) {
      setIsDragging(true);
      onDragStart && onDragStart(draggedElement.data);
      
      // Add visual feedback
      draggedElement.element.style.opacity = '0.5';
      draggedElement.element.style.transform = 'scale(1.05)';
    }
    
    if (isDragging && onDragMove) {
      onDragMove(e.touches[0]);
    }
  }, [draggedElement, isDragging, onDragStart, onDragMove]);

  const handleTouchEnd = useCallback((e) => {
    if (isDragging && draggedElement) {
      // Reset visual feedback
      draggedElement.element.style.opacity = '1';
      draggedElement.element.style.transform = 'scale(1)';
      
      // Find drop target
      const touch = e.changedTouches[0];
      const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
      
      onDragEnd && onDragEnd(draggedElement.data, dropTarget);
    }
    
    setIsDragging(false);
    setDraggedElement(null);
    touchStartY.current = 0;
    touchCurrentY.current = 0;
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
  // Core state - keeping all your existing state variables
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
  const [editingRanking, setEditingRanking] = useState(null);
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
  const [allArtists, setAllArtists] = useState([]);
  const [notableArtists, setNotableArtists] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [userLists, setUserLists] = useState([]);
  const [faceOffs, setFaceOffs] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDebates, setIsLoadingDebates] = useState(false);
  const [isLoadingRankings, setIsLoadingRankings] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [realDebates, setRealDebates] = useState([]);
  const [selectedArtistTags, setSelectedArtistTags] = useState([]);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [showTagSearch, setShowTagSearch] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportContent, setReportContent] = useState(null);
  const [userLikes, setUserLikes] = useState(new Set());
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [savingStatus, setSavingStatus] = useState('');
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [allArtistsFromDB, setAllArtistsFromDB] = useState([]);
  const [faceOffFilters, setFaceOffFilters] = useState({ era: 'all', region: 'all' });
  const [battleHistory, setBattleHistory] = useState([]);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [userBadges, setUserBadges] = useState([]);
  const [hotTakes, setHotTakes] = useState([]);
  const [collaborativeLists, setCollaborativeLists] = useState([]);
  const [rankingComments, setRankingComments] = useState({});
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentingOn, setCommentingOn] = useState(null);

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

  // Prevent viewport dragging on iOS
  useEffect(() => {
    if (isMobile) {
      // Prevent viewport dragging
      const preventDefaultTouch = (e) => {
        if (e.touches.length > 1) {
          e.preventDefault();
        }
      };
      
      document.addEventListener('touchmove', preventDefaultTouch, { passive: false });
      
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
    curator: { icon: '📚', name: 'Curator', description: 'Builds legendary lists' }
  };

  // Initialize app
  useEffect(() => {
    let mounted = true;
    
    const initializeApp = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!mounted) return;
        
        if (user) {
          setCurrentUser(user);
          
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
          
          setUsername(profile?.username || profile?.display_name || user.email.split('@')[0]);
          setUserStreak(profile?.login_streak || 0);
          setUserPoints(profile?.total_points || 0);
          
          await Promise.all([
            loadUserRankings(user.id),
            loadArtistsFromDB(),
            loadDebates(),
            loadUserLikes(),
            loadFriends()
          ]);
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
    
    initializeApp();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Load functions (simplified versions - add your full implementations)
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
          isAllTime: ranking.is_all_time
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

  const loadArtistsFromDB = async () => {
    try {
      const { data: artists, error } = await supabase
        .from('artists')
        .select('*')
        .order('name');
      
      if (!error && artists) {
        setAllArtistsFromDB(artists);
      }
    } catch (error) {
      console.error('Error loading artists:', error);
      addToast('Error loading artists', 'error');
    }
  };

  const loadDebates = async () => {
    // Add your debate loading logic
  };

  const loadUserLikes = async () => {
    // Add your likes loading logic
  };

  const loadFriends = async () => {
    // Add your friends loading logic
  };

  // Update artists when DB loads
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
      
      const notable = mappedArtists.filter(artist => 
        artist.heat_score >= 80 || 
        artist.wikipedia_id || 
        artist.classics_count >= 3
      );
      setNotableArtists(notable);
    }
  }, [allArtistsFromDB]);

  // Generate face-offs
  const generateFaceOff = useCallback(() => {
    if (notableArtists.length < 2) return null;
    
    const shuffled = [...notableArtists].sort(() => Math.random() - 0.5);
    return { 
      artist1: shuffled[0], 
      artist2: shuffled[1], 
      creator: "The Canon"
    };
  }, [notableArtists]);

  // Generate rankings
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
    
    return rankings;
  }, [userLists]);

  // Search functionality
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

    const dropZone = dropTarget.closest('[data-list-id]');
    if (!dropZone) return;

    const listId = dropZone.dataset.listId;
    const targetIndex = parseInt(dropTarget.dataset.dropIndex || '0');

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
    // Similar logic to mobile drag end
  }, []);

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

  const saveRankingToDatabase = async (ranking) => {
    // Add your save logic
    setSavingStatus('Saving...');
    setTimeout(() => setSavingStatus('Saved!'), 1000);
  };

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
  }, [userLists]);

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

  const quickAddToList = useCallback((artist) => {
    const allTimeList = userLists.find(l => l.isAllTime);
    if (!allTimeList) {
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
      if (!allTimeList.artists.find(a => a.id === artist.id)) {
        updateListAndSave(allTimeList.id, [...allTimeList.artists, artist]);
      }
    }
  }, [userLists, updateListAndSave]);

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
    return `MY TOP ${Math.ceil(count / 50) * 50}`;
  };

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
    
    setUserVotes({ ...userVotes, [currentFaceOff]: winnerId });
    setDailyFaceOffsCompleted(prev => prev + 1);
    
    setTimeout(() => {
      setShowFaceOff(false);
      const newFaceOff = generateFaceOff();
      if (newFaceOff) {
        setFaceOffs([newFaceOff]);
        setCurrentFaceOff(0);
      }
    }, 300);
  };

  const hasAllTimeList = userLists.some(list => list.isAllTime);

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

  // Artist Card Component
  const ArtistCard = ({ artist, onClose }) => (
    <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-white/20 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-4">
            <div className="text-6xl"><ArtistAvatar artist={artist} size="w-16 h-16" /></div>
            <div>
              <h2 className="text-2xl font-bold">{artist.name}</h2>
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
          <button onClick={onClose} className="p-2 hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-6">
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
                  {isMobile ? (
                    <div className="text-xs text-gray-400 italic whitespace-nowrap">
                      Settle the Canon.<br />Start the war.
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 italic">Settle the Canon. Start the war.</div>
                  )}
                </div>
                <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-4'}`}>
                  {isMobile ? (
                    <div className="flex items-center gap-1 text-xs">
                      <Star className="w-3 h-3 text-yellow-400" />
                      <span>{userPoints.toLocaleString()}</span>
                      <span className="text-purple-400 ml-1">
                        <Zap className="w-3 h-3 inline" />
                        {dailyPowerVotes}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400" />
                          {userPoints.toLocaleString()} points
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 px-3 py-1.5">
                        <Zap className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-medium">{dailyPowerVotes} Power Votes</span>
                      </div>
                    </>
                  )}
                  
                  <button 
                    onClick={() => setShowSettings(true)}
                    className={`p-2 hover:bg-white/10 border border-white/10 transition-colors ${isMobile ? 'touch-target' : ''}`}
                  >
                    <Settings className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Tutorial Modal */}
          {showTutorial && <Tutorial />}

          {/* Face-off Modal */}
          {showFaceOff && faceOffs.length > 0 && (
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
                      <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 transition-colors">
                        Update
                      </button>
                    </div>
                  </div>
                  
                  {isMobile && (
                    <button 
                      onClick={() => supabase.auth.signOut()}
                      className="w-full py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-400/50 transition-colors text-sm"
                    >
                      Sign Out
                    </button>
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
                  {activeTab === 'mypeople' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 py-6">
            {activeTab === 'mytop10' ? (
              <div className="space-y-6">
                {/* All-Time List */}
                {!hasAllTimeList ? (
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
                  <div>
                    {userLists
                      .filter(list => list.isAllTime)
                      .map(list => {
                        const uniqueness = calculateUniqueness(list);
                        const displayCount = Math.min(list.artists.length, 20);
                        
                        return (
                          <div key={list.id} className="bg-yellow-500/5 border-2 border-yellow-400/50 p-4" data-list-id={list.id}>
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
                                  {searchResults.map((artist) => (
                                    <div
                                      key={artist.id}
                                      className="p-3 hover:bg-white/10 transition-colors flex items-center gap-3 cursor-pointer"
                                      onClick={() => addArtistToList(artist, list.id)}
                                    >
                                      <span className="text-2xl"><ArtistAvatar artist={artist} /></span>
                                      <div className="flex-1">
                                        <p className="font-medium">{artist.name}</p>
                                        <p className="text-sm text-gray-400">{artist.era} • Canon Score: {artist.canonScore}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            {/* Artist List */}
                            <div className="space-y-2">
                              {list.artists.slice(0, displayCount).map((artist, index) => (
                                <div key={artist.id}>
                                  {dragOverIndex === index && draggedFromList === list.id && (
                                    <div className="h-1 bg-purple-400 rounded transition-all duration-200" />
                                  )}
                                  
                                  <div
                                    data-drop-index={index}
                                    className={`flex items-center gap-3 p-3 bg-black/30 border border-white/10 ${
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
                                    <div className={`${isMobile ? 'drag-handle touch-target flex items-center justify-center w-10' : ''}`}>
                                      <GripVertical className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <span className="text-xl font-bold text-gray-500">#{index + 1}</span>
                                    <ArtistAvatar artist={artist} />
                                    <div 
                                      className="flex-1 min-w-0"
                                      onClick={(e) => {
                                        if (!isMobile || !mobileDrag.isDragging) {
                                          e.stopPropagation();
                                          setShowArtistCard(artist);
                                        }
                                      }}
                                    >
                                      <p className="font-medium truncate">{artist.name}</p>
                                      <p className="text-sm text-gray-400">{artist.era}</p>
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
                                      className="p-1 hover:bg-white/10 transition-colors touch-target"
                                    >
                                      <X className="w-4 h-4 text-gray-400" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="text-gray-400">Content for {activeTab} tab</p>
              </div>
            )}
          </main>

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
        
        {/* Saving Status */}
        {savingStatus && (
          <div className="fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
            {savingStatus}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default TheCanon;