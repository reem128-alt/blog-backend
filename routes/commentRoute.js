const express = require('express')
const router = express.Router()
const { getComments,createComment, getPostComments, likeComment, editComment, deleteComment } = require('../controller/commentController')
const verifyJwt = require('../middleware/verifyJwt')

// Apply JWT verification middleware to all routes
router.use(verifyJwt)

// Comment routes
router.get('/',getComments)
router.post('/',createComment)
router.get('/:postId',getPostComments)
router.put('/like/:commentId',likeComment)
router.put('/:commentId',editComment)
router.delete('/:commentId',deleteComment)

module.exports = router