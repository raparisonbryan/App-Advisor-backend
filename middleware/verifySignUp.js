const userModel = require("../Models/UserModel");

const validatePassword = (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      msg: "Le mot de passe est requis"
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      msg: "Le mot de passe doit contenir au moins 8 caractères"
    });
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSymbols = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const errors = [];

  if (!hasUpperCase) errors.push("au moins une lettre majuscule");
  if (!hasLowerCase) errors.push("au moins une lettre minuscule");
  if (!hasNumbers) errors.push("au moins un chiffre");
  if (!hasSymbols) errors.push("au moins un symbole spécial");

  if (errors.length > 0) {
    return res.status(400).json({
      msg: `Le mot de passe doit contenir : ${errors.join(", ")}`
    });
  }

  next();
};

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
  checkDuplicateUsernameOrEmail,
  validatePassword
};

module.exports = verifySignUp;