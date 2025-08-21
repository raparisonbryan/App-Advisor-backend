const avisModel = require("../Models/Avis");
const outilModel = require("../Models/Outil");
const { calculerMoyennesOutil } = require("../utils/statistiques");
const { logger } = require("../utils/logger");

const getManyAvis = async (request, response) => {
  try {
    let query = avisModel.find();
    if (query && typeof query.populate === "function") {
      query = query.populate("user", "name");
      if (query && typeof query.populate === "function") {
        query = query.populate("outils", "name imageURL _id");
      }
    }
    const result = await query;
    response.send(result);
  } catch (error) {
    logger.error("Error in getManyAvis", {
      error: error.message,
      stack: error.stack,
    });
    response.status(500).json({ error: error.message });
  }
};

const getByIdAvis = async (request, response) => {
  try {
    let query = avisModel.findById(request.params.id);
    if (query && typeof query.populate === "function") {
      query = query.populate("user", "name");
      if (query && typeof query.populate === "function") {
        query = query.populate("outils", "name imageURL _id");
      }
    }
    const result = await query;
    if (!result) {
      return response.status(404).send("Avis introuvable");
    }
    response.send(result);
  } catch (error) {
    logger.error("Error in getByIdAvis", {
      error: error.message,
      stack: error.stack,
    });
    response.status(500).json({ error: error.message });
  }
};

const getAvisByOutilId = async (request, response) => {
  try {
    let query = avisModel.find({ outils: request.params.id });
    if (query && typeof query.populate === "function") {
      query = query.populate("user", "name");
      if (query && typeof query.populate === "function") {
        query = query.populate("outils", "name imageURL _id");
      }
    }
    const result = await query;
    if (result.length === 0) {
      return response
        .status(404)
        .json({ error: "Aucun avis trouvé pour cet outil" });
    }
    response.send(result);
  } catch (error) {
    logger.error("Error in getAvisByOutilId", {
      error: error.message,
      stack: error.stack,
    });
    response.status(500).json({ error: error.message });
  }
};

const postAvis = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      outilId,
      note,
      difficulte,
      performance,
      flexibilite,
      ...inputAvis
    } = req.body;

    if (!userId || !outilId) {
      return res
        .status(400)
        .send({ message: "L'utilisateur et l'outil doivent être spécifiés" });
    }

    if (
      note < 0 ||
      note > 20 ||
      difficulte < 0 ||
      difficulte > 20 ||
      performance < 0 ||
      performance > 20 ||
      flexibilite < 0 ||
      flexibilite > 20
    ) {
      return res.status(400).send({
        message: "Toutes les notes doivent être comprises entre 0 et 20",
      });
    }

    const avis = new avisModel({
      ...inputAvis,
      note,
      difficulte,
      performance,
      flexibilite,
      user: userId,
      outils: outilId,
    });

    const savedAvis = await avis.save();

    await outilModel.findByIdAndUpdate(outilId, {
      $push: { avis: savedAvis._id },
    });

    await calculerMoyennesOutil(outilId);

    res.status(201).send(savedAvis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const putAvisById = async (request, response) => {
  try {
    const input = request.body;
    const avis = await avisModel.findById(request.params.id);

    if (!avis) {
      return response.status(404).json({ error: "Avis non trouvé" });
    }

    if (input.note !== undefined && (input.note < 0 || input.note > 20)) {
      return response
        .status(400)
        .json({ error: "La note doit être comprise entre 0 et 20" });
    }
    if (
      input.difficulte !== undefined &&
      (input.difficulte < 0 || input.difficulte > 20)
    ) {
      return response
        .status(400)
        .json({ error: "La difficulté doit être comprise entre 0 et 20" });
    }
    if (
      input.performance !== undefined &&
      (input.performance < 0 || input.performance > 20)
    ) {
      return response
        .status(400)
        .json({ error: "La performance doit être comprise entre 0 et 20" });
    }
    if (
      input.flexibilite !== undefined &&
      (input.flexibilite < 0 || input.flexibilite > 20)
    ) {
      return response
        .status(400)
        .json({ error: "La flexibilité doit être comprise entre 0 et 20" });
    }

    const result = await avisModel.findByIdAndUpdate(request.params.id, input, {
      new: true,
    });

    await calculerMoyennesOutil(avis.outils);

    response.send(result);
  } catch (error) {
    logger.error("Error in function", {
      error: error.message,
      stack: error.stack,
    });
    response.status(500).json({ error: error.message });
  }
};

const deleteManyAvis = async (request, response) => {
  try {
    const { ids } = request.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return response.status(400).json({
        error: "Le champ 'ids' doit être un tableau non vide d'identifiants",
      });
    }

    const mongoose = require("mongoose");
    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));

    if (validIds.length !== ids.length) {
      return response.status(400).json({
        error: "Certains identifiants ne sont pas valides",
      });
    }

    const result = await avisModel.deleteMany({ _id: { $in: validIds } });
    response.send(result);
  } catch (error) {
    logger.error("Error in function", {
      error: error.message,
      stack: error.stack,
    });
    response.status(500).json({ error: error.message });
  }
};

const deleteByIdAvis = async (request, response) => {
  try {
    const avis = await avisModel.findById(request.params.id);
    if (!avis) {
      return response.status(404).json({ error: "Avis non trouvé" });
    }

    if (avis.outils) {
      await outilModel.findByIdAndUpdate(avis.outils, {
        $pull: { avis: request.params.id },
      });
    }

    const result = await avisModel.findByIdAndDelete(request.params.id);

    if (avis.outils) {
      const outilExists = await outilModel.findById(avis.outils);
      if (outilExists) {
        await calculerMoyennesOutil(avis.outils);
      }
    }

    response.send(result);
  } catch (error) {
    logger.error("Error in function", {
      error: error.message,
      stack: error.stack,
    });
    response.status(500).json({ error: error.message });
  }
};

let avis = {
  getManyAvis,
  getByIdAvis,
  postAvis,
  putAvisById,
  deleteManyAvis,
  deleteByIdAvis,
  getAvisByOutilId,
};

module.exports = avis;
