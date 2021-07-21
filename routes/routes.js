const express = require('express')
const Fashion = require('../model/fashion')
const router = express.Router();
const multer = require("multer")
const heroData = require('../public/js/data/heroData.js')
const footerData = require('../public/js/data/footerData')
const fs = require('fs')
const path = require('path')

// set up multer for file upload
let storage = multer.diskStorage({
  destination: (req,file,cb) => {
    cb(null, 'public/uploads')
  },
  filename: (req,file,cb) => {
    cb(null, `${file.fieldname}_${Date.now()}_${file.originalname}`)
  }
})

let upload = multer({
  storage: storage,
}).single('image')

// get route for home page
router.get('/', async (req,res) => {
  await Fashion.find().sort({ created: 'desc'}).exec((err, articles) => {
    if(err){
      console.error(err)
      res.json({ message: err.message })
    } else {
      res.render('pages/index', {
        title: 'Home Page',
        heroData: heroData,
        footerData: footerData,
        articles: articles,
      })
    }
  })
})

// get route for the about page
router.get('/about', (req,res) => {
  res.render('pages/about', {
    title: 'About Page',
    footerData: footerData,
  })
})

// get route for the contact page
router.get('/contact', (req,res) => {
  res.render('pages/contact', {
    title: 'Contact Page',
    footerData: footerData,
  })
})

// get route for add blogs
router.get('/add-blog', (req,res) => {
  res.render('pages/add-blog', { 
    title: 'Add-blog',
    footerData: footerData,
  })
})

// post route for add blogs
router.post('/add-blog', upload, async (req,res) => {
  let fashion = new Fashion({
    title: req.body.title,
    author: req.body.author,
    category: req.body.category,
    description: req.body.description,
    image: req.file.filename,
  })

  try {
    await fashion.save((err) => {
      if(err) {
        console.error(err)
        res.json({ message: err.message })
      } else {
        req.session.message = {
          postMessage: 'Blog Article Successfully Added'
        }
        res.redirect('/archive')
      }
    })
    } catch (err) {
      res.status(500).send(err)
  }
  
})

// get route for post archive
router.get('/archive', async (req,res) => {
  await Fashion.find().sort({ created: 'desc' }).exec((err, articles) => {
    if(err){
      console.error(err)
      res.json({ message: err.message })
    } else {
      res.render('pages/archive', {
        title: 'Blog Archives',
        articles: articles,
        footerData: footerData,
      })
    }
  })
})

// get route for single blog
router.get('/:id', async (req,res) => {
  let id = req.params.id;
  await Fashion.find().sort({ created: 'desc'}).exec( async (err, articles) => {
    await Fashion.findById(id, (err, results) => {
    if(err){
      res.redirect('/')
    } else {
      if(results == null){
        res.redirect('/')
      } else {
        res.render('pages/blog-detail', {
          title: `${results.title.slice(0,10)}... | Detail Page`,
          results: results,
          articles: articles,
          footerData: footerData,
        })
      }
    }
  })
  })
})

// get route for editing a single blog
router.get('/edit/:id', async (req,res) => {
  let id = req.params.id;
  await Fashion.findById(id, (err, results) => {
    if(err){
      console.error(err)
      res.json({ message: err.message})
    } else {
      if(results == null){
        res.redirect('/')
      } else {
        res.render('pages/edit-blog', {
          title: `Edit ${results.title.slice(0,10)}..`,
          results: results,
          footerData: footerData,
        })
      }
    }
  })
})

// put route to update already existing blog article
router.post('/update/:id', upload, async (req,res) => {
  let id = req.params.id;
  let new_image = ''
  if(req.file){
    new_image = req.file.filename;
    try{
      fs.unlinkSync('public/uploads/' + req.body.old_image)
    } catch (err) {
      console.error(err)
    }
  } else {
    new_image = req.body.old_image;
  }

  await Fashion.findByIdAndUpdate(id, {
    title: req.body.title,
    author: req.body.author,
    category: req.body.category,
    description: req.body.description,
    image: new_image,
  },  (err, result) => {
    if(err){
      res.json({ message: err.message})
    } else {
      req.session.message = {
        updateMessage: 'Blog Article Has Been Successfully Updated'
      }
      res.redirect('/archive')
    }
  })
})

// delete route for single blog post
router.get('/delete/:id', async (req,res) => {
  let id = req.params.id;
  await Fashion.findByIdAndRemove(id, (err,result) => {
    if(result.image != ''){
      try{
        fs.unlinkSync('public/uploads/' + result.image)
      } catch (err) {
        console.error(err)
      }
    }

    if(err) {
      res.json({ message: err.message })
    } else {
      req.session.message = {
        deleteMessage: 'Blog Article Has Been Successfully Deleted'
      }
      res.redirect('/archive')
    }
  })
})

module.exports = router;