import React, { useState, useCallback, useEffect } from 'react';
import { GripVertical, Share2, X, Plus } from 'lucide-react';

const CustomCategorySection = ({ 
  userLists, 
  userCustomCategories, 
  setUserCustomCategories,
  currentUser, 
  supabase, 
  isMobile,
  mobileDrag,
  // Drag state
  draggedItem,
  dragOverIndex,
  draggedFromList,
  setDragOverIndex,
  setDraggedFromList,
  // Search functionality
  otherListSearchQueries,
  otherListSearchResults,
  setOtherListSearchResults,
  handleOtherListSearch,
  addArtistToOtherList,
  // Artist management
  setShowArtistCard,
  removeArtistFromList,
  updateListAndSave,
  // List management
  shareList,
  setShowCustomCategorySelector,
  addToast,
  // Components
  ArtistAvatar
}) => {
  // Custom category specific state
  const [customCategoryOrder, setCustomCategoryOrder] = useState([]);
  const [draggedCategoryId, setDraggedCategoryId] = useState(null);
  const [categoryDragOverIndex, setCategoryDragOverIndex] = useState(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Load user custom categories
  const loadUserCustomCategories = useCallback(async (user = currentUser) => {
    console.log('🎯 loadUserCustomCategories called with user:', user?.id);
    if (!user) {
      console.log('🎯 No user provided, returning early');
      return;
    }

    try {
      // First, let's see what rankings exist with custom_category_id
      const { data: rankingsData, error: rankingsError } = await supabase
        .from('rankings')
        .select('id, custom_category_id, list_title')
        .eq('user_id', user.id)
        .not('custom_category_id', 'is', null);
      
      console.log('Rankings with custom_category_id:', rankingsData);
      
      if (rankingsError) {
        console.error('Error loading rankings:', rankingsError);
        throw rankingsError;
      }
      
      // Now try the join query
      const { data, error } = await supabase
        .from('rankings')
        .select(`
          id,
          custom_category_id,
          custom_categories!inner(
            id,
            category_name,
            description,
            usage_count
          )
        `)
        .eq('user_id', user.id)
        .not('custom_category_id', 'is', null);

      if (error) {
        console.error('Error loading custom categories join:', error);
        throw error;
      }
      
      console.log('Join query result:', data);
      
      const customCategories = data?.map(item => ({
        ...item.custom_categories,
        list_id: item.id
      })) || [];
      
      console.log('🎯 Setting userCustomCategories state with:', customCategories);
      setUserCustomCategories(customCategories);
      console.log('🎯 State should now be updated with', customCategories.length, 'categories');
      
      // Load custom category order from localStorage
      const savedOrder = localStorage.getItem(`custom_category_order_${user.id}`);
      if (savedOrder) {
        setCustomCategoryOrder(JSON.parse(savedOrder));
      }
    } catch (error) {
      console.error('Error loading user custom categories:', error);
    }
  }, [supabase, setUserCustomCategories]);

  // Effect to load custom categories when currentUser changes
  useEffect(() => {
    if (currentUser) {
      loadUserCustomCategories(currentUser);
    }
  }, [currentUser, loadUserCustomCategories]);

  // Custom category drag handlers
  const handleCategoryDragStart = useCallback((e, categoryId) => {
    setDraggedCategoryId(categoryId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleCategoryDragEnd = useCallback(() => {
    setDraggedCategoryId(null);
    setCategoryDragOverIndex(null);
  }, []);

  const handleCategoryDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleCategoryDragEnter = useCallback((e, index) => {
    if (draggedCategoryId) {
      setCategoryDragOverIndex(index);
    }
  }, [draggedCategoryId]);

  const handleCategoryDrop = useCallback(async (e, dropIndex) => {
    e.preventDefault();
    
    if (!draggedCategoryId) return;

    const customLists = userLists.filter(list => list.custom_category_id);
    const draggedIndex = customLists.findIndex(list => list.id === draggedCategoryId);
    
    if (draggedIndex === -1 || draggedIndex === dropIndex) return;

    // Reorder the lists
    const newCustomLists = [...customLists];
    const [removed] = newCustomLists.splice(draggedIndex, 1);
    newCustomLists.splice(dropIndex, 0, removed);

    // Update the order in state
    const newOrder = newCustomLists.map(list => list.id);
    setCustomCategoryOrder(newOrder);

    // Save the order to localStorage
    localStorage.setItem(`custom_category_order_${currentUser.id}`, JSON.stringify(newOrder));

    setCategoryDragOverIndex(null);
  }, [draggedCategoryId, userLists, currentUser]);

  // Delete custom category
  const handleDeleteCustomCategory = useCallback(async (listId) => {
    const list = userLists.find(l => l.id === listId);
    if (!list) return;

    // If list has artists, show confirmation modal
    if (list.artists && list.artists.length > 0) {
      setCategoryToDelete({ listId, list });
      setShowDeleteConfirmModal(true);
    } else {
      // If no artists, delete immediately
      await deleteCustomCategory(listId);
    }
  }, [userLists]);

  const deleteCustomCategory = useCallback(async (listId) => {
    try {
      // Delete the ranking from database
      const { error } = await supabase
        .from('rankings')
        .delete()
        .eq('id', listId)
        .eq('user_id', currentUser.id);

      if (error) throw error;

      // Reload custom categories
      loadUserCustomCategories();
      
      addToast('Custom category removed successfully', 'success');
    } catch (error) {
      console.error('Error deleting custom category:', error);
      addToast('Failed to delete custom category', 'error');
    }
  }, [currentUser, supabase, loadUserCustomCategories, addToast]);

  return (
    <>
      {userLists
        .filter(list => list.custom_category_id)
        .sort((a, b) => {
          if (customCategoryOrder.length === 0) return 0;
          const indexA = customCategoryOrder.indexOf(a.id);
          const indexB = customCategoryOrder.indexOf(b.id);
          if (indexA === -1 && indexB === -1) return 0;
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        })
        .map((list, index) => {
          const customCategory = userCustomCategories.find(cat => cat.id === list.custom_category_id);
          if (!customCategory) return null;
          
          return (
            <div key={list.id}>
              {/* Drop indicator */}
              {categoryDragOverIndex === index && (
                <div className="h-1 bg-purple-400 rounded transition-all duration-200 mb-2" />
              )}
              
              <div 
                className={`bg-white/5 border border-white/10 p-4 ${
                  draggedCategoryId === list.id ? 'opacity-50' : ''
                } ${!isMobile ? 'cursor-move' : ''}`}
                data-list-id={list.id}
                draggable={!isMobile}
                onDragStart={(e) => handleCategoryDragStart(e, list.id)}
                onDragEnd={handleCategoryDragEnd}
                onDragEnter={(e) => handleCategoryDragEnter(e, index)}
                onDragOver={handleCategoryDragOver}
                onDrop={(e) => handleCategoryDrop(e, index)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    {/* Mobile drag handle for category reordering */}
                    {isMobile && (
                      <div 
                        className="touch-target flex items-center justify-center w-6 h-6 cursor-grab active:cursor-grabbing"
                        onTouchStart={(e) => mobileDrag.handleTouchStart(e, { categoryId: list.id, isCategory: true })}
                        onTouchMove={mobileDrag.handleTouchMove}
                        onTouchEnd={mobileDrag.handleTouchEnd}
                      >
                        <GripVertical className="w-3 h-3 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold">{customCategory.category_name}</h3>
                      {customCategory.description && (
                        <p className="text-xs text-gray-400 mt-1">{customCategory.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => shareList(list)}
                      className="p-1 hover:bg-white/10 transition-colors rounded"
                      title="Share"
                    >
                      <Share2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteCustomCategory(list.id)}
                      className="p-1 hover:bg-white/10 transition-colors rounded"
                      title="Delete category"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                {/* Add Search Bar for custom category lists */}
                <div className="relative mb-3">
                  <input
                    type="text"
                    placeholder="Search artists..."
                    value={otherListSearchQueries[list.id] || ''}
                    className="w-full px-3 py-1.5 text-sm bg-black/50 border border-white/20 focus:border-purple-400/50 focus:outline-none rounded"
                    onChange={(e) => handleOtherListSearch(list.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const results = otherListSearchResults[list.id];
                        if (results && results.length > 0) {
                          addArtistToOtherList(list.id, results[0]);
                        }
                      }
                    }}
                    onBlur={() => {
                      setTimeout(() => {
                        setOtherListSearchResults(prev => ({ ...prev, [list.id]: [] }));
                      }, 300);
                    }}
                  />
                  
                  {/* Search Results Dropdown */}
                  {otherListSearchResults[list.id] && otherListSearchResults[list.id].length > 0 && (
                    <div className="absolute top-full mt-1 w-full bg-slate-800 border border-white/20 shadow-xl max-h-48 overflow-y-auto z-20">
                      {otherListSearchResults[list.id].map((artist) => (
                        <div
                          key={artist.id}
                          className="p-3 hover:bg-white/10 transition-colors flex items-center gap-3 cursor-pointer"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            addArtistToOtherList(list.id, artist);
                          }}
                          onClick={() => addArtistToOtherList(list.id, artist)}
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
                  {list.artists.map((artist, index) => (
                    <div key={artist.id}>
                      {/* Drop indicator */}
                      {dragOverIndex === index && draggedFromList === list.id && (
                        <div className="h-1 bg-purple-400 rounded transition-all duration-200" />
                      )}
                      
                      <div
                        data-drop-index={index}
                        className={`flex items-center ${isMobile ? 'gap-1 p-1.5' : 'gap-3 p-2'} bg-black/30 border border-white/10 ${
                          isMobile ? '' : 'cursor-move hover:bg-white/10'
                        } transition-all duration-200 ${
                          draggedItem?.artist.id === artist.id ? 'opacity-50' : ''
                        }`}
                      >
                        <div 
                          className={`drag-handle ${isMobile ? 'touch-target flex items-center justify-center w-6 h-6' : ''}`}
                          {...(isMobile ? {
                            onTouchStart: (e) => mobileDrag.handleTouchStart(e, { artist, listId: list.id }),
                            onTouchMove: mobileDrag.handleTouchMove,
                            onTouchEnd: mobileDrag.handleTouchEnd,
                          } : {})}
                        >
                          <GripVertical className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-gray-400`} />
                        </div>
                        <span 
                          className={`text-gray-400 font-bold ${isMobile ? 'text-xs w-4 text-center' : 'text-sm'} cursor-pointer`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowArtistCard(artist);
                          }}
                        >#{index + 1}</span>
                        <div 
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowArtistCard(artist);
                          }}
                        >
                          <ArtistAvatar artist={artist} size={isMobile ? 'w-6 h-6' : 'w-8 h-8'} />
                        </div>
                        <span 
                          className={`truncate flex-1 ${isMobile ? 'text-xs' : 'text-sm'} cursor-pointer`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowArtistCard(artist);
                          }}
                        >{artist.name}</span>
                        <button
                          onClick={() => removeArtistFromList(artist.id, list.id)}
                          className="p-1 hover:bg-red-500/20 transition-colors rounded"
                          title="Remove artist"
                        >
                          <X className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-red-400`} />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Drop indicator at the end */}
                  {dragOverIndex === list.artists.length && draggedFromList === list.id && (
                    <div className="h-1 bg-purple-400 rounded transition-all duration-200" />
                  )}
                  
                  {/* Drop zone at the end */}
                  <div
                    data-drop-index={list.artists.length}
                    className={`${list.artists.length === 0 ? 
                      'border-2 border-dashed border-gray-600 p-6 text-center text-gray-400 text-sm' : 
                      'h-4 border border-dashed border-transparent hover:border-gray-600 transition-colors'
                    }`}
                  >
                    {list.artists.length === 0 && (
                      isMobile ? 'Search and tap artists to add them' : 'Search artists or drag them here'
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      
      {/* Final drop zone for category reordering */}
      {userLists.filter(list => list.custom_category_id).length > 0 && 
       categoryDragOverIndex === userLists.filter(list => list.custom_category_id).length && (
        <div className="h-1 bg-purple-400 rounded transition-all duration-200 mb-2" />
      )}
      
      {/* Custom Category Selector Button */}
      <button
        onClick={() => setShowCustomCategorySelector(true)}
        className="p-4 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-400/30 text-purple-300 transition-colors text-left flex items-center gap-3"
      >
        <Plus className="w-5 h-5" />
        <div>
          <h3 className="font-bold mb-1">Create Custom Category</h3>
          <p className="text-sm text-purple-400/80">Make your own ranking category</p>
        </div>
      </button>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && categoryToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-white/20 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-2">Delete Category</h3>
            <p className="text-gray-300 mb-4">
              Are you sure you want to delete "{categoryToDelete.list.title}"? 
              This will remove {categoryToDelete.list.artists?.length || 0} artists and cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteConfirmModal(false);
                  setCategoryToDelete(null);
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 transition-colors rounded"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await deleteCustomCategory(categoryToDelete.listId);
                  setShowDeleteConfirmModal(false);
                  setCategoryToDelete(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 transition-colors rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomCategorySection;