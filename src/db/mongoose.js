const mongoose = require('mongoose')

const connection = process.env.MONGO_URL

mongoose.connect(connection);