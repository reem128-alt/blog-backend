const Comment = require('../model/Comment')
const errorHandler = require('../middleware/error')

const createComment = async (req, res, next) => {
    try {
        const { postId, content } = req.body
        const newComment = await Comment.create({ 
            userId: req.user.id, 
            postId, 
            content 
        })
        return res.status(200).json(newComment)
    }
    catch (err) {
        next(err)
    }
}

const getPostComments = async (req, res, next) => {
    try {
        const postId = req.params.postId
        const comments = await Comment.find({ postId })
            .sort({ createdAt: -1 })
            .populate('userId', 'username profilePicture')
        return res.status(200).json(comments)
    }
    catch (err) {
        next(err)
    }
}

const likeComment = async (req, res, next) => {
    try {
        const commentId = req.params.commentId
        const comment = await Comment.findById(commentId)
        if (!comment) {
            return next(errorHandler(404, "comment not found"))
        }
        const userIndex = comment.likes.indexOf(req.user.id)
        if (userIndex === -1) {
            comment.likes.push(req.user.id)
            comment.numberOfLikes++
        }
        else {
            comment.likes.splice(userIndex, 1)
            comment.numberOfLikes--
        }
        const updatedComment = await comment.save()
        return res.status(200).json(updatedComment)
    }
    catch (err) {
        next(err)
    }
}

const editComment = async (req, res, next) => {
    try {
        const commentId = req.params.commentId
        const comment = await Comment.findById(commentId)
        if (!comment) {
            return next(errorHandler(404, "comment not found"))
        }
        if (comment.userId.toString() !== req.user.id) {
            return next(errorHandler(403, "you can edit only your comments"))
        }
        comment.content = req.body.content
        const updatedComment = await comment.save()
        return res.status(200).json(updatedComment)
    }
    catch (err) {
        next(err)
    }
}

const deleteComment = async (req, res, next) => {
    const commentId = req.params.commentId
    const comment = await Comment.findById(commentId)
    if (!comment) {
        return next(errorHandler(404, "comment not found"))
    }
    if (comment.userId.toString() !== req.user.id) {
        return next(errorHandler(403, "you can delete only your comments"))
    }
    await comment.deleteOne()
    return res.status(200).json({
        message: "comment deleted successfully"
    })
}
const getComments=async(req,res,next)=>{
    if (!req.user.admin){
        return next(errorHandler(403,"you are not admin"))
    }
    try{
        const startIndex=parseInt(req.query.startIndex) || 0
        const limit=parseInt(req.query.limit) || 10
        const sort=req.query.sort ==="asc" ? 1 : -1
        const comments=await Comment.find().sort({createdAt:sort}).skip(startIndex).limit(limit)
        const totalComments=await Comment.countDocuments()
        return res.status(200).json({comments,totalComments})
    }
    catch(err){
        next(err)
    }
}

module.exports = {
    createComment,
    getPostComments,
    likeComment,
    editComment,
    deleteComment,
    getComments
}
