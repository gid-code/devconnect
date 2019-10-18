const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const passport = require('passport')

//load profile model
const Profile = require('../../models/Profile')

//load user model
const User = require('../../models/User')

//load validation
const validateProfileInput = require('../../validation/profile')
const validateExperienceInput = require('../../validation/experience')
const validateEducationInput = require('../../validation/education')

//@route GET api/profile/test
//@desc   Test profile route
//@access public
router.get('/test', (req, res) => res.json({
  msg: "Profile work"
}))

//@route  GET api/profile/handle/:handle
//@desc   Get profile by handle route
//@access public
router.get('/handle/:handle', (req, res) => {
  const errors = {}
  Profile.findOne({
      handle: req.params.handle
    })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user"
        return res.status(404).json(errors)
      }
      res.json(profile)
    })
    .catch(err => res.status(404).json({
      profile: "There is no profile for this user"
    }))
})

//@route  GET api/profile/user/:user_id
//@desc   Get profile by user_id route
//@access public
router.get('/user/:user_id', (req, res) => {
  const errors = {}
  Profile.findOne({
      user: req.params.user_id
    })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user"
        return res.status(404).json(errors)
      }
      res.json(profile)
    })
    .catch(err => res.status(404).json({
      profile : "There is no profile for this user"
    }))
})

//@route  GET api/profile/all
//@desc   Get all profiles
//@access public
router.get('/all', (req, res) => {
  const errors = {}
  Profile.find()
    .populate('user', ['name', 'avatar'])
    .then(profiles => {
      if (!profiles) {
        errors.noprofile = "There are no profiles"
        return res.status(404).json(errors)
      }
      res.json(profiles)
    })
    .catch(err => res.status(404).json({
      profile: "There are no profiles"
    }))
})

//@route GET api/profile/
//@desc   Get current users' route
//@access private
router.get('/', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  const errors = {}
  Profile.findOne({
      user: req.user.id
    })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user"
        return res.status(404).json(errors)
      }
      res.json(profile)
    })
    .catch(err => res.status(404).json(err))
})

//@route POST api/profile/
//@desc   Create or Edit user profile route
//@access private
router.post('/', passport.authenticate('jwt', {
  session: false
}), (req, res) => {

  const { errors, isValid } = validateProfileInput(req.body)

  //check validation
  if (!isValid) {
    //return erros with 400
    return res.status(400).json(errors)
  }

  //get fields
  const profilefields = {}
  profilefields.user = req.user.id
  if (req.body.handle) profilefields.handle = req.body.handle
  if (req.body.company) profilefields.company = req.body.company
  if (req.body.status) profilefields.status = req.body.status
  if (req.body.website) profilefields.website = req.body.website
  if (req.body.location) profilefields.location = req.body.location
  if (req.body.bio) profilefields.bio = req.body.bio
  if (req.body.githubusername) profilefields.githubusername = req.body.githubusername

  //skills - split into array
  if (typeof req.body.skills !== 'undefined') {
    profilefields.skills = req.body.skills.split(',')
  }

  //social
  profilefields.social = {}
  if (req.body.youtude) profilefields.social.youtude = req.body.youtude
  if (req.body.twitter) profilefields.social.twitter = req.body.twitter
  if (req.body.facebook) profilefields.social.facebook = req.body.facebook
  if (req.body.linkedin) profilefields.social.linkedin = req.body.linkedin
  if (req.body.instagram) profilefields.social.instagram = req.body.instagram

  Profile.findOne({
      user: req.user.id
    })
    .then(profile => {
      if (profile) {
        //update
        Profile.findOneAndUpdate({
          user: req.user.id
        }, {
          $set: profilefields
        }, {
          new: true
        }).then(profile => res.json(profile))
      } else {
        //create

        //check if handle exist
        Profile.findOne({
          handle: profilefields.handle
        }).then(profile => {
          if (profile) {
            errors.handle = "That handle already exist"
            res.status(400).json(errors)
          }

          //save profile
          new Profile(profilefields).save().then(profile => res.json(profile))
        })
      }
    })
    .catch(err => res.status(400).json(err))
})

//@route POST api/profile/experience
//@desc   Add experience to user profile route
//@access private
router.post('/experience', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  // const errors = {}
  const {
    errors,
    isValid
  } = validateExperienceInput(req.body)

  //check validation
  if (!isValid) {
    //return erros with 400
    return res.status(400).json(errors)
  }

  Profile.findOne({
      user: req.user.id
    })
    // .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user"
        return res.status(404).json(errors)
      }
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      }

      //Add to exp array
      profile.experience.unshift(newExp)

      profile.save().then(profile => res.json(profile))
    })
    .catch(err => res.status(404).json(err))
})

//@route POST api/profile/education
//@desc   Add education to user profile route
//@access private
router.post('/education', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  // const errors = {}
  const {
    errors,
    isValid
  } = validateEducationInput(req.body)

  //check validation
  if (!isValid) {
    //return erros with 400
    return res.status(400).json(errors)
  }

  Profile.findOne({
      user: req.user.id
    })
    // .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user"
        return res.status(404).json(errors)
      }
      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      }

      //Add to exp array
      profile.education.unshift(newEdu)

      profile.save().then(profile => res.json(profile))
    })
    .catch(err => res.status(404).json(err))
})

//@route DELETE api/profile/experience/:exp_id
//@desc   Delete experience to user profile route
//@access private
router.delete('/experience/:exp_id', passport.authenticate('jwt', {
  session: false
}), (req, res) => {

  Profile.findOne({
      user: req.user.id
    })
    // .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user"
        return res.status(404).json(errors)
      }
      //get removeindex
      const removeindex = profile.experience.map(item => item).indexOf(req.params.exp_id)

      //splice out of array
      profile.experience.splice(removeindex,1)

      //save
      profile.save().then(profile => res.json(profile))
    })
    .catch(err => res.status(404).json(err))
})


//@route DELETE api/profile/education/:edu_id
//@desc   Delete education to user profile route
//@access private
router.delete('/education/:edu_id', passport.authenticate('jwt', {
  session: false
}), (req, res) => {

  Profile.findOne({
      user: req.user.id
    })
    // .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user"
        return res.status(404).json(errors)
      }
      //get removeindex
      const removeindex = profile.education.map(item => item).indexOf(req.params.edu_id)

      //splice out of array
      profile.education.splice(removeindex,1)

      //save
      profile.save().then(profile => res.json(profile))
    })
    .catch(err => res.status(404).json(err))
})


//@route DELETE api/profile
//@desc   Delete user and profile route
//@access private
router.delete('/', passport.authenticate('jwt', {
  session: false
}), (req, res) => {

  Profile.findOneAndRemove({
      user: req.user.id
    })
    .then(() => {
      User.findOneAndRemove({
        _id : req.user.id
      }).then(() => {
        res.json({
          success : true
        })
      })
    }
    )
    .catch(err => res.status(404).json(err))
})

module.exports = router