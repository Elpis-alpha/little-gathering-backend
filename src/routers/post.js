const express = require('express')
const { ObjectId } = require('mongodb')

const auth = require('../middleware/auth')
const Comment = require('../models/Comment')

const Post = require('../models/Post')
const User = require('../models/User')


const router = new express.Router()


// Sends post request to create posts
router.post('/api/posts', auth, async (req, res) => {

  const newPost = new Post({

    ...req.body,

    owner: req.user._id

  })

  try {

    await newPost.save()

    res.status(201).send(newPost)

  } catch (error) {

    res.status(400).send(error)

  }

})


// Sends get request to get all posts
router.get('/api/posts', async (req, res) => {

  const sort = {}

  if (req.query.sortBy) {

    const query = req.query.sortBy.split(':')

    query[1] = query[1] === 'asc' ? 1 : -1

    sort[query[0]] = query[1]

  }

  try {

    const posts = await Post.find({}, null, {

      limit: parseInt(req.query.limit),

      skip: parseInt(req.query.skip),

      sort

    }).exec()

    const returnValue = []

    for (let i = 0; i < posts.length; i++) {

      const item = posts[i];

      const newItem = {}

      const user = await User.findById(item.owner)

      newItem._id = item._id

      newItem.title = item.title

      newItem.text = item.text

      newItem.likes = item.likes

      newItem.dislikes = item.dislikes

      newItem.createdAt = item.createdAt

      newItem.updatedAt = item.updatedAt

      newItem.owner = item.owner

      newItem.owner = item.owner

      newItem.name = user.name

      newItem.email = user.email

      newItem.userCreatedAt = user.createdAt

      newItem.userUpdatedAt = user.updatedAt

      returnValue.push(newItem)

    }

    res.send(returnValue)

  } catch (error) {

    res.status(500).send({ error: 'Server Error' })

  }

})


// Sends get request to get all posts
router.get('/api/posts/user/:id', async (req, res) => {

  const _id = req.params.id

  try {

    const posts = await Post.find({ owner: _id })

    res.send(posts)

  } catch (error) {

    res.status(500).send({ error: 'Server Error' })

  }

})


// Sends get request to get a specific post
router.get('/api/posts/:id', async (req, res) => {

  const _id = req.params.id

  try {

    const post = await Post.findById(_id)

    if (!post) return res.status(404).send()

    const user = await User.findById(post.owner)

    if (!user) return res.status(404).send()

    const comments = await Comment.find({ holder: post._id }, null, { sort: { createdAt: -1 } })

    if (!comments) return res.status(404).send()

    res.send({ owner: user, post, comments })

  } catch (error) {

    res.status(500).send({ error: 'Server Error' })

  }

})


// Sends patch request to update posts
router.patch('/api/posts/:id', auth, async (req, res) => {

  const _id = req.params.id

  const updates = Object.keys(req.body)

  const allowedUpdate = ['text', 'title']

  const isValidOp = updates.every(post => allowedUpdate.includes(post))

  if (!isValidOp) return res.status(400).send({ error: 'Invalid Updates', allowedUpdates: allowedUpdate })

  try {

    const post = await Post.findOne({ _id, owner: req.user._id })

    updates.forEach(item => post[item] = req.body[item])

    await post.save()

    if (!post) return res.status(404).send({ error: 'Not Found' })

    res.status(200).send(post)

  } catch (error) {

    res.status(400).send({ error: 'Server Error' })

  }

})


// Sends patch request to like
router.patch('/api/posts/like/:id', auth, async (req, res) => {

  const _id = req.params.id

  try {

    const post = await Post.findOne({ _id })

    if (!post) return res.status(404).send({ error: 'Not Found' })

    const idListExceptUser = post.likes.filter(id => id !== req.user._id.toString())

    if (idListExceptUser.length === post.likes.length) {

      post.likes = post.likes.concat(req.user._id)

    } else {

      post.likes = idListExceptUser

    }

    await post.save()

    res.status(200).send({ likes: post.likes, dislikes: post.dislikes })

  } catch (error) {

    res.status(400).send({ error: 'Server Error' })

  }

})


// Sends patch request to dislike
router.patch('/api/posts/dislike/:id', auth, async (req, res) => {

  const _id = req.params.id

  try {

    const post = await Post.findOne({ _id })

    if (!post) return res.status(404).send({ error: 'Not Found' })

    const idListExceptUser = post.dislikes.filter(id => id !== req.user._id.toString())

    if (idListExceptUser.length === post.dislikes.length) {

      post.dislikes = post.dislikes.concat(req.user._id)

    } else {

      post.dislikes = idListExceptUser

    }

    await post.save()

    res.status(200).send({ likes: post.likes, dislikes: post.dislikes })

  } catch (error) {

    res.status(400).send({ error: 'Server Error' })

  }

})


// Sends delete request to delete posts
router.delete('/api/posts/:id', auth, async (req, res) => {

  const _id = req.params.id

  try {

    const post = await Post.findOneAndDelete({ _id, owner: req.user._id })

    if (!post) return res.status(404).send()

    res.send(post)

  } catch (error) {

    res.status(500).send({ error: 'Server Error' })

  }

})


router.get('/api/test', async (req, res) => {

  // const usersIDList = [

  //   new ObjectId("621625ce7b2e4f1a186de1d8"),

  //   new ObjectId("621632297b2e4f1a186de1f2"),

  //   new ObjectId("621632367b2e4f1a186de1f6"),

  //   new ObjectId("621632447b2e4f1a186de1fa"),

  //   new ObjectId("6216324e7b2e4f1a186de1fe"),

  //   new ObjectId("6216396fd8544c86613f06e5"),

  //   new ObjectId("6216396fd8544c86613f06e6"),

  //   new ObjectId("6216396fd8544c86613f06e7"),

  //   new ObjectId("6216396fd8544c86613f06e8"),

  //   new ObjectId("6216396fd8544c86613f06e9"),

  //   new ObjectId("6216396fd8544c86613f06ea"),

  //   new ObjectId("6216396fd8544c86613f06eb"),

  //   new ObjectId("6216396fd8544c86613f06ec"),

  //   new ObjectId("6216396fd8544c86613f06ed"),

  //   new ObjectId("6216396fd8544c86613f06ee"),

  //   new ObjectId("6216396fd8544c86613f06ef"),

  //   new ObjectId("6216396fd8544c86613f06f0"),

  //   new ObjectId("6216396fd8544c86613f06f1"),

  //   new ObjectId("6216396fd8544c86613f06f2"),

  //   new ObjectId("6216396fd8544c86613f06f3"),

  //   new ObjectId("6216396fd8544c86613f06f4"),

  //   new ObjectId("6216396fd8544c86613f06f5"),

  //   new ObjectId("6216396fd8544c86613f06f6"),

  //   new ObjectId("6216396fd8544c86613f06f7"),

  //   new ObjectId("6216396fd8544c86613f06f8"),

  //   new ObjectId("62172b4260321686e0283977"),

  // ]

  const posts = await Post.find({})

  posts.forEach(async post => {

    const newDate = new Date(1267434496303 + Math.floor(Math.random() * 378691106221))

    // post.createdAt = newDate.toISOString()
    // post.updatedAt = new Date(newDate.getTime() + 600000).toISOString()


    await post.save()
    // console.log(newDate.toString());
    // console.log(post.createdAt);

    // console.log(post);

  })

  // user.tokens = user.tokens.concat({ token })




  res.send('OK')

})


module.exports = router
