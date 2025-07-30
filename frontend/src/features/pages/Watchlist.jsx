// src/features/pages/Watchlist.jsx

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  removeFromWatchlist,
  toggleWatchedStatus,
} from "../Watchlist/watchlistSlice.js";
import "../../styles.css";

const Watchlist = () => {
  const dispatch = useDispatch();
  const watchlist = useSelector((state) => state.watchlist.movies);

  return (
    <div className="page-container">
      <h2 className="watchlist-title">🎬 My Liked Movies</h2>

      {watchlist.length === 0 ? (
        <p className="text-gray-400 mt-4">You haven’t liked any movies yet.</p>
      ) : (
        <ul className="watchlist-list">
          {watchlist.map((movie) => (
            <li key={movie.id} className="watchlist-item">
              <span className="watchlist-title">
                {movie.title} ({movie.genre})
              </span>
              <div className="watchlist-actions">
                <button
                  onClick={() => dispatch(toggleWatchedStatus(movie.id))}
                  className={`watchlist-button ${
                    movie.status === "watched"
                      ? "bg-green-600 text-white"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  {movie.status === "watched"
                    ? "Watched"
                    : "Planned to Watch"}
                </button>

                <button
                  onClick={() => dispatch(removeFromWatchlist(movie.id))}
                  className="watchlist-button bg-red-600 text-white ml-2"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Watchlist;