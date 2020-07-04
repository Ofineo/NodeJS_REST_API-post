const jwt = require("jsonwebtoken");

const constants = require("../constants/constants");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error = new Error("missing headers.");
    error.statusCode = 401;
    throw error;
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, constants.jwtSecret);
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    const error = new Error("not authenticated.");
    error.statusCode = 500;
    throw error;
  }
  req.userId = decodedToken.userId;
  next();
};
