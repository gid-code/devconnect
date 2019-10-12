const express = require('express')
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const keys = require('../../config/keys')
const router = express.Router()
const passport = require('passport')

//load register validation
const validateRegisterInput = require('../../validation/register')
const validateLoginInput = require('../../validation/login')

//load users
const User = require('../../models/User')

//@route GET api/users/test
//@desc   Test users route
//@access public
router.get('/test', (req,res) => res.json({msg: "Users work"}) )

//@route  POST api/users/register
//@desc   Register users route
//@access public
router.post('/register', (req,res) => {
  const { errors,isValid } = validateRegisterInput(req.body)

  //check validation
  if(!isValid){
    return res.status(400).json(errors)
  }

  User.findOne({ email : req.body.email })
    .then(user => {
      if(user){
        errors.email = "Email already exist"
        return res.status(400).json(errors)
      }else{
        const avatar = gravatar.url(req.body.email,{
          s: '200', //size
          r: 'pg', //rating
          d: 'mm' //default
        })
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          avatar,
          password: req.body.password
        })

        bcrypt.genSalt(10, (err,salt) => {
          bcrypt.hash(newUser.password, salt, (err,hash) => {
            if(err) throw err
            newUser.password = hash
            newUser.save()
              .then(user => res.json(user))
              .catch(err => console.log(err))
          })
        })
      }
    })
})

//@route  POST api/users/login
//@desc   Login user route return jwt
//@access public
router.post('/login', (req,res) => {
  const {
    errors,
    isValid
  } = validateLoginInput(req.body)

  //check validation
  if (!isValid) {
    return res.status(400).json(errors)
  }
  const email = req.body.email
  const password = req.body.password

  User.findOne({email})
    .then(user => {
      if(!user){
        errors.email = "User not found"
        return res.status(404).json(errors)
      }

      bcrypt.compare(password, user.password)
        .then(isMatch => {
          if(isMatch){
            //check payload
            const payload = {id: user.id, name: user.name, avatar: user.avatar}

            //sign token
            jwt.sign(
              payload,
              keys.secretOrKey,
              {expiresIn: 3600},
              (err, token) => {
                if(err) throw err
                res.json({
                  success: true,
                  token: 'Bearer ' + token
                })
              }
            )
            // res.json({msg: "Success"})
          }else{
            errors.password = "Password incorrect"
            return res.status(400).json(errors)
          }
        })
    })
})

module.exports = router