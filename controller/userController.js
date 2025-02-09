const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const errorHandler = require("../middleware/error");

const getUsers = async (req, res, next) => {
  if (!req.user.admin) {
    return next(errorHandler(403, "you are not admin"));
  }
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort === "asc" ? 1 : -1;

    const users = await User.find()
      .sort({ createdAt: sort })
      .skip(startIndex)
      .limit(limit);

    const usersWithoutPassword = users.map((user) => {
      const { password, ...others } = user._doc;
      return others;
    });
    const totalUser = await User.countDocuments();
    return res.status(200).json({ users: usersWithoutPassword, totalUser });
  } catch (err) {
    next(err);
  }
};

const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }
    const { password, ...rest } = user._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    console.log("Update request for user:", userId);
    console.log("File in request:", req.file);
    console.log("Body:", req.body);

    if (req.user.id !== userId && !req.user.admin) {
      return next(errorHandler(403, "you can update only your account"));
    }

    // Create updateData object with basic fields
    const updateData = {};

    // Only add fields that are actually provided
    if (req.body.username) updateData.username = req.body.username;
    if (req.body.email) updateData.email = req.body.email;

    // Handle password if provided
    if (req.body.password) {
      updateData.password = await bcrypt.hash(req.body.password, 10);
    }

    // Handle admin status if requester is admin
    if (req.user.admin && req.body.admin !== undefined) {
      updateData.admin = req.body.admin;
    }

    console.log("Final update data:", updateData);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) {
      return next(errorHandler(404, "User not found"));
    }

    // Create a new JWT token with updated user info
    const accessToken = jwt.sign(
      {
        id: updatedUser.id,
        username: updatedUser.username,
        admin: updatedUser.admin,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    // Set the new token in cookies
    res.cookie("jwt", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000,
    });

    const updatedUserWithoutPassword = updatedUser.toObject();
    delete updatedUserWithoutPassword.password;

    return res.status(200).json({
      message: "user updated successfully",
      updatedUser: updatedUserWithoutPassword,
    });
  } catch (err) {
    console.error("Error in updateUser:", err);
    next(err);
  }
};

const updateUserProfile=async(req,res,next)=>{
 try{
  if (!req.file){
    return next(errorHandler(400,"no profule picture"))
  }
  const userId=req.user.id
  const updatedUser=await User.findByIdAndUpdate(
    userId,
    {profilePicture:req.file.path},
    {new:true}
  )
  if (!updatedUser) {
    return next(errorHandler(404, "User not found"));
  }

  // Convert to plain object and remove password
  const userWithoutPassword = updatedUser.toObject();
  delete userWithoutPassword.password;

  res.status(200).json({
    message: "Profile picture updated successfully",
    user: userWithoutPassword,
  });
} catch (error) {
  next(error);
}

}

const deleteUser = async (req, res, next) => {
  const userId = req.params.userId;
  if (req.user.id !== userId && !req.user.admin) {
    return next(errorHandler(403, "you can delete only your account"));
  }
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    // Convert to plain object and remove password
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res.status(200).json({
      message: "user deleted successfully",
      user: userWithoutPassword,
    });
  } catch (err) {
    next(err);
  }
};




module.exports = {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateUserProfile
};
