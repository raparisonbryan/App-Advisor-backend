const userModel = require("../Models/UserModel");

const checkDuplicateUsernameOrEmail = async (req, res, next) => {
  try {
    const userByName = await userModel.findOne({ name: req.body.name });
    if (userByName) {
      return res.status(400).json({ msg: "Nom d'utilisateur déjà utilisé" });
    }

    const userByEmail = await userModel.findOne({ email: req.body.email });
    if (userByEmail) {
      return res.status(400).json({ msg: "Adresse mail déjà utilisée" });
    }

    next();
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const verifySignUp = {
  checkDuplicateUsernameOrEmail
};

module.exports = verifySignUp;