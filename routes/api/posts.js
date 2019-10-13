const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const passport = require('passport')

const Post = require('../../models/Post')

//validation
const validatePostInput = require('../../validation/post')

//@route GET api/posts/test
//@desc   Test posts route
//@access public
router.get('/test', (req, res) => res.json({
  msg: "Posts work"
}))

//@route GET api/posts
//@desc   Get posts route
//@access public 
router.get('/', (req, res) => {
  Post.find().sort({
    date: -1
  }).then(posts => res.json(posts))
  .catch(err => res.status(404).json({
    msg: "No posts found"
  }))
})

//@route GET api/posts/:id
//@desc   Get posts by id route
//@access public 
router.get('/:id', (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err => res.status(404).json({
      msg: "No post found with that ID"
    }))
})


//@route POST api/posts
//@desc   Create posts route
//@access private
router.post('/', passport.authenticate('jwt', {
  session: false
}), (req, res) => {

  const { errors, isValid } = validatePostInput(req.body)

  //check validation
  if(!isValid){
    return res.status(400).json(errors)
  }

  const newPost = new Post({
    name: req.body.name,
    text: req.body.text,
    avatar: req.body.avatar,
    user: req.user.id
  })

  newPost.save().then(post => res.json(post))
})

//@route DELETE api/posts/:id
//@desc Delete post
//@access Private
router.delete('/:id', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  Profile.findOne({
    user: req.user.id
  }).then(profile => {
    Post.findById(req.params.id).then(post => {
      //check for post owner
      if(post.user.toString() !== req.user.id){
        return res.status(401).json({
          msg: "User not authorized."
        })
      }

      //delete
      post.remove().then( () => res.json({
        success: true
      }))
    })
    .cathc(err => res.status(404).json({
      msg: "Post not found"
    }))
  })
})

//@route POST api/posts/like/:id
//@desc like a post
//@access Private
router.post('/like/:id', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  Profile.findOne({
    user: req.user.id
  }).then(profile => {
    Post.findById(req.params.id).then(post => {
        //check for post owner
        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
          return res.status(400).json({
            msg: "User already liked this post."
          })
        }

        //add user id to likes array
        post.likes.unshift({
          user: req.user.id
        })

        post.save().then(post => res.json(post))
      })
      .cathc(err => res.status(404).json({
        msg: "Post not found"
      }))
  })
})

//@route POST api/posts/unlike/:id
//@desc unlike post
//@access Private
router.delete('/unlike/:id', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  Profile.findOne({
    user: req.user.id
  }).then(profile => {
    Post.findById(req.params.id).then(post => {
      //check for post owner
      if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
        return res.status(400).json({
          msg: "You have not liked this post."
        })
      }

      //get removeindex
      const removeIndex = post.likes.map(item => item.user.toString()).indexOf(req.user.id)

      //splice out array
      post.likes.splice(removeIndex,1)

      post.save().then(post => res.json(post))
    })
      .cathc(err => res.status(404).json({
        msg: "Post not found"
      }))
  })
})

//@route  POST api/posts/comment/:id
//@desc   Add comment to post
//@access private
router.post('/comment/:id', passport.authenticate('jwt', {
  session: false
}, (req, res) => {
  const {
    errors,
    isValid
  } = validatePostInput(req.body)

  //check validation
  if (!isValid) {
    return res.status(400).json(errors)
  }

  Post.findById(req.params.id).then(post => {

    const newComment = {
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    }

    //add to comments
    post.comments.unshift(newComment)

    //save
    post.save().then(post => res.json(post))
  })
  .catch(err => res.status(404).json({
    msg: "Post not found"
  }))
}))

//@route  DELETE api/posts/comment/:id/:comment_id
//@desc   Remove comment to post
//@access private
router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', {
  session: false
}, (req, res) => {
  Post.findById(req.params.id).then(post => {
      //check to see if comment exists
      if(post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
        return res.status(404).json({
          error: 'Comment does not exist'
        })
      }

      const removeIndex = post.comments.map(comment => comment._id.toString()).indexOf(req.params.comment_id)

      post.comment.splice(removeIndex,1)

      //save
      post.save().then(post => res.json(post))
    })
    .catch(err => res.status(404).json({
      msg: "Post not found"
    }))
}))

module.exports = router