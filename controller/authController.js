const User = require("../model/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const errorHandler = require("../middleware/error");

const signup = async (req, res, next) => {
  const { email, username, password } = req.body;
  console.log(req.body);
  if (!email || !username || !password) {
    return next(errorHandler(400, "please enter all fields"));
  }
  try {
    // Check if username or email already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      if (existingUser.username === username) {
        return next(errorHandler(400, "Username already exists"));
      }
      if (existingUser.email === email) {
        return next(errorHandler(400, "Email already exists"));
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      username,
      password: hashedPassword,
    });
    const accessToken = jwt.sign(
      {
        id: existingUser.id,
        username: existingUser.username,
        admin: existingUser.admin,
        email:existingUser.email,
        profilePicture:existingUser.profilePicture
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    // Set cookie with proper options for persistence
    res.cookie("jwt", accessToken, {
      httpOnly: true, // Prevents JavaScript access to the cookie
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "strict", // Protects against CSRF
      maxAge: 60 * 60 * 1000, // 1 hour in milliseconds (matching token expiry)
      domain: '.onrender.com'
    });
    return res.status(200).json({ message: "user created successfully", user });
  } catch (err) {
    next(err);
  }
};

const signin = async (req, res, next) => {
  const { email, password } = req.body;
  console.log(req.body);
  if (!email || !password) {
    return next(errorHandler(400, "please enter all fields"));
  }
  try {
    const foundUser = await User.findOne({ email });
    if (!foundUser) {
      return next(errorHandler(404, "user not found"));
    }
    const validPassword = await bcrypt.compare(password, foundUser.password);
    if (!validPassword) {
      return next(errorHandler(401, "incorrect email or password"));
    }
    const accessToken = jwt.sign(
      {
        id: foundUser.id,
        username: foundUser.username,
        admin: foundUser.admin,
        email:foundUser.email,
        profilePicture:foundUser.profilePicture
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    // Set cookie with proper options for persistence
    res.cookie("jwt", accessToken, {
      httpOnly: true, // Prevents JavaScript access to the cookie
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "strict", // Protects against CSRF
      maxAge: 60 * 60 * 1000, // 1 hour in milliseconds (matching token expiry)
      path: '/'
    });
    
    const { password: pass, ...userWithoutPassword } = foundUser._doc;
    return res.status(200).json({
      message: "Signed in successfully",
      user: userWithoutPassword,
    });
  } catch (err) {
    next(err);
  }
};
const signout = async (req, res, next) => {
  try {
    res
      .clearCookie("jwt")
      .status(200)
      .json({ message: "user signed out successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = { signin, signup,signout};
