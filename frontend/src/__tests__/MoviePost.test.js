import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import MoviePost from '../../components/MoviePost';

jest.mock('axios');

describe('MoviePost Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'mock-token');
  });

  test('allows user to create and share a movie post', async () => {
    axios.post.mockResolvedValueOnce({ data: { id: 1, title: 'Inception', review: 'Great movie!' } });
    render(<BrowserRouter><MoviePost /></BrowserRouter>);
    fireEvent.change(screen.getByPlaceholderText(/movie title/i), { target: { value: 'Inception' } });
    fireEvent.change(screen.getByPlaceholderText(/review/i), { target: { value: 'Great movie!' } });
    fireEvent.click(screen.getByRole('button', { name: /post/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/posts', {
        title: 'Inception',
        review: 'Great movie!',
      }, expect.any(Object));
      expect(screen.getByText(/post created/i)).toBeInTheDocument();
    });
  });

  test('displays post details', async () => {
    axios.get.mockResolvedValueOnce({ data: { id: 1, title: 'Inception', review: 'Great movie!' } });
    render(<BrowserRouter><MoviePost postId={1} /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText(/Inception/i)).toBeInTheDocument();
      expect(screen.getByText(/Great movie!/i)).toBeInTheDocument();
    });
  });
});