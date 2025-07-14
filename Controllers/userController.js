const userModel = require("../Models/UserModel");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const secret = process.env.JWT_SECRET;

const getManyUser = async (request, response) => {
    try {
        const result = await userModel.find();
        response.send(result);
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: error.message });
    }
}

const getByIdUser = async (request, response) => {
    try {
      const result = await userModel.findById(request.params.id);
      if (!result) {
        return response.status(404).send('Utilisateur introuvable');
      }
      response.send(result);
    } catch (error) {
      console.error(error);
      response.status(500).send('Une erreur est survenue lors de la récupération de l\'utilisateur');
    }
};
  

const getBymailUser = async (request, response) => {
    const result = await userModel.findOne({ email: request.params.email });
    response.send(result);
}

const postUser = async (request, response) => {
    try {
        const input = request.body;
        const user = new userModel(input);
        const savedUser = await user.save();
        response.status(201).send(savedUser);
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
}

const putManyUser = async (request, response) => {
    const { ids, input } = request.body;
    const result = await userModel.updateMany({ _id: { $in: ids } }, input);
    response.send(result);
};

const putUserById = async (request, response) => {
    const input = request.body;
    const result = await userModel.findByIdAndUpdate(request.params.id, input, { new: true });
    response.send(result);
}

const deleteManyUser = async (request, response) => {
    const input = request.body;
    const result = await userModel.deleteMany(input);
    response.send(result);
}

const deleteByIdUser = async (request, response) => {
    try {
        const userId = request.params.id;
        await require("../Models/Avis").deleteMany({ user: userId });
        const result = await userModel.findByIdAndDelete(userId);

        if (!result) {
            return response.status(404).json({ error: "Utilisateur non trouvé" });
        }

        response.json({ message: "Utilisateur et ses avis supprimés avec succès" });
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: error.message });
    }
}

const signup = async (request, response) => {
    try {
        let input = request.body;
        input.password = await bcrypt.hash(input.password, 10);
        const newUser = new userModel(input);
        const result = await newUser.save();
        return response.status(201).json(result);
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        return response.status(500).json({ msg: "Erreur lors de l'inscription", error: error.message });
    }
};

const signin = async (request, response) => {
    let input = request.body;
    let userExist = await userModel.findOne({ email: input.email });
    if (!userExist) {
        return response.status(404).json({ msg: "Utilisateur introuvable" });
    }
    const validPass = await bcrypt.compare(input.password, userExist.password);
    if (!validPass) {
        return response.status(400).json({ msg: "Mot de passe incorrect" });
    }
    const token = jwt.sign({ userId: userExist._id }, secret, {
        expiresIn: "24h",
    });
    response.cookie("token", token, { 
        httpOnly: true,
        sameSite: 'strict',
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
     }); 
    return response.status(200).json({
        user: {
            _id: userExist._id,
            name: userExist.name,
            email: userExist.email,
            Admin: userExist.Admin
        },
        token,
        message: "Connexion réussie"
    });
}

const getCurrentUser = async (request, response) => {
    try {
        const user = await userModel.findById(request.userId).select('-password');
        response.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            Admin: user.Admin
        });
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
};

const userController = {
    getManyUser,
    getByIdUser,
    postUser,
    putManyUser,
    putUserById,
    deleteManyUser,
    deleteByIdUser,
    getBymailUser,
    signin,
    signup,
    getCurrentUser
};

module.exports = userController;
