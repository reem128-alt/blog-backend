const Post = require("../model/Post");
const errorHandler = require("../middleware/error");
const cloudinary=require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const createPost = async (req, res, next) => {
  try {
    const { title, content, category } = req.body;

    if (!content || !title) {
      return next(errorHandler(400, "Please enter all required fields"));
    }
    const uploadOptions = {
      folder: "posts",
    };
    let imagePath = null;
    if (req.file) {
      console.log(req.file) 
      const result = req.file.buffer
      ? await cloudinary.uploader.upload(
          `data:${req.file.mimetype};base64,${req.file.buffer.toString(
            "base64"
          )}`,
          uploadOptions
        )
      : await cloudinary.uploader.upload(req.file.path, uploadOptions);

          imagePath = result.url;
    }

    const slug = title.split(" ").join("-").toLowerCase();
    
    const newPost = await Post.create({
      userId: req.user.id,
      content,
      title,
      slug,
      category,
      image:imagePath,
    });

    return res.status(201).json(newPost);
  } catch (err) {
    next(err);
  }
};

const getAllPosts = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const sortDirection = req.query.sort === "asc" ? 1 : -1;
    const posts = await Post.find({
      ...(req.query.userId && { userId: req.query.userId }),
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.slug && { slug: req.query.slug }),
      ...(req.query.postId && { _id: req.query.postId }),
      ...(req.query.searchTerm && {
        $or: [
          { title: { $regex: req.query.searchTerm, $options: "i" } },
          { content: { $regex: req.query.searchTerm, $options: "i" } },
        ],
      }),
    })
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit);
    const totalPosts = await Post.countDocuments();
    return res.status(200).json({ posts, totalPosts });
  } catch (err) {
    next(err);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const post = await Post.findById(postId);
    
    if (!post) {
      return next(errorHandler(404, "Post not found"));
    }

    console.log('Post:', post); // Log the post object

    // Allow both admin and post owner to delete
    if (!req.user.admin && (!post.userId || post.userId.toString() !== req.user.id)) {
      return next(errorHandler(403, "You can only delete your own posts"));
    }

    const deletedPost = await Post.findByIdAndDelete(postId);
    return res.status(200).json(deletedPost);
  } catch (err) {
    next(err);
  }
};

const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, slug, category } = req.body;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Delete old image if it exists
    if (post.image) {
      const publicId = post.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }

    // Upload new image if provided
    let imagePath = post.image;
    if (req.file) {
      const result = await cloudinary.uploader.upload(`data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`, {
        folder: 'posts'
      } );
      imagePath = result.url;
    }

    // Update post
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { title, slug, category, image: imagePath },
      { new: true }
    );

    return res.status(200).json(updatedPost);
  } catch (err) {
    next(err);
  }
};

module.exports = { createPost, getAllPosts, deletePost, updatePost };
