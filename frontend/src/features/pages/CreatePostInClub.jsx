import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  createPost,
  setPostCreationStatus,
  clearPostCreationError,
} from '../clubs/clubSlice';
import { fetchUserPosts } from '../auth/authSlice';

function CreatePostInClub() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [movieTitle, setMovieTitle] = useState('');
  const [content, setContent] = useState('');
  const [localMessage, setLocalMessage] = useState(null);
  const [isPostSuccessDisplayed, setIsPostSuccessDisplayed] = useState(false);

  const { postCreationStatus, postCreationError } = useSelector((state) => state.clubs);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    console.log("CreatePostInClub useEffect [postCreationStatus]: Status changed to:", postCreationStatus);

    if (postCreationStatus === 'succeeded') {
      dispatch(setPostCreationStatus('idle'));
      setIsPostSuccessDisplayed(true);

      if (user?.id) {
        console.log("CreatePostInClub useEffect [postCreationStatus]: Dispatching fetchUserPosts to update dashboard.");
        dispatch(fetchUserPosts(user.id));
      }

    } else if (postCreationStatus === 'failed') {
      setLocalMessage(`Error: ${postCreationError || 'Failed to create post.'}`);
      const timer = setTimeout(() => {
        console.log("CreatePostInClub useEffect [postCreationStatus]: Clearing post creation error and local message.");
        dispatch(clearPostCreationError());
        setLocalMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [postCreationStatus, postCreationError, dispatch, user?.id]);

  useEffect(() => {
    if (isPostSuccessDisplayed) {
      console.log("CreatePostInClub useEffect [isPostSuccessDisplayed]: Post success detected. Displaying message and setting navigation timer.");
      setLocalMessage('Post created successfully!');

      const timer = setTimeout(() => {
        console.log("CreatePostInClub useEffect [isPostSuccessDisplayed]: Inside setTimeout - preparing to navigate.");
        setLocalMessage(null);
        setIsPostSuccessDisplayed(false);
        console.log(`CreatePostInClub useEffect [isPostSuccessDisplayed]: Navigating to /clubs/${id}`);
        navigate(`/clubs/${id}`);
        console.log("CreatePostInClub useEffect [isPostSuccessDisplayed]: Navigation call executed.");
      }, 1500);

      return () => {
        console.log("CreatePostInClub useEffect [isPostSuccessDisplayed]: Cleaning up setTimeout.");
        clearTimeout(timer);
      };
    }
  }, [isPostSuccessDisplayed, id, navigate]);

  useEffect(() => {
    if (!isAuthenticated) {
      console.log("CreatePostInClub useEffect [isAuthenticated]: Not authenticated, redirecting to login.");
      sessionStorage.setItem('redirectAfterLogin', `/clubs/${id}/create-post`);
      navigate('/login');
    }
  }, [isAuthenticated, navigate, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalMessage(null);
    setIsPostSuccessDisplayed(false);

    if (!movieTitle || !content) {
      setLocalMessage('Please fill in both movie title and your thoughts.');
      return;
    }

    console.log("CreatePostInClub handleSubmit: Attempting to dispatch createPost.");
    try {
      await dispatch(createPost({ clubId: parseInt(id), movie_title: movieTitle, content: content })).unwrap();
      console.log("CreatePostInClub handleSubmit: createPost thunk resolved successfully. isPostSuccessDisplayed useEffect will handle next steps.");
    } catch (err) {
      console.error('CreatePostInClub handleSubmit: Failed to create post:', err);
    }
  };

  return (
    <div className="form-page min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <form
        className="form-container bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold text-orange-400 mb-6 text-center">Create Post in Club #{id}</h2>

        {localMessage && (
          <p className={`text-center mb-4 ${isPostSuccessDisplayed ? 'text-green-500' : 'text-red-500'}`}>
            {localMessage}
          </p>
        )}

        <div className="mb-4">
          <label htmlFor="movieTitle" className="block text-gray-300 text-sm font-bold mb-2">
            Movie Title
          </label>
          <input
            type="text"
            id="movieTitle"
            className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500" // Changed text-gray-700 to text-white
            value={movieTitle}
            onChange={(e) => setMovieTitle(e.target.value)}
            required
            disabled={postCreationStatus === 'pending'}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="content" className="block text-gray-300 text-sm font-bold mb-2">
            Your Thoughts
          </label>
          <textarea
            id="content"
            className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500 h-32 resize-none" // Changed text-gray-700 to text-white
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            disabled={postCreationStatus === 'pending'}
          />
        </div>

        <button
          type="submit"
          className={`
            bg-blue-600 hover:bg-blue-700
            text-white font-bold
            py-2 px-4 rounded-lg
            w-full
            shadow-md transition duration-300 ease-in-out
            transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75
            ${postCreationStatus === 'pending' ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          disabled={postCreationStatus === 'pending'}
        >
          {postCreationStatus === 'pending' ? 'Submitting...' : 'Submit Post'}
        </button>
      </form>
    </div>
  );
}

export default CreatePostInClub;
