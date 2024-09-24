import React from "react";
import { motion } from "framer-motion";
import { HeartIcon as HeartIconOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";

const LikeButton = ({ hasLiked, likesCount, onClick }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
        hasLiked
          ? "bg-red-100 text-red-600"
          : "bg-gray-100 text-gray-600"
      } hover:bg-opacity-80 transition duration-150`}
    >
      {hasLiked ? (
        <HeartIconSolid className="w-5 h-5 text-red-600" />
      ) : (
        <HeartIconOutline className="w-5 h-5" />
      )}
      <span>
        {likesCount} {likesCount === 1 ? "Like" : "Likes"}
      </span>
    </motion.button>
  );
};

export default LikeButton;