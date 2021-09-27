const jwt = require("jsonwebtoken");
require("dotenv").config();
const secretPhrase = process.env.SECRET_TOKEN_PHRASE;

module.exports = function (req, res, next) {
  const auth = req.headers.authorization;

  if (!auth) return res.status(401).json({ message: "Auth Error Header" });

  const token = auth.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Auth Error" });

  try {
    const decoded = jwt.verify(token, secretPhrase);
    req.user = decoded.user;
    next();
  } catch (e) {
    console.error(e);
    res.status(402).send({ message: "Invalid Token" });
  }
};
