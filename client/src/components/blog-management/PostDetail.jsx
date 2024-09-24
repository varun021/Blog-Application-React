import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "./axiosInstance";
import DOMPurify from "dompurify";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import {
  ChevronLeftIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  UserIcon,
  FolderIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  XCircleIcon,
  ArrowUturnLeftIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";

const CommentForm = React.memo(({ onSubmit, initialValue = '', buttonText, cancelAction }) => {
  const [content, setContent] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(content);
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
        rows="3"
        placeholder="Write your comment..."
      />
      <div className="flex justify-end mt-2 space-x-2">
        {cancelAction && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={cancelAction}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {buttonText}
        </motion.button>
      </div>
    </form>
  );
});

const Comment = React.memo(({ comment, currentUserId, onEdit, onDelete, onReply, depth = 0 }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleReply = (content) => {
    onReply(comment._id, content);
    setIsReplying(false);
  };

  const handleEdit = (content) => {
    onEdit(comment._id, content);
    setIsEditing(false);
  };

  const isAuthor = comment.author._id === currentUserId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-white p-4 rounded-lg shadow mb-4 transition duration-300 hover:shadow-md ${
        depth > 0 ? 'ml-6 border-l-2 border-indigo-200' : ''
      }`}
    >
      <div className="flex items-center space-x-2 mb-2">
        <img
          src={comment.author?.profilePhoto || "/default-avatar.png"}
          alt="Profile"
          className="w-8 h-8 rounded-full"
        />
        <p className="font-semibold text-gray-800">
          {comment.author?.firstName || 'Unknown'} {comment.author?.lastName || ''}
        </p>
      </div>
      {isEditing ? (
        <CommentForm
          onSubmit={handleEdit}
          initialValue={comment.content}
          buttonText="Save"
          cancelAction={() => setIsEditing(false)}
        />
      ) : (
        <>
          <p className="text-gray-700 mb-2">{comment.content}</p>
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsReplying(!isReplying)}
              className="text-blue-600 hover:text-blue-800 transition duration-150"
            >
              <ArrowUturnLeftIcon className="w-5 h-5 inline mr-1" />
              Reply
            </motion.button>
            {isAuthor && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(true)}
                  className="text-blue-600 hover:text-blue-800 transition duration-150"
                >
                  <PencilIcon className="w-5 h-5 inline mr-1" />
                  Edit
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onDelete(comment._id)}
                  className="text-red-600 hover:text-red-800 transition duration-150"
                >
                  <TrashIcon className="w-5 h-5 inline mr-1" />
                  Delete
                </motion.button>
              </>
            )}
          </div>
        </>
      )}
      {isReplying && (
        <CommentForm
          onSubmit={handleReply}
          buttonText="Post Reply"
          cancelAction={() => setIsReplying(false)}
        />
      )}
      {comment.replies && comment.replies.length > 0 && (
  <div className="mt-4">
    {comment.replies.map((reply) => (
      <Comment
        key={reply._id}
        comment={reply}
        currentUserId={currentUserId}
        onEdit={onEdit}
        onDelete={onDelete}
        onReply={onReply}
        depth={depth + 1}
      />
    ))}
  </div>
)}

    </motion.div>
  );
});
const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comments, setComments] = useState([]);
  const [hasLiked, setHasLiked] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const getCurrentUserId = useCallback(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        return decodedToken.user.id;
      } catch (error) {
        console.error("Error decoding token:", error);
        return null;
      }
    }
    return null;
  }, []);

  useEffect(() => {
    const userId = getCurrentUserId();
    setCurrentUserId(userId);
  }, [getCurrentUserId]);

  const fetchPost = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const { data } = await api.get(`/posts/${id}`);
      setPost(data);
      setLoading(false);
      setHasLiked(data.likes.includes(currentUserId));
    } catch (error) {
      console.error("Fetch Post Error:", error);
      setError("Failed to load post. Please try again later.");
      setLoading(false);
    }
  }, [id, currentUserId]);

  const fetchComments = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const { data } = await api.get(`/posts/${id}/comments`);
      setComments(data);
    } catch (error) {
      console.error("Fetch Comments Error:", error);
      toast.error("Failed to load comments. Please try again.");
    }
  }, [id, currentUserId]);
  

  useEffect(() => {
    if (currentUserId) {
      fetchPost();
      fetchComments();
    }
  }, [currentUserId, fetchPost, fetchComments]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await api.delete(`/posts/${id}`);
        toast.success("Post deleted successfully");
        navigate("/dashboard");
      } catch (error) {
        console.error("Delete Post Error:", error.response?.data || error.message);
        toast.error(error.response?.data?.msg || "Failed to delete post. Please try again later.");
      }
    }
  };

  const handleLike = async () => {
    try {
      const response = await api.post(`/posts/${id}/react`);
      setPost(response.data);
      setHasLiked(response.data.likes.includes(currentUserId));
      toast.success(hasLiked ? "Like removed" : "Post liked");
    } catch (error) {
      console.error("Like Error:", error.response?.data || error.message);
      toast.error(error.response?.data?.msg || "Failed to update like. Please try again.");
    }
  };

  const handleCommentSubmit = async (content) => {
    try {
      const response = await api.post(`/posts/${id}/comments`, { content });
      setComments([...comments, response.data]);
      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast.error("Failed to add comment. Please try again.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        await api.delete(`/posts/${id}/comments/${commentId}`);
        setComments(comments.filter((comment) => comment._id !== commentId));
        toast.success("Comment deleted successfully");
      } catch (error) {
        console.error("Delete Comment Error:", error.response?.data || error.message);
        toast.error("Failed to delete comment. Please try again.");
      }
    }
  };

  const handleEditComment = async (commentId, content) => {
    try {
      const response = await api.put(`/posts/${id}/comments/${commentId}`, { content });
      setComments(comments.map((comment) => comment._id === commentId ? response.data : comment));
      toast.success("Comment updated successfully");
    } catch (error) {
      console.error("Edit Comment Error:", error.response?.data || error.message);
      toast.error("Failed to update comment. Please try again.");
    }
  };

  const handleReplySubmit = useCallback(async (commentId, content) => {
    try {
      const response = await api.post(`/posts/${id}/comments/${commentId}/replies`, { content });
      setComments((prevComments) => prevComments.map((comment) => {
        if (comment._id === commentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), response.data]
          };
        }
        return comment;
      }));
      toast.success("Reply added successfully");
    } catch (error) {
      console.error("Reply Error:", error.response?.data || error.message);
      toast.error(error.response?.data?.msg || "Failed to add reply. Please try again.");
    }
  }, [id]);
  
  const sanitizeContent = useMemo(() => (content) => {
    return DOMPurify.sanitize(content, {
      ADD_TAGS: ["iframe"],
      ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling"],
    });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-lg text-red-500 mt-8">{error}</p>;
  }

  if (!post) {
    return <p className="text-center text-lg mt-8">Post not found.</p>;
  }

  const isAuthor = post.author && post.author._id && currentUserId && post.author._id.toString() === currentUserId.toString();

  return (
    <div className="bg-gray-100 min-h-screen">
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6 flex justify-between items-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-indigo-600 hover:text-indigo-800 transition duration-150"
            >
              <ChevronLeftIcon className="w-5 h-5 mr-1" />
              Back
            </button>
          </div>
          <article className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
            {isAuthor && (
              <div className="absolute top-4 right-4 flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-800 transition duration-150"
                >
                  <TrashIcon className="w-6 h-6" />
                </motion.button>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={`/posts/edit/${post._id}`}
                    className="text-blue-600 hover:text-blue-800 transition duration-150"
                  >
                    <PencilIcon className="w-6 h-6" />
                  </Link>
                </motion.div>
              </div>
            )}
            <div className="p-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center text-gray-600 mb-6 space-x-4">
                <div className="flex items-center space-x-2">
                  <UserIcon className="w-5 h-5 text-indigo-500" />
                  <span className="font-medium">
                    {post.author.firstName} {post.author.lastName}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <ClockIcon className="w-5 h-5 text-indigo-500" />
                  <time className="text-sm">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </time>
                </div>
                <div className="flex items-center space-x-2">
                  <FolderIcon className="w-5 h-5 text-indigo-500" />
                  <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-sm">
                    {post.category}
                  </span>
                </div>
              </div>
              <div
                className="prose prose-lg max-w-none mb-8"
                dangerouslySetInnerHTML={{
                  __html: sanitizeContent(post.content),
                }}
              />
              <div className="flex flex-wrap items-center space-x-4 mb-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLike}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                    hasLiked
                      ? "bg-red-100 text-red-600"
                      : "bg-gray-100 text-gray-600"
                  } hover:bg-opacity-80 transition duration-150`}
                >
                  {hasLiked ? (
                    <HeartIconSolid className="w-5 h-5 text-red-600" />
                  ) : (
                    <HeartIcon className="w-5 h-5" />
                  )}
                  <span>
                    {post.likes.length}{" "}
                    {post.likes.length === 1 ? "Like" : "Likes"}
                  </span>
                </motion.button>
                <div className="flex items-center space-x-2 text-gray-600">
                  <ChatBubbleLeftIcon className="w-5 h-5 text-indigo-500" />
                  <span>
                    {comments.length}{" "}
                    {comments.length === 1 ? "Comment" : "Comments"}
                  </span>
                </div>
              </div>

              {/* Comments Section */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <h3 className="text-2xl font-semibold mb-4">Comments</h3>
                <AnimatePresence>
                  {comments.length > 0 ? (
                    comments.map((comment) => (
                      <Comment
                        key={comment._id}
                        comment={comment}
                        currentUserId={currentUserId}
                        onEdit={handleEditComment}
                        onDelete={handleDeleteComment}
                        onReply={handleReplySubmit}
                      />
                    ))
                  ) : (
                    <p className="text-gray-500">
                      No comments yet. Be the first to comment!
                    </p>
                  )}
                </AnimatePresence>
                <CommentForm
                  onSubmit={handleCommentSubmit}
                  buttonText="Post Comment"
                />
              </div>
            </div>
          </article>
        </motion.div>
      </div>
    </div>
  );
};

export default PostDetail;