const express = require("express")
const router = express.Router()
const userController = require("../controller/userController")
const verifyJwt = require("../middleware/verifyJwt")


router.use(verifyJwt)
router.get("/", userController.getUsers)
router.get("/:userId", userController.getUser)
router.put("/update/:userId", userController.updateUser)
router.delete("/:userId", userController.deleteUser)

module.exports = router
