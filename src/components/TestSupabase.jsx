import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const TestSupabase = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      console.log('Fetching artists from Supabase...');
      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .limit(5);

      if (error) throw error;
      
      setArtists(data || []);
      console.log('Artists fetched successfully:', data);
    } catch (error) {
      console.error('Error fetching artists:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 m-4 bg-slate-800 text-white border border-green-400">
      <h2 className="text-xl font-bold mb-4">🧪 Supabase Connection Test</h2>
      {loading ? (
        <p className="text-yellow-400">Loading...</p>
      ) : error ? (
        <div>
          <p className="text-red-400">❌ Error connecting to Supabase:</p>
          <p className="text-sm text-gray-300 mt-2">{error}</p>
        </div>
      ) : (
        <div>
          <p className="text-green-400 mb-2">✅ Connected to Supabase!</p>
          <p className="mb-2">Found {artists.length} artists in your database:</p>
          <ul className="space-y-1">
            {artists.map(artist => (
              <li key={artist.id} className="flex items-center gap-2">
                <span className="text-2xl">{artist.avatar_emoji}</span>
                <span>{artist.name}</span>
                <span className="text-gray-400 text-sm">({artist.era})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TestSupabase;