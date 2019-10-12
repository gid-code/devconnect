const express = require('express')
const mongoose = require('mongoose')
const users = require('./routes/api/users')
const profile = require('./routes/api/profile')
const posts = require('./routes/api/posts')
const passport = require('passport')

//load register validation
// const validateRegisterInput = require('..')

const app = express()

app.use(express.json())
app.use(express.urlencoded({
  extended: false
}))

//DB config 
const db = require('./config/keys').mongoURI

//connect to mongoDB
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(()=> console.log("MongoDB is connected"))
  .catch(err => console.log(err))

//passport middleware
app.use(passport.initialize())

//passport config
require('./config/passport')(passport)

//use routes
app.use('/api/users',users)
app.use('/api/profile',profile)
app.use('/api/posts',posts)

const port = process.env.PORT || 5000

app.listen(port, () => console.log(`Server running on port ${port}`))
