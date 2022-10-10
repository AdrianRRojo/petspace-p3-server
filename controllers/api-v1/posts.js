const router = require('express').Router()
const db = require('../../models')



// GET /posts - test endpoint
router.get('/', async (req, res) => {
    try {
        const user1 = await db.User.findById(req.headers.userid).populate('posts').populate({path: 'following', populate: {path: 'posts'}})
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

// POST /users/register - CREATE new user
router.post('/', async (req, res) => {
  try {
    // create new user
    const user = await db.User.findById(req.body.userId)
    const newPost = await db.Post.create({
        content: req.body.content,
        user: user})
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
        const post = await db.Post.findById(req.params.postid).populate('comments').populate('likes')
        res.json(post)
    } catch(err) {
        console.log(err)
        res.status(500).json({ msg: 'server error'  })
    }
})

// PUT /:postid 
router.put('/:postid', async (req, res) => {
    console.log(req.body)
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

router.post('/:postid/comment', async (req, res) => {
    try {
      // create new user
    //   const newComment = {content: req.body.content, user: req.body.user}
      const post = await db.Post.findById(req.params.postid)
      post.comments.push(req.body)
      await post.save()
      res.status(201).json(post)
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'server error'  })
    }
})
// PUT /:postid/comment/:commentid 
router.put('/:postid/comment/:commentid', async (req, res) => {
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
router.delete('/:postid/comment/:commentid', async (req, res) => {
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