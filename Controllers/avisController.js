const avisModel = require("../Models/Avis");

const getManyAvis = async (request, response) => {
    try {
        const result = await avisModel.find().populate('user', 'name').populate('outils', 'name imageURL _id'); 
        response.send(result);
    } catch (error) {
        console.log(error);
        response.status(500).json({ error: error.message });
    }
}

const getByIdAvis = async (request, response) => {
    try {
        const result = await avisModel.findById(request.params.id).populate('user', 'name').populate('outils', 'name imageURL _id');
        if (!result) {
            return response.status(404).send('Avis not found');
        }
        response.send(result);
    } catch (error) {
        console.log(error);
        response.status(500).json({ error: error.message });
    }
}

const getAvisByOutilId = async (request, response) => {
    try {
        const result = await avisModel.find({ outils: request.params.id }).populate('user', 'name').populate('outils', 'name imageURL _id');
        if (result.length === 0) {
            return response.status(404).json({ error: 'Aucun avis trouvé pour cet outil' });
        }
        response.send(result);
    } catch (error) {
        console.log(error);
        response.status(500).json({ error: error.message });
    }
}

const postAvis = async (req, res) => {
    try {
        const userId = req.userId;
        const { outilId, ...inputAvis } = req.body;

        if (!userId || !outilId) {
            return res.status(400).send({ message: "L'utilisateur et l'outil doivent être spécifiés" });
        }
        
        const avis = new avisModel({
            ...inputAvis,
            user: userId,
            outils: outilId,
        });

        const savedAvis = await avis.save();
        res.status(201).send(savedAvis);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const putAvisById = async (request, response) => {
    try {
        const input = request.body;
        const result = await avisModel.findByIdAndUpdate(request.params.id, input, { new: true });
        if (!result) {
            return response.status(404).json({ error: "Avis non trouvé" });
        }
        response.send(result);
    } catch (error) {
        console.log(error);
        response.status(500).json({ error: error.message });
    }
}

const deleteManyAvis = async (request, response) => {
    try {
        const input = request.body;
        const result = await avisModel.deleteMany(input);
        response.send(result);
    } catch (error) {
        console.log(error);
        response.status(500).json({ error: error.message });
    }
}

const deleteByIdAvis = async (request, response) => {
    try {
        const result = await avisModel.findByIdAndDelete(request.params.id);
        if (!result) {
            return response.status(404).json({ error: "Avis non trouvé" });
        }
        response.send(result);
    } catch (error) {
        console.log(error);
        response.status(500).json({ error: error.message });
    }
}

let avis = {
    getManyAvis,
    getByIdAvis,
    postAvis,
    putAvisById,
    deleteManyAvis,
    deleteByIdAvis,
    getAvisByOutilId
};

module.exports = avis;
