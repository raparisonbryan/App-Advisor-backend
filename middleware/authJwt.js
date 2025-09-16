require("dotenv").config();

const jwt = require("jsonwebtoken");
const User = require("../Models/UserModel");
const secret = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  let token = req.headers["authorization"];

  if (token && token.startsWith("Bearer ")) {
    token = token.slice(7, token.length);
  }

  if (!token) {
    return res.status(403).send({ message: "Aucun token fourni!" });
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Accès refusé!",
        error: err.message,
      });
    }
    req.userId = decoded.userId;
    next();
  });
};

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).send({ message: "Utilisateur non trouvé!" });
    }

    if (!user.Admin) {
      return res.status(403).send({ message: "Accès admin requis!" });
    }

    next();
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const isOwnerOrAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).send({ message: "Utilisateur non trouvé!" });
    }

    if (user.Admin) {
      return next();
    }

    if (req.userId !== req.params.id) {
      return res.status(403).send({
        message: "Vous ne pouvez modifier que votre propre profil!",
      });
    }

    next();
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const authJwt = {
  verifyToken,
  isAdmin,
  isOwnerOrAdmin,
};
module.exports = authJwt;
