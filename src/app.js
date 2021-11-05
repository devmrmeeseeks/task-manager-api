const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/users')
const taskRouter = require('./routers/tasks')

//Start express
const app = express()

//Express configuration
app.use(express.json());
app.use(userRouter)
app.use(taskRouter)

module.exports = app