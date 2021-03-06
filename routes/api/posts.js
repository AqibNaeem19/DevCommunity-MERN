const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

//  Importing User, Profile and Post model
const Post = require('../../models/Post');
const User = require('../../models/User');
const Profile = require('../../models/Profile');
const request = require('request');

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

// @route   GET api/posts/:post_id
// @desc    Get a post by its id
// @access  Private
router.get('/:post_id', auth, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.post_id});

    //  If no post found by specific id, send error message
    if (!post){
      return res.status(404).json({ msg: 'Post not found'});
    }

    res.json(post);

  } catch (error) {
    console.error(error.message);
    if ( error.kind === 'ObjectId' ){
      return res.status(404).json({ msg: 'Post not found'});
    }
    res.status(500).send('Server Error');

  }
})

// @route   DELETE api/posts/:post_id
// @desc    Delete a post by its id
// @access  Private
router.delete('/:post_id', auth, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.post_id});

    //  If no post found by specific id, send error message
    if (!post){
      return res.status(404).json({ msg: 'Post not found'});
    }

    // It checks the post object user id and the request user id, if the 2 matches,
    //  then it means the user is the creator of the post and is authorized to delete,
    //  it, otherwise no authentication user can remove others posts.
    if (post.user.toString() !== req.user.id){
      return res.status(401).json({ msg: 'Not authorize to delete post'});
    }

    await post.remove();
    res.json({ msg: 'Post deleted Successfully'});

  } catch (error) {
    console.error(error.message);
    if ( error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found to delete'})
    }
    res.status(500).send('Server Error')
  }
});

// @route   PUT api/posts/like/:post_id
// @desc    Like a post
// @access  Private
router.put('/like/:post_id', auth, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.post_id});

    //  Check if the post has already liked
    if ( post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
      return res.status(400).json({ msg: 'Post already liked'})
    }

    post.likes.unshift({ user: req.user.id});
    await post.save();

    res.json(post.likes);

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/posts/unlike/:post_id
// @desc    Unlike a post
// @access  Private
router.put('/unlike/:post_id', auth, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.post_id});

    //  Check if the post has been liked
    if ( post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
      return res.status(400).json({ msg: 'Post is not liked'})
    }

    //  Get remove Index and remove the like
    const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.params.post_id);
    post.likes.splice(removeIndex, 1);

    await post.save();
    res.json(post.likes);

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/posts/comment/:post_id
// @desc    Comment on a post
// @access  Private
router.post(
  '/comment/:post_id',
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
      const post = await Post.findById({ _id: req.params.post_id});

      //  Build comment object
      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      post.comments.unshift(newComment);
      await post.save();
      res.json(post.comments);

    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');

    }
});

// @route   POST api/posts/comment/:post_id/:comment_id
// @desc    Delete a comment from post
// @access  Private
router.delete('/comment/:post_id/:comment_id', auth, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.post_id});

    //  Pull out comment
    const comment = post.comments.find(comment => comment.id === req.params.comment_id);

    //  Make sure comment exists
    if ( !comment ) {
      return res.status(404).json({ msg: 'Comment does not exist' });
    }

    //  Checj user is authorized
    if ( comment.user.toString() !== req.user.id ) {
      return res.status(401).json({ msg: 'User not authorized'});
    }

     //  Get remove Index and remove the comment
     const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);
     post.comments.splice(removeIndex, 1);
 
     await post.save();
     res.json(post.comments);


  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');

  }
})



module.exports = router;