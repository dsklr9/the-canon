import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, Users, Sparkles, TrendingUp, X } from 'lucide-react';

const CustomCategorySelector = ({ 
  supabase, 
  currentUser, 
  onCategorySelected, 
  onClose,
  existingUserCategories = []
}) => {
  const [popularCategories, setPopularCategories] = useState([]);
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPopularCategories();
  }, []);

  const loadPopularCategories = async () => {
    try {
      const { data, error } = await supabase.rpc('get_popular_categories', { limit_count: 30 });
      
      if (error) throw error;
      setPopularCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewCategory = async () => {
    if (!newCategoryName.trim() || !currentUser) return;

    setCreating(true);
    try {
      const { data, error } = await supabase
        .rpc('get_or_create_custom_category', {
          category_name_param: newCategoryName.trim(),
          user_id_param: currentUser.id,
          description_param: newCategoryDescription.trim() || null
        });

      if (error) throw error;

      // Get the full category info
      const { data: categoryData, error: fetchError } = await supabase
        .from('custom_categories')
        .select('*')
        .eq('id', data)
        .single();

      if (fetchError) throw fetchError;

      onCategorySelected(categoryData);
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Error creating category. It may already exist or there was a problem.');
    } finally {
      setCreating(false);
    }
  };

  const filteredCategories = popularCategories.filter(category =>
    category.category_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !existingUserCategories.some(existing => existing.custom_category_id === category.id)
  );

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 border border-white/20 p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Choose Category</h2>
            <p className="text-gray-400 text-sm">Select a popular category or create your own</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 transition-colors rounded"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {!showCreateNew ? (
          <>
            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-black/50 border border-white/20 text-white placeholder-gray-500 focus:border-purple-400/50 focus:outline-none rounded"
              />
            </div>

            {/* Popular Categories */}
            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Loading categories...</p>
                </div>
              ) : filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => onCategorySelected(category)}
                    className="w-full p-4 bg-slate-700/50 hover:bg-slate-700 border border-white/10 text-left transition-colors rounded"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">
                          {category.category_name}
                        </h3>
                        {category.description && (
                          <p className="text-sm text-gray-400 mb-2">
                            {category.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Users className="w-3 h-3" />
                          <span>Used by {category.usage_count} {category.usage_count === 1 ? 'person' : 'people'}</span>
                        </div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-400 transform -rotate-90" />
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {searchTerm ? 'No categories match your search' : 'No categories available'}
                  </p>
                </div>
              )}
            </div>

            {/* Create New Category Button */}
            <button
              onClick={() => setShowCreateNew(true)}
              className="w-full p-4 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-400/30 text-purple-300 transition-colors rounded flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create New Category
            </button>
          </>
        ) : (
          /* Create New Category Form */
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category Name *
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 border border-white/20 text-white placeholder-gray-500 focus:border-purple-400/50 focus:outline-none rounded"
                placeholder="e.g., Best Storytellers, Most Influential"
                maxLength={100}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {newCategoryName.length}/100 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description <span className="text-gray-500">(optional)</span>
              </label>
              <textarea
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 border border-white/20 text-white placeholder-gray-500 focus:border-purple-400/50 focus:outline-none rounded h-20 resize-none"
                placeholder="Briefly describe what this category represents..."
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">
                {newCategoryDescription.length}/200 characters
              </p>
            </div>

            <div className="bg-blue-500/10 border border-blue-400/30 p-3 rounded">
              <div className="flex gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-200">
                  <p className="font-medium mb-1">Tips for great categories:</p>
                  <ul className="text-xs space-y-1 text-blue-300/80">
                    <li>• Be specific and clear</li>
                    <li>• Use categories others might want to create too</li>
                    <li>• Avoid offensive or inappropriate language</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setShowCreateNew(false);
                  setNewCategoryName('');
                  setNewCategoryDescription('');
                }}
                className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors rounded"
              >
                Back
              </button>
              <button
                onClick={createNewCategory}
                disabled={!newCategoryName.trim() || creating}
                className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white transition-colors rounded flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Category
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomCategorySelector;