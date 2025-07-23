import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  createPost,
  setPostCreationStatus, 
  clearPostCreationError, 
} from '../clubs/clubSlice'; 

function CreatePostInClub() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [movieTitle, setMovieTitle] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState(null); 

  // Get post creation status and error from Redux store
  const { postCreationStatus, postCreationError } = useSelector((state) => state.clubs);
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Effect to handle post creation status feedback
  useEffect(() => {
    if (postCreationStatus === 'succeeded') {
      setMessage('Post created successfully!');
      // Reset status after a short delay for user to see message
      const timer = setTimeout(() => {
        dispatch(setPostCreationStatus('idle')); 
        setMessage(null);
        navigate(`/clubs/${id}`); 
      }, 1500); // Show success message for 1.5 seconds
      return () => clearTimeout(timer); // Cleanup timer
    } else if (postCreationStatus === 'failed') {
      setMessage(`Error: ${postCreationError || 'Failed to create post.'}`);
      // Clear error after a short delay or user interaction
      const timer = setTimeout(() => {
        dispatch(clearPostCreationError());
        setMessage(null);
      }, 5000); // Show error for 5 seconds
      return () => clearTimeout(timer);
    }
  }, [postCreationStatus, postCreationError, dispatch, id, navigate]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      sessionStorage.setItem('redirectAfterLogin', `/clubs/${id}/create-post`);
      navigate('/login');
    }
  }, [isAuthenticated, navigate, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null); 

    if (!movieTitle || !content) {
      setMessage('Please fill in both movie title and your thoughts.');
      return;
    }

    try {
      // Dispatch the createPost thunk
      await dispatch(createPost({ clubId: parseInt(id), movie_title: movieTitle, content: content })).unwrap();
    } catch (err) {
      console.error('Failed to create post:', err);
    }
  };
  return (
    <div className="form-page min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <form
        className="form-container bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold text-orange-400 mb-6 text-center">Create Post in Club #{id}</h2>

        {message && (
          <p className={`text-center mb-4 ${postCreationStatus === 'succeeded' ? 'text-green-500' : 'text-red-500'}`}>
            {message}
          </p>
        )}

        <div className="mb-4">
          <label htmlFor="movieTitle" className="block text-gray-300 text-sm font-bold mb-2">
            Movie Title
          </label>
          <input
            type="text"
            id="movieTitle"
            className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500"
            value={movieTitle}
            onChange={(e) => setMovieTitle(e.target.value)}
            required
            disabled={postCreationStatus === 'pending'} // Disable while submitting
          />
        </div>

        <div className="mb-6">
          <label htmlFor="content" className="block text-gray-300 text-sm font-bold mb-2">
            Your Thoughts
          </label>
          <textarea
            id="content"
            className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500 h-32 resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            disabled={postCreationStatus === 'pending'} 
          />
        </div>

        <button
          type="submit"
          className="
            bg-blue-600 hover:bg-blue-700
            text-white font-bold
            py-2 px-4 rounded-lg
            w-full
            shadow-md transition duration-300 ease-in-out
            transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75
            ${postCreationStatus === 'pending' ? 'opacity-50 cursor-not-allowed' : ''}
          "
          disabled={postCreationStatus === 'pending'} 
        >
          {postCreationStatus === 'pending' ? 'Submitting...' : 'Submit Post'}
        </button>
      </form>
    </div>
  );
}

export default CreatePostInClub;
