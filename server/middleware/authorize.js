const Post = require('../models/Post');

module.exports = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    next();
  } catch (err) {
    console.error('Authorization Error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};