const jwt = require("jsonwebtoken");

const constants = require("../constants/constants");

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if(!authHeader){
        const error = new Error("missing headers.");
        error.statusCode = 401;
        throw error;
    }
  const token = authHeader.split(" ")[1];
  let decodeToken;
  try {
    decodeToken = jwt.verify(token, constants.jwtSecret);
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodeToken) {
    const error = new Error("not authenticated.");
    error.statusCode = 500;
    throw error;
  }
  req.uderId = decodedToken.userId;
  next();
};

