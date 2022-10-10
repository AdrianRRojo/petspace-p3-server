const router = require('express').Router()
const db = require('../../models')

const { cloudinary } = require('../../utils/cloudinary')
const multer = require('multer')
const { unlinkSync } = require('fs')
const uploads = multer({ dest: 'uploads/' })

// GET /posts - test endpoint
router.get('/', async (req, res) => {
    try {
        const user1 = await db.User.findById(req.headers.userid).populate({path: 'posts', populate: {path: 'user'}}).populate({path: 'following', populate: {path: 'posts',populate: {path: 'user'}}})
        const friendsAndUser = user1.following.concat(user1)
        let posts = []
        friendsAndUser.forEach((people) => {
            posts = posts.concat(people.posts)
        })
        posts.sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))
        res.json(posts)
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'server error'  })
    }
    
})
router.get('/api/images', async (req,res ) => {
   try{
    const {resources} = await cloudinary.search.expression("folder: dev_setups")
    .execute()
    const publicIds = resources.map(file => file.public_id)
    res.send(publicIds)
   }catch(err){
    console.warn(err)
   }
})

router.post('/', uploads.single('image'), async (req, res) => {
    try {
      // create new user
      const user = await db.User.findById(req.body.userId)
      // console.log(req.body, req.file)
      const uploadedResponse = await cloudinary.uploader.upload(req.file.path)
      console.log(uploadedResponse)
  
      const newPost = await db.Post.create({
          content: req.body.content,
          user: user,
          photo: uploadedResponse.url     
      
      })
      unlinkSync(req.files.path)
      user.posts.push(newPost)
      await user.save()
      res.status(201).json(newPost)
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'server error'  })
    }
  })

// GET /:postid 
router.get('/:postid', async (req, res) => {
    try {
        const post = await db.Post.findById(req.params.postid).populate({path:'comments', populate: {path: 'user'}}).populate('likes').populate('user')
        res.json(post)
    } catch(err) {
        console.log(err)
        res.status(500).json({ msg: 'server error'  })
    }
})

// Like a post
router.post('/:postid/like', async (req, res) => {
    try {
        const post = await db.Post.findById(req.params.postid)
        console.log(post)
        const user = await db.User.findById(req.body.userId)
        console.log(user)
        const like = {user: user}
        post.likes.push(like)
        await post.save()
        res.json(post)
    } catch(err) {
        console.log(err)
        res.status(500).json({ msg: 'server error'  })
    }
})
router.delete('/:postid/like', async (req, res) => {
    try {
        const post = await db.Post.findById(req.params.postid)
        const index = post.likes.findIndex((like) => {return like.user.id === req.body.userId})
        post.likes.splice(index, 1)
        await post.save()
        res.sendStatus(204)
        res.json(post)
    } catch(err) {
        console.log(err)
        res.status(500).json({ msg: 'server error'  })
    }
})
// PUT /:postid 
router.put('/:postid', async (req, res) => {
    try {
        const options = {new: true}
        const updatedPost = await db.Post.findByIdAndUpdate(req.params.postid, req.body, options)
        res.json(updatedPost)
    } catch(err) {
        console.log(err)
        res.status(500).json({ msg: 'server error'  })
    }
})


router.delete('/:postid', async (req, res) => {
    try {
        await db.Post.findByIdAndDelete(req.params.postid)
        res.sendStatus(204)
    } catch(err) {
        console.log(err)
        res.status(500).json({ msg: 'server error'  })
    }
})

router.post('/:postid/comments', async (req, res) => {
    try {
      const user = await db.User.findById(req.body.userId)
      const newComment = {content: req.body.content, user: user}
      const post = await db.Post.findById(req.params.postid).populate('user')
      post.comments = [newComment, ...post.comments]
      await post.save()
      console.log(post)
      res.status(201).json(newComment)
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'server error'  })
    }
})
// PUT /:postid/comment/:commentid 
router.put('/:postid/comments/:commentid', async (req, res) => {
    try {
        const post = await db.Post.findById(req.params.postid)
        const index = post.comments.findIndex((comment) => {return comment.id === req.params.commentid})
        post.comments[index] = {...post.comments[index], content: req.body.content}
        await post.save()
        res.json(post)
    } catch(err) {
        console.log(err)
        res.status(500).json({ msg: 'server error'  })
    }
})
router.delete('/:postid/comments/:commentid', async (req, res) => {
    try {
        const post = await db.Post.findById(req.params.postid)
        const index = post.comments.findIndex((comment) => {return comment.id === req.params.commentid})
        post.comments.splice(index, 1)
        await post.save()
        res.sendStatus(204)
    } catch(err) {
        console.log(err)
        res.status(500).json({ msg: 'server error'  })
    }
})
module.exports = router