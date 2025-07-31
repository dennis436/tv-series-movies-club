import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchWatchlist,
  updateWatchlistItem,
  deleteWatchlistItem,
  clearWatchlistError,
} from '../Watchlist/watchlistSlice';
import { useNavigate } from 'react-router-dom';

const Watchlist = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useSelector((state) => state.auth);
  const { items: watchlistItems, isLoading, error, hasFetched } = useSelector((state) => state.watchlist);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch watchlist when user is authenticated and not already fetched
  useEffect(() => {
    if (isAuthenticated && user?.id && !hasFetched && !isLoading) {
      dispatch(fetchWatchlist(user.id));
    }
  }, [isAuthenticated, user?.id, dispatch, hasFetched, isLoading]);

  // Clear error on component unmount
  useEffect(() => {
    return () => {
      dispatch(clearWatchlistError());
    };
  }, [dispatch]);

  const handleToggleStatus = async (itemId, currentStatus) => {
    const newStatus = currentStatus === 'watched' ? 'pending' : 'watched';
    try {
      await dispatch(updateWatchlistItem({ watchlist_item_id: itemId, status: newStatus })).unwrap();
      console.log(`Watchlist item ${itemId} status toggled to ${newStatus}`);
      // Force a re-fetch after successful update for immediate UI sync
      if (user?.id) {
        dispatch(fetchWatchlist(user.id));
      }
    } catch (err) {
      console.error('Failed to update watchlist item status:', err);
    }
  };

  const handleRemoveFromWatchlist = async (itemId) => {
    try {
      await dispatch(deleteWatchlistItem(itemId)).unwrap();
      console.log(`Watchlist item ${itemId} removed.`);
      // Force a re-fetch after successful deletion for immediate UI sync
      if (user?.id) {
        dispatch(fetchWatchlist(user.id));
      }
    } catch (err) {
      console.error('Failed to remove watchlist item:', err);
    }
  };

  if (isLoading && !hasFetched) {
    return (
      <div className="watchlist-loading p-6 bg-gray-900 min-h-screen text-white flex items-center justify-center">
        <p className="text-blue-400 text-xl">Loading your watchlist...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="watchlist-error p-6 bg-gray-900 min-h-screen text-red-500 text-center">
        <p>Error loading watchlist: {error}</p>
        <button onClick={() => dispatch(fetchWatchlist(user.id))} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md">
          Retry
        </button>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Redirect handled by useEffect
  }

  return (
    <div className="watchlist-container p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold text-orange-400 mb-6">My Watchlist</h1>

      {watchlistItems.length === 0 && hasFetched ? (
        <p className="text-gray-400 text-lg text-center">Your watchlist is empty. Start liking posts to add movies here!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {watchlistItems.map((movie) => (
            <div key={movie.id} className="bg-gray-800 bg-opacity-70 rounded-lg p-6 shadow-lg border border-gray-700"> {/* Added bg-opacity-70 for transparency */}
              <h2 className="text-xl font-bold text-white mb-2">{movie.movie_title}</h2>
              <p className="text-gray-400 text-sm mb-3">
                {movie.genre ? `Club: ${movie.genre}` : 'Type: General Post'}
              </p>
              <p className="text-gray-300 mb-4">Status: <span className={`font-semibold ${movie.status === 'watched' ? 'text-green-400' : 'text-yellow-400'}`}>
                {(movie.status || 'pending').charAt(0).toUpperCase() + (movie.status || 'pending').slice(1)}
              </span></p>

              <div className="flex space-x-3">
                <button
                  onClick={() => handleToggleStatus(movie.id, movie.status)}
                  className={`
                    px-4 py-2 rounded-full font-bold text-sm transition duration-300 ease-in-out
                    ${movie.status === 'watched' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} text-white
                  `}
                >
                  {movie.status === 'watched' ? 'Mark as Pending' : 'Mark as Watched'}
                </button>
                <button
                  onClick={() => handleRemoveFromWatchlist(movie.id)}
                  className="px-4 py-2 rounded-full bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition duration-300 ease-in-out"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;
