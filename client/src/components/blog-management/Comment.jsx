import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  PencilIcon,
  TrashIcon,
  ArrowUturnLeftIcon,
} from "@heroicons/react/24/outline";
import CommentForm from "./CommentForm";

const Comment = React.memo(({ 
  comment, 
  currentUserId, 
  onEdit, 
  onDelete, 
  onReply, 
  depth = 0 
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleReply = useCallback((content) => {
    onReply(comment._id, content);
    setIsReplying(false);
  }, [comment._id, onReply]);

  const handleEdit = useCallback((content) => {
    onEdit(comment._id, content);
    setIsEditing(false);
  }, [comment._id, onEdit]);

  const handleDelete = useCallback(() => {
    onDelete(comment._id);
  }, [comment._id, onDelete]);

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
                  onClick={handleDelete}
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

export default Comment;