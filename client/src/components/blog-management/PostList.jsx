import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from './axiosInstance';
import DOMPurify from 'dompurify';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data } = await api.get('/posts');
      setPosts(data);
      setLoading(false);
    } catch (error) {
      console.error('Fetch Posts Error:', error);
      setError('Failed to load posts. Please try again later.');
      setLoading(false);
    }
  };

  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-lg font-medium text-red-500 mt-4">{error}</p>;
  }

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Latest Posts</h1>
      {posts.length === 0 ? (
        <p className="text-lg text-gray-600 text-center">No posts available at the moment.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <div
              key={post._id}
              className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 rounded-lg overflow-hidden"
            >
              <div className="p-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{post.title}</h2>
                <p className="text-xs text-gray-500 mb-2">
                  by {post.author.firstName} {post.author.lastName} • {new Date(post.createdAt).toLocaleDateString()}
                </p>
                <p className="text-gray-700 mb-4 text-sm">
                  {stripHtml(post.content).substring(0, 100)}...
                </p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {post.tags && post.tags.length > 0 ? (
                    post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-1 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500">No tags</span>
                  )}
                </div>
                <Link
                  to={`/posts/${post._id}`}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  Read more →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostList;
