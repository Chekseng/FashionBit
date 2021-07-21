require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const session  = require('express-session')
const fashionRouter = require('./routes/routes')
const favicon = require('express-favicon')
const MongoDB_URI = process.env.DB_URL

// initialize express
const app = express()

// connect to mongodb database with mongoose
// mongoose.connect(MongoDB_URI, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false })

// const db = mongoose.connection
// db.on('error', (err) => console.error(err))
// db.once('open', () => console.log('the mongodb database is connected!')) 

async function start () {
  try{
    await mongoose.connect(MongoDB_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      keepAlive: true
    })
    .then(() => console.log('mongoose connection established'))
    .catch((err) => console.log(err))

    // set up a server listening port and success message
    app.listen(process.env.PORT || 3000 , () => console.log('the express server is up and running !'))
  } catch (err) {
    console.log(err)
  }
}

start();


// set the ejs view engine
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(favicon(__dirname + '/public/favicon/favicon.ico'))
app.use(session({
  secret: 'secret key',
  saveUninitialized: true,
  resave: false,
}))

// middleware to initialize express session
app.use((req,res,next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
})

// the routes set up 
app.use('', fashionRouter)

// set the public folder to static
app.use(express.static('public'))
