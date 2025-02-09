const express = require("express");
const router = express.Router();
const PostController = require("../controller/postController");
const upload = require("../middleware/multer");
const verifyJwt = require("../middleware/verifyJwt");

router.use(verifyJwt);
router.post("/", upload.single("image"), PostController.createPost);
router.get("/", PostController.getAllPosts);
router.delete("/:postId", PostController.deletePost);
router.put("/:postId", upload.single("image"), PostController.updatePost);

module.exports = router;
