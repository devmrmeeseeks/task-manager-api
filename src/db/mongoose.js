const mongoose = require('mongoose')

const connection = process.env.MONGO_URL
const dbname = 'task-manager-api'

mongoose.connect(`${connection}/${dbname}`);