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

    if (!hasUpperCase) {
        errors.push("au moins une lettre majuscule");
    }
    if (!hasLowerCase) {
        errors.push("au moins une lettre minuscule");
    }
    if (!hasNumbers) {
        errors.push("au moins un chiffre");
    }
    if (!hasSymbols) {
        errors.push("au moins un symbole spécial");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            msg: `Le mot de passe doit contenir : ${errors.join(", ")}`
        });
    }

    next();
};

module.exports = { validatePassword };