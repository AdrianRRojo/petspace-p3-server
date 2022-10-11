// require packages
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const rowdy = require('rowdy-logger')
const authLockedRoute = require('./controllers/api-v1/authLockedRoute')
const { cloudinary } = require('./utils/cloudinary')

// config express app
const app = express()
const PORT = process.env.PORT || 3001 
// for debug logging 
const rowdyResults = rowdy.begin(app)
// cross origin resource sharing 
app.use(cors())
// request body parsing
app.use(express.urlencoded({ limit: "50mb",extended: false })) // optional added file size limit
app.use(express.json({ limit: "50mb" })) //Added a file size limit to 50mb

const myMiddleWare = (req, res, next) => {
  console.log('hello from a middleware')
  res.locals.myData = 'some info'
  next()//okay express, go to the next thing
}

// app.use(myMiddleWare)
// app.use((req, res, next) => {
//   console.log('hello from a middleware')
//   next()//okay express, go to the next thing
// })
// GET / -- test index route
// route sepecific middleware, only will be applied here on this route
app.get('/',  (req, res) => {
  console.log(res.locals)
  res.json({ msg: 'hello backend 🤖' })
})

// controllers
// prefixing the routes wiht a semantic version
app.use('/api-v1/users', require('./controllers/api-v1/users.js'))
app.use('/api-v1/posts', require('./controllers/api-v1/posts.js'))
app.use('/api-v1/search', require('./controllers/api-v1/search.js'))
// hey listen
app.listen(PORT, () => {
  rowdyResults.print()
  console.log(`is that port ${PORT} I hear? 🙉`)
})