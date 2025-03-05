const express = require("express")
const router = express.Router()
const userController = require("../controller/userController")
const verifyJwt = require("../middleware/verifyJwt")
const  upload = require("../middleware/multer")

router.use(verifyJwt)
router.get("/", userController.getUsers)
router.get("/:userId", userController.getUser)
router.put("/update/:userId", userController.updateUser)
router.put("/profile-picture",upload.single("profile-picture") ,userController.updateUserProfile)
router.delete("/:userId", userController.deleteUser)

module.exports = router
