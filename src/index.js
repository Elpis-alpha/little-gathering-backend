require('./middleware/init')

require('./db/mongoose')

const express = require('express')

const chalk = require('chalk')

const cors = require('cors')

const userRouter = require('./routers/user')

const postRouter = require('./routers/post')

const commentRouter = require('./routers/comment')
const delay = require('./middleware/delay')

const port = process.env.PORT

const isProduction = process.env.IS_PRODUCTION === 'true'


// Acquire an instance of Express
const app = express()


// Automatically parse incoming reqests
app.use(express.json({ limit: "20mb" }))


// Automatically parse form body and encodes
app.use(express.urlencoded({ extended: true }))



// Automatically allow incomming incoming cors
app.use(cors())



// One second delay for local development
if (!isProduction) { app.use(delay) }



// Automatically allows user routers
app.use(userRouter)


// Automatically allows post routers
app.use(postRouter)


// Automatically allows comment routers
app.use(commentRouter)


// Listening Server
app.listen(port, () => {

  console.log(chalk.hex('#009e00')(`Server started successfully on port ${port}`));

  console.log(chalk.cyanBright(`Server time: ${new Date().toLocaleString()}`));

})