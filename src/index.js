const express = require('express')

const chalk = require('chalk')

const cors = require('cors')

const mongoose = require('./db/mongoose')

const userRouter = require('./routers/user')

const postRouter = require('./routers/post')

const commentRouter = require('./routers/comment')

const port = process.env.PORT

const isProduction = process.env.IS_PRODUCTION === 'true'


// Acquire an instance of Express
const app = express()


// Automatically parse incoming reqests
app.use(express.json())

// app.use(express.urlencoded({limit: '20mb', extended: true, parameterLimit: 50000}))


// Automatically allow incomming incoming cors
app.use(cors())


if (!isProduction) {

  app.use(async (req, res, next) => {

    await new Promise(resolve => setTimeout(resolve, 1000))

    next()

  })
  
}


// Automatically allows user routers
app.use(userRouter)


// Automatically allows post routers
app.use(postRouter)


// Automatically allows comment routers
app.use(commentRouter)


// Listening Server
app.listen(port, () => {

  console.log(chalk.yellow('\n\nInitializing Server'));

  console.log(`Server starting on port ${port}`);

})