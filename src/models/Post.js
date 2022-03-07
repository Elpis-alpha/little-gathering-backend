const mongoose = require('mongoose')

const Comment = require('./Comment')


const postSchema = new mongoose.Schema({

  owner: {

    type: mongoose.Schema.Types.ObjectId,

    required: true,

    ref: 'User'

  },

  title: {

    type: String,

    required: true,

    trim: true,

  },

  text: {

    type: String,

    trim: true,

  },

  likes: [

    {

      type: String,

      required: true

    }

  ],

  dislikes: [

    {

      type: String,

      required: true

    }

  ],

}, { timestamps: true })



// Create Virtual relationship with Comment
postSchema.virtual('comments', {

  ref: 'Comment',

  localField: '_id',

  foreignField: 'holder'

})


// prevent duplicate likes or dislikes
postSchema.pre('save', async function (next) {

  const post = this

  if (post.isModified('likes')) {

    post.likes = post.likes.map(item => item.toString())

    post.likes = post.likes.filter((v, i, s) => s.indexOf(v) === i)

    post.dislikes = post.dislikes.filter(dis => !post.likes.includes(dis))

  }

  if (post.isModified('dislikes')) {

    post.dislikes = post.dislikes.map(item => item.toString())

    post.dislikes = post.dislikes.filter((v, i, s) => s.indexOf(v) === i)

    post.likes = post.likes.filter(li => !post.dislikes.includes(li))

  }

  next()

})


// Delete (cascade) comments
postSchema.pre('remove', async function (next) {

  const post = this

  await Comment.deleteMany({ holder: post._id })

  next()

})


// Post Model
const Post = mongoose.model('Post', postSchema)

module.exports = Post
