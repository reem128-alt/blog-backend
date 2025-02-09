const errorHandler = require("./error");
const jwt = require("jsonwebtoken");

const verifyJwt = async (req, res, next) => {
  const token = req.cookies.jwt;
  console.log(req.cookies.jwt);
  if (!token) {
    return next(errorHandler(401, "unauthorized"));
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return next(errorHandler(401, "unauthorized"));
    }
    req.user = decoded;
    console.log(decoded);
    next();
  });
};

module.exports = verifyJwt;
