const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(404).json({ message: "No token provided" });
  }
  jwt.decode(token, { complete: true }, (err, decode) => {
    if (err || !decode) {
      return res.status(403).json({ message: "Failed to decode token" });
    }
  });
  const secret =
    decoded.payload.role === "admin"
      ? process.env.ADMIN_SECRET
      : process.env.USER_SECRET;

  jwt.verify(token, secret, (err, decode) => {
    if (err) {
      return res.status(402).json({ message: "Error in Autenticatting Token" });
    } else {
      req.user = decode;
    }
  });
  next();
};

const authorizeRole = (...role) => {
  return (req, res, next) => {
    if (!role.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

module.exports = { auth, authorizeRole };
