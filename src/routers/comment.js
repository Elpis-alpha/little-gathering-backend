const express = require('express')

const auth = require('../middleware/auth')

const Comment = require('../models/Comment')

const Post = require('../models/Post')

const User = require('../models/User')

const router = new express.Router()


// Sends post request to create comments
router.post('/api/comments', auth, async (req, res) => {

  const post = await Post.findById(req.body.post)

  try {

    const newComment = new Comment({

      ...req.body,

      owner: req.user._id,

      holder: post._id,

      post: undefined

    })

    await newComment.save()

    res.status(201).send(newComment)

  } catch (error) {

    res.status(400).send({ error: 'Server Error' })

  }

})


// Sends get request to get all comments
router.get('/api/comments', async (req, res) => {

  const sort = {}

  if (req.query.sortBy) {

    const query = req.query.sortBy.split(':')

    query[1] = query[1] === 'asc' ? 1 : -1

    sort[query[0]] = query[1]

  }

  try {

    const post = await Post.findById(req.query.post)

    // Return post.comments not post
    await post.populate({

      path: 'comments',

      options: {

        limit: parseInt(req.query.limit),

        skip: parseInt(req.query.skip),

        sort

      }

    })

    const returnValue = []

    // Return post.comments not post
    for (let i = 0; i < post.comments.length; i++) {

      const item = post.comments[i];

      const newItem = {}

      const user = await User.findById(item.owner)

      newItem._id = item._id

      newItem.text = item.text

      newItem.createdAt = item.createdAt

      newItem.updatedAt = item.updatedAt

      newItem.owner = item.owner

      newItem.holder = item.holder

      newItem.name = user.name

      newItem.email = user.email

      returnValue.push(newItem)

    }

    res.send(returnValue)

  } catch (error) {

    res.status(500).send({ error: 'Server Error' })

  }

})


// Sends patch request to update comments
router.patch('/api/comments/:id', auth, async (req, res) => {

  const _id = req.params.id

  const updates = Object.keys(req.body)

  const allowedUpdate = ['text']

  const isValidOp = updates.every(item => allowedUpdate.includes(item))

  if (!isValidOp) return res.status(400).send({ error: 'Invalid Updates', allowedUpdates: allowedUpdate })

  try {

    const comment = await Comment.findOne({ _id, owner: req.user._id })

    updates.forEach(item => comment[item] = req.body[item])

    await comment.save()

    if (!comment) return res.status(404).send({ error: 'Not Found' })

    res.status(200).send(comment)

  } catch (error) {

    res.status(400).send({ error: 'Server Error' })

  }

})


// Sends delete request to delete comments
router.delete('/api/comments/:id', auth, async (req, res) => {

  const _id = req.params.id

  try {

    const comment = await Comment.findOneAndDelete({ _id, owner: req.user._id })

    if (!comment) return res.status(404).send()

    res.send(comment)

  } catch (error) {

    res.status(500).send({ error: 'Server Error' })

  }

})


module.exports = router
