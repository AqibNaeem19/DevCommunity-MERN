const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

//  Importing User, Profile and Post model
const Post = require('../../models/Post');
const User = require('../../models/User');
const Profile = require('../../models/Profile');

// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('text', 'Text is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    // If required fields are not present or incorrect, send bad request as a response
    const errors = validationResult(req);
    if( !errors.isEmpty()){
      return res.status(400).json({ errors: errors.array()})
    };

    try {
      const user = await User.findById(req.user.id).select('-password');

      //  Build post object
      newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      const post = await newPost.save();
      res.json(post);

    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');

    }
});

// @route   GET api/posts
// @desc    Get all posts
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1});
    res.json(posts);

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error')
  }
  
})

module.exports = router;