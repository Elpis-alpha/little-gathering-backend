const mongoose = require('mongoose')

const validator = require('validator')

const bcryptjs = require('bcryptjs')

const jsonwebtoken = require('jsonwebtoken');

const Post = require('./Post');

const Comment = require('./Comment');



// Sets up user schema
const userSchemer = new mongoose.Schema({

  name: {

    type: String,

    required: true,

    trim: true,

  },

  email: {

    type: String,

    trim: true,

    unique: true,

    required: true,

    lowercase: true,

    default: 0,

    validate(value) {

      if (!validator.isEmail(value)) {

        throw new Error('Email is invalid')

      }

    }

  },

  password: {

    type: String,

    trim: true,

    required: true,

    minlength: 5,

    validate(value) {

      if (value.toLowerCase().includes('password')) {

        throw new Error('Password must not include "password"')

      }

    },

  },

  tokens: [

    {

      token: {

        type: String,

        required: true

      }

    }

  ],

  avatar: {

    type: Buffer

  },

  avatarSmall: {

    type: Buffer

  }

}, { timestamps: true });



// Create Virtual relationship with Post
userSchemer.virtual('posts', {

  ref: 'Post',

  localField: '_id',

  foreignField: 'owner'

})


// Create Virtual relationship with Comment
userSchemer.virtual('comments', {

  ref: 'Comment',

  localField: '_id',

  foreignField: 'owner'

})


// Generate Authentication Token
userSchemer.methods.generateAuthToken = async function () {

  const user = this

  const token = jsonwebtoken.sign({ _id: user.id.toString() }, process.env.JWT_SECRET, {})

  user.tokens = user.tokens.concat({ token })

  await user.save()

  return token

}


// Private profile
userSchemer.methods.toJSON = function () {

  const user = this

  const returnUser = user.toObject()

  delete returnUser.password

  delete returnUser.tokens

  delete returnUser.avatar

  delete returnUser.avatarSmall

  return returnUser

}


// Public profile
userSchemer.methods.toPublicJSON = function () {

  const user = this

  const returnUser = user.toObject()

  delete returnUser.password

  delete returnUser.tokens

  delete returnUser.avatar

  delete returnUser.avatarSmall

  return returnUser

}


// For login
userSchemer.statics.findbyCredentials = async (email, password) => {

  const user = await User.findOne({ email })

  if (!user) throw new Error('Unable to login')

  const isMatch = await bcryptjs.compare(password, user.password)

  if (!isMatch) throw new Error('Unable to login')

  return user

}


// Hash password
userSchemer.pre('save', async function (next) {

  const user = this

  if (user.isModified('password')) user.password = await bcryptjs.hash(user.password, 8)

  next()

})


// Delete (cascade) posts and comments
userSchemer.pre('remove', async function (next) {

  const user = this

  await Post.deleteMany({ owner: user._id })

  await Comment.deleteMany({ owner: user._id })

  next()

})


// Create User Model
const User = mongoose.model('User', userSchemer)


module.exports = User