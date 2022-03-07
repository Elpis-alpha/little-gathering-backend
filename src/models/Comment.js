const mongoose = require('mongoose')


const commentSchema = new mongoose.Schema({

  owner: {

    type: mongoose.Schema.Types.ObjectId,

    required: true,

    ref: 'User'

  },

  holder: {

    type: mongoose.Schema.Types.ObjectId,

    required: true,

    ref: 'Post'

  },

  text: {

    type: String,

    trim: true,

    required: true

  }


}, { timestamps: true })

// Comment Model
const Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment
