const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

// Create a new post
router.post('/', authenticate, async (req, res) => {
  const { title, content, tags, category } = req.body;

  try {
    const newPost = new Post({
      title,
      content,
      tags,
      category,
      author: req.user.id
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    console.error('Create Post Error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Update a post
router.put('/:id', authenticate, async (req, res) => {
  const { title, content, tags, category } = req.body;

  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    if (post.author.toString() !== req.user.id) return res.status(403).json({ msg: 'Not authorized' });

    post.title = title;
    post.content = content;
    post.tags = tags;
    post.category = category;

    await post.save();

    res.json(post);
  } catch (err) {
    console.error('Update Post Error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});


// Delete a post
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    if (post.author.toString() !== req.user.id) return res.status(403).json({ msg: 'Not authorized' });

    await Post.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Post removed' });
  } catch (err) {
    console.error('Delete Post Error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'firstName lastName');
    res.json(posts);
  } catch (err) {
    console.error('Get Posts Error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Get post statistics
router.get('/stats', async (req, res) => {
  try {
    const totalPosts = await Post.countDocuments();
    const totalLikes = await Post.aggregate([{ $group: { _id: null, totalLikes: { $sum: '$likes' } } }]);
    
    res.json({
      totalPosts,
      totalLikes: totalLikes.length > 0 ? totalLikes[0].totalLikes : 0
    });
  } catch (err) {
    console.error('Get Post Stats Error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Get a single post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'firstName lastName profilePhoto');
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    res.json(post);
  } catch (err) {
    console.error('Get Post Error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});
  

// Fetch all comments for a post
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id, parentComment: null })
      .populate('author', 'firstName lastName profilePhoto')
      .populate({
        path: 'replies',
        populate: {
          path: 'author',
          select: 'firstName lastName profilePhoto'
        }
      });

    res.json(comments);
  } catch (err) {
    console.error('Fetch Comments Error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Add a new comment to a post
router.post('/:id/comments', authenticate, async (req, res) => {
  const { content, parentCommentId } = req.body;

  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });

    const newComment = new Comment({
      content,
      post: req.params.id,
      author: req.user.id,
      parentComment: parentCommentId || null
    });

    await newComment.save();

    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      parentComment.replies.push(newComment._id);
      await parentComment.save();
    }

    await newComment.populate('author', 'firstName lastName profilePhoto');

    res.status(201).json(newComment);
  } catch (err) {
    console.error('Add Comment Error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Update a comment
router.put('/:id/comments/:commentId', authenticate, async (req, res) => {
  const { content } = req.body;

  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ msg: 'Comment not found' });
    if (comment.author.toString() !== req.user.id) return res.status(403).json({ msg: 'Not authorized' });

    comment.content = content;
    await comment.save();

    res.json(comment);
  } catch (err) {
    console.error('Update Comment Error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Delete a comment
router.delete('/:id/comments/:commentId', authenticate, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ msg: 'Comment not found' });
    if (comment.author.toString() !== req.user.id) return res.status(403).json({ msg: 'Not authorized' });

    await Comment.findByIdAndDelete(req.params.commentId);

    // Remove the comment from the post's comments array
    await Post.findByIdAndUpdate(req.params.id, {
      $pull: { comments: req.params.commentId }
    });

    res.json({ msg: 'Comment removed' });
  } catch (err) {
    console.error('Delete Comment Error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Add a reply to a comment
router.post('/:postId/comments/:commentId/replies', authenticate, async (req, res) => {
  const { content } = req.body;

  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ msg: 'Comment not found' });

    const newReply = new Comment({
      content,
      post: req.params.postId,
      author: req.user.id,
      parentComment: req.params.commentId
    });

    await newReply.save();

    comment.replies.push(newReply._id);
    await comment.save();

    res.status(201).json(newReply);
  } catch (err) {
    console.error('Add Reply Error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Fetch all replies for a comment
router.get('/:id/comments/:commentId/replies', async (req, res) => {
  try {
    const replies = await Comment.find({ parentComment: req.params.commentId })
      .populate('author', 'firstName lastName profilePhoto')
      .populate({
        path: 'replies',
        populate: {
          path: 'author',
          select: 'firstName lastName profilePhoto'
        }
      });

    res.json(replies);
  } catch (err) {
    console.error('Fetch Replies Error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Update a reply
router.put('/:id/comments/:commentId/replies/:replyId', authenticate, async (req, res) => {
  const { content } = req.body;

  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ msg: 'Comment not found' });

    const reply = comment.replies.id(req.params.replyId);
    if (!reply) return res.status(404).json({ msg: 'Reply not found' });
    if (reply.author.toString() !== req.user.id) return res.status(403).json({ msg: 'Not authorized' });

    reply.content = content;
    await comment.save();

    res.json(comment);
  } catch (err) {
    console.error('Update Reply Error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Delete a reply
router.delete('/:id/comments/:commentId/replies/:replyId', authenticate, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ msg: 'Comment not found' });

    const reply = comment.replies.id(req.params.replyId);
    if (!reply) return res.status(404).json({ msg: 'Reply not found' });
    if (reply.author.toString() !== req.user.id) return res.status(403).json({ msg: 'Not authorized' });

    comment.replies.pull(req.params.replyId);
    await comment.save();

    res.json({ msg: 'Reply removed' });
  } catch (err) {
    console.error('Delete Reply Error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Like or dislike a post
router.post('/:id/react', authenticate, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    const likeIndex = post.likes.indexOf(req.user.id);
    if (likeIndex === -1) {
      post.likes.push(req.user.id);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();

    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;